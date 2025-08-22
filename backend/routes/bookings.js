const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Settings = require('../models/Settings');
const emailService = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      bookingDate,
      bookingTime,
      hoursNeeded,
      paymentProofImage,
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !serviceId || !bookingDate || !bookingTime || !hoursNeeded || !paymentProofImage) {
      return res.status(400).json({ message: 'Please provide all required fields including payment proof' });
    }

    // Validate hours needed
    if (hoursNeeded < 1 || hoursNeeded > 24) {
      return res.status(400).json({ message: 'Hours needed must be between 1 and 24' });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get retainer amount from settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Calculate total amount
    const serviceRate = service.price;
    const totalAmount = serviceRate * hoursNeeded;

    // Create booking
    const booking = new Booking({
      customerName,
      customerEmail,
      customerPhone,
      service: serviceId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      hoursNeeded: parseInt(hoursNeeded),
      serviceRate,
      totalAmount,
      retainerAmount: settings.retainerAmount,
      paymentProofImage,
      notes: notes || '',
      status: 'unpaid'
    });

    await booking.save();
    await booking.populate('service');

    // Send booking confirmation email
    try {
      const emailResult = await emailService.sendBookingConfirmation(booking, settings);
      if (emailResult.success) {
        console.log('Booking confirmation email sent successfully');
      } else {
        console.log('Failed to send booking confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      retainerAmount: settings.retainerAmount,
      paymentInstructions: settings.paymentInstructions
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/bookings/:id
// @desc    Update booking (for adding payment proof image)
// @access  Public
router.patch('/:id', async (req, res) => {
  try {
    const { paymentProofImage, giftCardImage } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Support both old and new field names for backward compatibility
    if (paymentProofImage) {
      booking.paymentProofImage = paymentProofImage;
      await booking.save();
    } else if (giftCardImage) {
      booking.paymentProofImage = giftCardImage;
      await booking.save();
    }

    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;