const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  hoursNeeded: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  serviceRate: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'cancelled', 'completed'],
    default: 'unpaid'
  },
  retainerAmount: {
    type: Number,
    required: true
  },
  paymentProofImage: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);