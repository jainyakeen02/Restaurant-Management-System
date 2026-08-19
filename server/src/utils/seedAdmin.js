require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const connectDB = require("../config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@dineops.com";
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Super Admin already exists in the database.");
      process.exit(0);
    }

    // Create Super Admin
    await User.create({
      name: "System Super Admin",
      email: adminEmail,
      password: adminPassword,
      role: "SUPER_ADMIN",
    });

    console.log("SUCCESS: Super Admin created securely!");
    process.exit(0);
  } catch (error) {
    console.error("ERROR: Failed to seed Super Admin:", error);
    process.exit(1);
  }
};

seedAdmin();
