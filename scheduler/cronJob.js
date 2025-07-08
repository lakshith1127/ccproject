const cron = require("node-cron");
const db = require("../firebaseAdmin");
const sendEmail = require("../utils/sendEmail");

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const snapshot = await db.collection("events").get();
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  for (const event of events) {
    const eventTime = new Date(event.date);
    const diff = Math.abs(eventTime - oneHourLater) / 60000;

    if (diff <= 1 && !event.notified) {
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
