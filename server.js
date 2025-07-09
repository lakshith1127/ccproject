require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const eventsRoute = require("./routes/events");
app.use("/api/events", eventsRoute);

// Test Email Endpoint
const sendReminderEmail = require("./utils/sendEmail");
app.get("/test-email", async (req, res) => {
  try {
    await sendReminderEmail(
      "luckylaksh1127@gmail.com", // 🔁 Replace with your actual email for testing
      "✅ Test Email",
      "This is a test email from your Event Scheduler."
    );
    res.send("✅ Test email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send("❌ Failed to send email");
  }
});

// 🕓 Load and Start Cron Job
require("./scheduler/cronJob");

// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
