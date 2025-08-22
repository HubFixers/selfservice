const express = require('express');
const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Settings = require('../models/Settings');
const Contact = require('../models/Contact');
const { adminAuth } = require('../middleware/auth');
const { generateReceipt } = require('../utils/pdfGenerator');
const upload = require('../config/multer');
const emailService = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/admin/bookings
// @desc    Get all bookings with filters
// @access  Private (Admin only)
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('service')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/bookings/:id/pay
// @desc    Mark booking as paid and generate receipt
// @access  Private (Admin only)
router.patch('/bookings/:id/pay', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'paid') {
      return res.status(400).json({ message: 'Booking is already marked as paid' });
    }

    // Update booking status
    booking.status = 'paid';
    booking.receiptGenerated = true;
    await booking.save();

    // Get settings for receipt generation
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }

    // Send payment confirmation email
    try {
      const emailResult = await emailService.sendPaymentConfirmation(booking, settings);
      if (emailResult.success) {
        console.log('Payment confirmation email sent successfully');
      } else {
        console.log('Failed to send payment confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
    }

    // Generate PDF receipt
    try {
      const receipt = await generateReceipt(booking, settings);
      
      res.json({
        message: 'Booking marked as paid, receipt generated, and confirmation email sent',
        booking,
        receipt: {
          filename: receipt.filename,
          downloadUrl: `/receipts/${receipt.filename}`
        }
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      res.json({
        message: 'Booking marked as paid and confirmation email sent (receipt generation failed)',
        booking
      });
    }

  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/services
// @desc    Get all services (including inactive)
// @access  Private (Admin only)
router.get('/services', adminAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/services
// @desc    Create new service
// @access  Private (Admin only)
router.post('/services', adminAuth, async (req, res) => {
  try {
    const { name, description, shortDescription, price, priceUnit, image } = req.body;

    if (!name || !description || !shortDescription || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const service = new Service({
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      price: parseFloat(price),
      priceUnit: priceUnit || 'hour',
      image: image || ''
    });

    await service.save();
    res.status(201).json({ message: 'Service created successfully', service });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/services/:id
// @desc    Update service
// @access  Private (Admin only)
router.put('/services/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, shortDescription, price, priceUnit, image, isActive } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Update fields
    if (name) service.name = name.trim();
    if (description) service.description = description.trim();
    if (shortDescription) service.shortDescription = shortDescription.trim();
    if (price) service.price = parseFloat(price);
    if (priceUnit) service.priceUnit = priceUnit;
    if (image !== undefined) service.image = image;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();
    res.json({ message: 'Service updated successfully', service });

  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/services/:id
// @desc    Delete service
// @access  Private (Admin only)
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get all settings
// @access  Private (Admin only)
router.get('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update settings
// @access  Private (Admin only)
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const { retainerAmount, paymentInstructions, businessInfo, emailConfig, emailTemplates } = req.body;

    if (retainerAmount !== undefined) settings.retainerAmount = retainerAmount;
    if (paymentInstructions) settings.paymentInstructions = { ...settings.paymentInstructions, ...paymentInstructions };
    if (businessInfo) settings.businessInfo = { ...settings.businessInfo, ...businessInfo };
    if (emailConfig) settings.emailConfig = { ...settings.emailConfig, ...emailConfig };
    if (emailTemplates) settings.emailTemplates = { ...settings.emailTemplates, ...emailTemplates };

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/test-email
// @desc    Test email configuration
// @access  Private (Admin only)
router.post('/test-email', adminAuth, async (req, res) => {
  try {
    const result = await emailService.testEmailConfiguration();
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully! Check your inbox.',
        success: true 
      });
    } else {
      res.status(400).json({ 
        message: 'Failed to send test email: ' + result.error,
        success: false 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error while testing email',
      success: false 
    });
  }
});

// @route   POST /api/admin/send-reminder/:id
// @desc    Send booking reminder email
// @access  Private (Admin only)
router.post('/send-reminder/:id', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(400).json({ message: 'Settings not configured' });
    }

    const result = await emailService.sendBookingReminder(booking, settings);
    
    if (result.success) {
      res.json({ 
        message: 'Reminder email sent successfully!',
        success: true 
      });
    } else {
      res.status(400).json({ 
        message: 'Failed to send reminder email: ' + result.error,
        success: false 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error while sending reminder',
      success: false 
    });
  }
});

// @route   GET /api/admin/contacts
// @desc    Get all contact submissions
// @access  Private (Admin only)
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/contacts/:id/read
// @desc    Mark contact as read
// @access  Private (Admin only)
router.patch('/contacts/:id/read', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.isRead = true;
    await contact.save();

    res.json({ message: 'Contact marked as read', contact });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/bookings/:id/payment-proof/download
// @desc    Download payment proof image
// @access  Private (Admin only)
router.get('/bookings/:id/payment-proof/download', adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', booking._id);
    console.log('Payment proof image:', booking.paymentProofImage);
    console.log('Gift card image (legacy):', booking.giftCardImage);

    // Check for payment proof image (new field) or gift card image (legacy field)
    const imageField = booking.paymentProofImage || booking.giftCardImage;
    
    if (!imageField) {
      console.log('No payment proof image found in booking');
      return res.status(404).json({ message: 'No payment proof uploaded for this booking' });
    }

    // Remove the leading slash if present
    const imagePath = imageField.startsWith('/') 
      ? imageField.substring(1) 
      : imageField;
    
    const fullPath = path.join(__dirname, '..', imagePath);
    console.log('Full file path:', fullPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('File does not exist at path:', fullPath);
      return res.status(404).json({ message: 'Payment proof file not found on server' });
    }

    console.log('File exists, preparing download');

    // Get file extension for proper content type
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
    }

    // Set headers for download
    const filename = `payment-proof-${booking._id}${ext}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);

    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error in payment proof download:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;