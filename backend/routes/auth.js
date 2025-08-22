const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    
    // If no admin user exists, create one with default credentials
    if (!user) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (email === adminEmail) {
        user = new User({
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
        });
        await user.save();
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Admin logout
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;