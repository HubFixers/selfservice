const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 150
  },
  price: {
    type: Number,
    required: true
  },
  priceUnit: {
    type: String,
    default: 'hour',
    enum: ['hour', 'session', 'project']
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);