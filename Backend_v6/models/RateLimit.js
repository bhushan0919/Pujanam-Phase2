// backend/models/RateLimit.js

const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 },
  firstRequest: { type: Date, default: Date.now },
  lastRequest: { type: Date, default: Date.now }
});

// Auto-expire after 1 hour
rateLimitSchema.index({ firstRequest: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);