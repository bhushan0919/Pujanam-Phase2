// backend/models/ContactMessage.js

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: null,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'spam'],
    default: 'unread'
  },
  adminNote: {
    type: String,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ ip: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);