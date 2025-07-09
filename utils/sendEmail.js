require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// To send plain text or HTML emails
const sendReminderEmail = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: `"Event Scheduler" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    ...(html && { html }), // Optional HTML support
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendReminderEmail;
