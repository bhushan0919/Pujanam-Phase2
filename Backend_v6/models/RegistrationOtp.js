const mongoose = require('mongoose');

const registrationOtpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

registrationOtpSchema.index({ email: 1, phone: 1 });
// TTL index: MongoDB auto-deletes documents when expiresAt is reached
registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RegistrationOtp', registrationOtpSchema);