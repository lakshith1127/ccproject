const cron = require("node-cron");
const db = require("../firebaseAdmin");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment-timezone");

// Schedule CRON job every minute
cron.schedule("* * * * *", async () => {
  const nowIST = moment().tz("Asia/Kolkata");
  const oneHourLater = nowIST.clone().add(1, "hour");

  console.log(
    `[NODE-CRON] Running at IST: ${nowIST.format("YYYY-MM-DD HH:mm:ss")}`
  );

  try {
    const snapshot = await db.collection("events").get();
    console.log("[FETCHED] documents count:", snapshot.size);

    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("[EVENTS DATA]:", events);

    for (const event of events) {
      if (!event.date || !event.email || !event.title) {
        console.log(`⚠️ Skipping invalid event with ID: ${event.id}`);
        continue;
      }

      const eventTime = moment(event.date.toDate()).tz("Asia/Kolkata");
      const diff = Math.abs(eventTime.diff(oneHourLater, "minutes"));

      console.log(
        `🔍 Checking event: ${event.title}, scheduled for ${eventTime.format(
          "YYYY-MM-DD HH:mm:ss"
        )}, diff: ${diff} mins`
      );

      if (diff <= 1 && !event.notified) {
        await sendEmail(
          event.email,
          `⏰ Reminder: ${event.title}`,
          `Your event "${event.title}" is scheduled at ${eventTime.format(
            "LLLL"
          )} (IST).`
        );

        await db.collection("events").doc(event.id).update({ notified: true });

        console.log(
          `📨 Email sent to ${event.email} for event "${event.title}"`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error in CRON job:", error);
  }
});
