const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Service = require("../models/Service");
const Booking = require("../models/Booking");

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Booking.deleteMany();
    await Service.deleteMany();
    await User.deleteMany();

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      name: "Kreative Admin",
      email: "admin@kreative.com",
      password: adminPassword,
      phone: "7670941003",
      role: "admin"
    });

    const user = await User.create({
      name: "Hari",
      email: "hari@example.com",
      password: userPassword,
      phone: "9999999999",
      role: "user"
    });

    const services = await Service.insertMany([
      { name: "Haircut", description: "Classic salon haircut", price: 200, durationMinutes: 30 },
      { name: "Beard Trim", description: "Sharp beard trimming", price: 100, durationMinutes: 20 },
      { name: "Hair Wash", description: "Hair wash and dry", price: 150, durationMinutes: 20 },
      { name: "Head Massage", description: "Relaxing massage", price: 300, durationMinutes: 30 },
      { name: "Facial", description: "Basic facial treatment", price: 500, durationMinutes: 45 },
      { name: "Hair Coloring", description: "Color touch-up", price: 1000, durationMinutes: 90 }
    ]);

    await Booking.create({
      user: user._id,
      services: [services[0]._id, services[1]._id],
      appointmentDate: "2026-04-10",
      appointmentTime: "10:30 AM",
      notes: "Please keep it quick",
      totalAmount: services[0].price + services[1].price,
      status: "confirmed"
    });

    console.log("Seed data inserted successfully");
    console.log("Admin login: admin@kreative.com / admin123");
    console.log("User login: hari@example.com / user123");
    process.exit();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
