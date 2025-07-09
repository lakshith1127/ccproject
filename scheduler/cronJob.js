const cron = require("node-cron");
const db = require("../firebaseAdmin");
const sendEmail = require("../utils/sendEmail");

cron.schedule("* * * * *", async () => {
  console.log(`[NODE-CRON] Running at ${new Date().toLocaleTimeString()}`);

  const now = new Date();
  const snapshot = await db.collection("events").get();
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  for (const event of events) {
    const eventTime = new Date(event.date);
    const diff = (eventTime - now) / 60000;

    if (diff >= 59 && diff <= 61 && !event.notified) {
      await sendEmail(
        event.email,
        `⏰ Reminder: ${event.title}`,
        `Your event "${
          event.title
        }" is scheduled at ${eventTime.toLocaleString()}.`
      );

      await db.collection("events").doc(event.id).update({ notified: true });
      console.log(`📨 Email sent to ${event.email}`);
    }
  }
});
