const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
  try {
    let { name, email, password, phone, role } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = String(password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: role === "admin" ? "admin" : "user"
    });

    res.status(201).json({
      message: "Registration successful",
      token: createToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    email = email?.trim().toLowerCase();
    password = String(password || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        message: `This account is not registered as ${role}`
      });
    }

    res.status(200).json({
      message: "Login successful",
      token: createToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    
    await user.save();
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
