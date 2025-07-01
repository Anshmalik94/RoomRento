const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ msg: "Registration failed, please try again" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ msg: "Login failed, please try again" });
  }
});

// Google Login Route
router.post("/google-login", async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required from Google" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        password: "", 
        role: "renter", 
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("Google Login Error:", err);
    return res.status(500).json({ msg: "Google login failed, please try again" });
  }
});

module.exports = router;
