const cron = require("node-cron");
const db = require("../firebaseAdmin");
const sendEmail = require("../utils/sendEmail");
const moment = require("moment-timezone");

cron.schedule("* * * * *", async () => {
  const nowIST = moment().tz("Asia/Kolkata");
  const oneHourLater = nowIST.clone().add(1, "hour");

  console.log(
    "[NODE-CRON] Running at IST:",
    nowIST.format("YYYY-MM-DD HH:mm:ss")
  );

  try {
    const snapshot = await db.collection("events").get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("[DEBUG] Total events fetched:", events.length);

    for (const event of events) {
      if (!event.date || !event.email || !event.title) {
        console.log(`[SKIP] Missing fields in event: ${event.id}`);
        continue;
      }

      const eventTime = moment(event.date.toDate()).tz("Asia/Kolkata");
      const diff = Math.abs(eventTime.diff(oneHourLater, "minutes"));

      console.log(`[DEBUG] Comparing event "${event.title}":`);
      console.log(` - eventTime = ${eventTime.format("YYYY-MM-DD HH:mm")}`);
      console.log(
        ` - oneHourLater = ${oneHourLater.format("YYYY-MM-DD HH:mm")}`
      );
      console.log(` - diff = ${diff} mins | notified = ${event.notified}`);

      if (diff <= 1 && !event.notified) {
        try {
          await sendEmail(
            event.email,
            `⏰ Reminder: ${event.title}`,
            `Your event "${event.title}" is scheduled at ${eventTime.format(
              "YYYY-MM-DD HH:mm:ss"
            )} (IST).`
          );

          await db
            .collection("events")
            .doc(event.id)
            .update({ notified: true });
          console.log(`📨 Email sent to ${event.email}`);
        } catch (emailError) {
          console.error(
            `❌ Failed to send email to ${event.email}`,
            emailError
          );
        }
      }
    }
  } catch (err) {
    console.error("[CRON ERROR]", err);
  }
});
