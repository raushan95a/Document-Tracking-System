const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
if (process.env.NODE_ENV !== "test") {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Mail server connection error:", error);
    } else {
      console.log("Mail server is ready to take our messages");
    }
  });
}

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Document Tracking System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
