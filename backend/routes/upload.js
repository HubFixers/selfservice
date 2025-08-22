const express = require('express');
const upload = require('../config/multer');

const router = express.Router();

// @route   POST /api/upload/payment-proof
// @desc    Upload payment proof image
// @access  Public
router.post('/payment-proof', upload.single('paymentProof'), (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in payment-proof upload');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Payment proof file uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const fileUrl = `/uploads/giftcards/${req.file.filename}`;
    
    res.json({
      message: 'Payment proof uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Payment proof upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/upload/giftcard
// @desc    Upload gift card image (legacy support)
// @access  Public
router.post('/giftcard', upload.single('giftcard'), (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in giftcard upload');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Gift card file uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination,
      size: req.file.size
    });

    const fileUrl = `/uploads/giftcards/${req.file.filename}`;
    
    res.json({
      message: 'Gift card image uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Gift card upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/upload/service
// @desc    Upload service image
// @access  Private (Admin only)
router.post('/service', upload.single('serviceImage'), (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in service upload');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Service file uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination,
      size: req.file.size
    });

    const fileUrl = `/uploads/services/${req.file.filename}`;
    
    res.json({
      message: 'Service image uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Service upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;