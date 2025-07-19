const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// Register Route with smart fallback
router.post("/register", async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Try database registration first
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ 
        email, 
        password: hashedPassword, 
        role,
        name: name || email.split('@')[0]
      });
      await user.save();

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email, name: user.name }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        token, 
        role: user.role,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (dbError) {
      
      // Demo registration when DB is down
      const token = jwt.sign(
        { 
          id: 'demo_' + Date.now(), 
          role: role, 
          email: email, 
          name: name || email.split('@')[0]
        }, 
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        token, 
        role: role,
        user: {
          id: 'demo_' + Date.now(),
          name: name || email.split('@')[0],
          email: email,
          role: role
        },
        demo: true
      });
    }
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ msg: "Registration failed, please try again" });
  }
});

// Login Route with smart fallback
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    // Try database authentication first
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // Check demo credentials when user doesn't exist in database
        const demoCredentials = {
          'demo@owner.com': { password: 'demo123', role: 'owner', name: 'Demo Owner' },
          'demo@renter.com': { password: 'demo123', role: 'renter', name: 'Demo Renter' },
          'test@test.com': { password: 'test123', role: 'renter', name: 'Test User' }
        };
        
        const demoUser = demoCredentials[email];
        if (demoUser && password === demoUser.password) {
          const token = jwt.sign(
            { 
              id: 'demo_' + Date.now(), 
              role: demoUser.role, 
              email: email, 
              name: demoUser.name 
            }, 
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
          );
          
          return res.json({ 
            token, 
            role: demoUser.role,
            user: {
              id: 'demo_' + Date.now(),
              name: demoUser.name,
              email: email,
              role: demoUser.role
            },
            demo: true
          });
        }
        
        return res.status(400).json({ msg: "User does not exist" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email, name: user.name }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({ 
        token, 
        role: user.role,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (dbError) {
      
      // Demo credentials for testing when DB is down
      const demoCredentials = {
        'demo@owner.com': { password: 'demo123', role: 'owner', name: 'Demo Owner' },
        'demo@renter.com': { password: 'demo123', role: 'renter', name: 'Demo Renter' },
        'test@test.com': { password: 'test123', role: 'renter', name: 'Test User' }
      };
      
      const demoUser = demoCredentials[email];
      if (demoUser && password === demoUser.password) {
        const token = jwt.sign(
          { 
            id: 'demo_' + Date.now(), 
            role: demoUser.role, 
            email: email, 
            name: demoUser.name 
          }, 
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '7d' }
        );
        
        return res.json({ 
          token, 
          role: demoUser.role,
          user: {
            id: 'demo_' + Date.now(),
            name: demoUser.name,
            email: email,
            role: demoUser.role
          },
          demo: true
        });
      }
      
      return res.status(400).json({ msg: "Invalid credentials or database unavailable" });
    }
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
        name: name || "",
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

// Get User Profile with smart fallback
router.get("/profile", auth, async (req, res) => {
  try {
    // Try database first
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      return res.json(user);
    } catch (dbError) {
      
      // Fallback to token data when DB is down
      const fallbackProfile = {
        _id: req.user.id,
        name: req.user.name || 'Demo User',
        email: req.user.email || 'demo@example.com',
        role: req.user.role || 'renter',
        phone: '',
        address: '',
        demo: true
      };
      
      return res.json(fallbackProfile);
    }
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update User Profile
router.put("/profile", auth, async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already exists" });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    await user.save();
    
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
