const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   POST /api/migrate/booking-fields
// @desc    Migrate old giftCardImage field to paymentProofImage
// @access  Public (temporary migration route)
router.post('/booking-fields', async (req, res) => {
  try {
    console.log('Starting booking field migration...');
    
    // Find all bookings that have giftCardImage but not paymentProofImage
    const bookingsToMigrate = await Booking.find({
      giftCardImage: { $exists: true, $ne: '' },
      paymentProofImage: { $exists: false }
    });

    console.log(`Found ${bookingsToMigrate.length} bookings to migrate`);

    let migratedCount = 0;
    for (const booking of bookingsToMigrate) {
      booking.paymentProofImage = booking.giftCardImage;
      await booking.save();
      migratedCount++;
      console.log(`Migrated booking ${booking._id}`);
    }

    // Also add default values for new fields if they don't exist
    const bookingsNeedingDefaults = await Booking.find({
      $or: [
        { hoursNeeded: { $exists: false } },
        { serviceRate: { $exists: false } },
        { totalAmount: { $exists: false } }
      ]
    }).populate('service');

    console.log(`Found ${bookingsNeedingDefaults.length} bookings needing default values`);

    let defaultsCount = 0;
    for (const booking of bookingsNeedingDefaults) {
      let updated = false;
      
      if (!booking.hoursNeeded) {
        booking.hoursNeeded = 1;
        updated = true;
      }
      
      if (!booking.serviceRate && booking.service) {
        booking.serviceRate = booking.service.price;
        updated = true;
      }
      
      if (!booking.totalAmount) {
        const rate = booking.serviceRate || (booking.service ? booking.service.price : 0);
        const hours = booking.hoursNeeded || 1;
        booking.totalAmount = rate * hours;
        updated = true;
      }
      
      if (updated) {
        await booking.save();
        defaultsCount++;
        console.log(`Added defaults to booking ${booking._id}`);
      }
    }

    res.json({
      message: 'Migration completed successfully',
      migratedFields: migratedCount,
      addedDefaults: defaultsCount,
      totalProcessed: migratedCount + defaultsCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      message: 'Migration failed', 
      error: error.message 
    });
  }
});

module.exports = router;