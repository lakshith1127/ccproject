const cron = require("node-cron");
const db = require("../firebaseAdmin");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const nowIST = moment().tz("Asia/Kolkata");
  const oneHourLater = nowIST.clone().add(1, "hour");

  console.log(
    `[NODE-CRON] Running at IST: ${nowIST.format("YYYY-MM-DD HH:mm:ss")}`
  );

  const snapshot = await db.collection("events").get();
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  for (const event of events) {
    const eventTime = moment(event.date.toDate()).tz("Asia/Kolkata");
    const diff = Math.abs(eventTime.diff(oneHourLater, "minutes"));

    console.log(`Checking event: ${event.title}`);
    console.log(`  → Event Time: ${eventTime.format("YYYY-MM-DD HH:mm:ss")}`);
    console.log(
      `  → One Hour Later: ${oneHourLater.format("YYYY-MM-DD HH:mm:ss")}`
    );
    console.log(`  → Difference in minutes: ${diff}`);
    console.log(`  → Notified: ${event.notified}`);

    if (diff <= 1 && !event.notified) {
      await sendEmail(
        event.email,
        `⏰ Reminder: ${event.title}`,
        `Your event "${event.title}" is scheduled at ${eventTime.format(
          "YYYY-MM-DD HH:mm:ss"
        )}.`
      );

      await db.collection("events").doc(event.id).update({ notified: true });
      console.log(`📨 Email sent to ${event.email}`);
    }
  }
});
