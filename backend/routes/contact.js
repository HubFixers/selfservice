const express = require('express');
const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const emailService = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create contact submission
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    });

    await contact.save();

    // Send notification email to admin
    try {
      const settings = await Settings.findOne();
      if (settings) {
        const emailResult = await emailService.sendContactNotification(contact, settings);
        if (emailResult.success) {
          console.log('Contact notification email sent successfully');
        } else {
          console.log('Failed to send contact notification email:', emailResult.error);
        }
      }
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError);
    }

    res.status(201).json({
      message: 'Thank you for your message! We will get back to you soon.',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;