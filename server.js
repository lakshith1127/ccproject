require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// API Route
const eventsRoute = require("./routes/events");
app.use("/api/events", eventsRoute);

// Test Email Route
const sendReminderEmail = require("./utils/sendEmail");

app.get("/test-email", async (req, res) => {
  try {
    await sendReminderEmail(
      "your-email@gmail.com", // 🔁 Replace with your real email to test
      "✅ Test Email",
      "This is a test."
    );
    res.send("✅ Test email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("❌ Failed to send email");
  }
});

// 🔁 Load CRON Job to start scheduled reminders
require("./scheduler/cronJob");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
