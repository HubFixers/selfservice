const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  retainerAmount: {
    type: Number,
    required: true,
    default: 50
  },
  paymentInstructions: {
    cashApp: {
      type: String,
      default: '$YourCashAppHandle'
    },
    paypal: {
      type: String,
      default: 'your-paypal@email.com'
    },
    bankTransfer: {
      accountName: {
        type: String,
        default: 'Your Business Name'
      },
      accountNumber: {
        type: String,
        default: '1234567890'
      },
      routingNumber: {
        type: String,
        default: '123456789'
      },
      bankName: {
        type: String,
        default: 'Your Bank Name'
      }
    }
  },
  businessInfo: {
    name: {
      type: String,
      default: 'Your Service Business'
    },
    email: {
      type: String,
      default: 'contact@yourbusiness.com'
    },
    phone: {
      type: String,
      default: '(555) 123-4567'
    },
    address: {
      type: String,
      default: '123 Business St, City, State 12345'
    }
  },
  emailConfig: {
    smtpHost: {
      type: String,
      default: 'smtp.gmail.com'
    },
    smtpPort: {
      type: Number,
      default: 587
    },
    smtpSecure: {
      type: Boolean,
      default: false
    },
    smtpUser: {
      type: String,
      default: ''
    },
    smtpPass: {
      type: String,
      default: ''
    },
    fromEmail: {
      type: String,
      default: ''
    },
    fromName: {
      type: String,
      default: 'ServicePro'
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  emailTemplates: {
    bookingConfirmation: {
      subject: {
        type: String,
        default: 'Booking Confirmation - {{bookingId}}'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    paymentConfirmation: {
      subject: {
        type: String,
        default: 'Payment Confirmed - {{bookingId}}'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    },
    bookingReminder: {
      subject: {
        type: String,
        default: 'Upcoming Appointment Reminder - {{serviceName}}'
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);