require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const eventsRoute = require("./routes/events");
app.use("/api/events", eventsRoute);

const sendReminderEmail = require("./utils/sendEmail");

app.get("/test-email", async (req, res) => {
  try {
    await sendReminderEmail(
      "your-email@gmail.com",
      "✅ Test Email",
      "This is a test."
    );
    res.send("✅ Test email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error); // <--- Add this line
    res.status(500).send("❌ Failed to send email");
  }
});

// Start CRON job
require("./scheduler/cronJob");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
