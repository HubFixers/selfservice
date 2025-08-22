const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// @route   GET /api/settings
// @desc    Get settings (retainer amount and payment instructions)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    res.json({
      retainerAmount: settings.retainerAmount,
      paymentInstructions: settings.paymentInstructions,
      businessInfo: settings.businessInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;