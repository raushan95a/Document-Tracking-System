const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Validate required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn(
    "⚠️  EMAIL_USER or EMAIL_PASS not configured. Email functionality will be unavailable."
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
  },
  // Connection timeout settings to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
  // Connection pooling for better reliability
  pool: {
    maxConnections: 1,
    maxMessages: Infinity,
    rateDelta: 1000,
    rateLimit: 5,
  },
  // Verify SMTP connection only if credentials are configured
  logger: process.env.NODE_ENV !== "test",
  debug: process.env.NODE_ENV === "development",
});

// Verify connection configuration
if (process.env.NODE_ENV !== "test" && process.env.EMAIL_USER) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Mail server connection error:", error.message);
      console.error(
        "Note: If using Gmail, ensure 'Less secure app access' is enabled or use an App Password"
      );
    } else {
      console.log("✓ Mail server is ready to take our messages");
    }
  });
}

const sendEmail = async (to, subject, html) => {
  try {
    // Check if credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials not configured. Set EMAIL_USER and EMAIL_PASS environment variables."
      );
    }

    const info = await transporter.sendMail({
      from: `"Document Tracking System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✓ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    
    // Provide helpful error guidance
    if (error.code === "ETIMEDOUT" || error.code === "ESOCKET") {
      console.error(
        "Network error: Check your internet connection and firewall settings."
      );
      console.error(
        "For Gmail SMTP: Ensure port 465 is not blocked. If issues persist, try port 587 with TLS."
      );
    } else if (error.code === "EAUTH") {
      console.error(
        "Authentication failed: Verify EMAIL_USER and EMAIL_PASS are correct."
      );
      console.error("For Gmail: Use an App Password instead of your regular password.");
    }

    throw error;
  }
};

module.exports = { sendEmail };
