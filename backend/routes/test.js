const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   GET /api/test/directories
// @desc    Test upload directories and list files
// @access  Public (for testing)
router.get('/directories', (req, res) => {
  try {
    const directories = [
      'uploads',
      'uploads/services',
      'uploads/giftcards',
      'receipts'
    ];

    const result = {};

    directories.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      
      if (fs.existsSync(fullPath)) {
        try {
          const files = fs.readdirSync(fullPath);
          result[dir] = {
            exists: true,
            files: files,
            count: files.length
          };
        } catch (error) {
          result[dir] = {
            exists: true,
            error: error.message
          };
        }
      } else {
        result[dir] = {
          exists: false
        };
      }
    });

    res.json({
      message: 'Directory status check',
      directories: result
    });

  } catch (error) {
    console.error('Directory test error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;