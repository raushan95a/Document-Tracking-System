const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../config/mail");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const normalizeUsername = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const ensureUniqueUsername = async (requestedUsername, email) => {
  const emailPrefix = typeof email === "string" ? email.split("@")[0] : "user";
  const base = normalizeUsername(requestedUsername) || normalizeUsername(emailPrefix) || "user";
  let candidate = base;
  let counter = 1;

  while (await User.findOne({ username: candidate })) {
    candidate = `${base}_${counter}`;
    counter += 1;
  }

  return candidate;
};

const register = async (req, res) => {
  try {
    const { username, name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const resolvedUsername = await ensureUniqueUsername(username, email);

    const user = await User.create({
      username: resolvedUsername,
      name,
      email,
      password,
      role,
      department,
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send email with OTP
    try {
      const subject = "Your Login OTP - Document Tracking System";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50;">Login Verification</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You are trying to log in to the Document Tracking System. Use the following OTP to complete your login:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; color: #333;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
      `;
      await sendEmail(user.email, subject, html);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({ message: "Failed to send OTP email. Please try again." });
    }

    return res.status(200).json({
      message: "OTP sent to your email",
      otpRequired: true,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  getProfile,
  getAllUsers,
};
