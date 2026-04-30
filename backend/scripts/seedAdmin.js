const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { DEPARTMENT_OPTIONS } = require("../constants/departments");
const connectDB = require("../config/db");

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "jayeshkr152005@gmail.com";
    // We assume the model hashes the password. If it uses pre("save"), create triggers it
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminUsername = process.env.ADMIN_USERNAME || "system_admin";

    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin account already exists. Skipping seed.");
      process.exit(0);
    }

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log(`User with email ${adminEmail} already exists. Skipping seed.`);
      process.exit(0);
    }

    await User.create({
      name: "System Admin",
      email: adminEmail,
      username: adminUsername,
      password: adminPassword,
      role: "admin",
      department: DEPARTMENT_OPTIONS[0] || "Information Technology",
    });

    console.log("Admin seeded successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();
