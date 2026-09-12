// models/Booking.js - FIXED VERSION
const mongoose = require('mongoose');
const { extractNumericPrice, isValidPriceForPayment } = require('../utils/priceUtils');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ✅ FIX 13: serviceId was required:true but pandit-only bookings don't have one
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: false },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' },
  dateTime: { type: Date, required: true },
  address: { type: String },
  userLocation: { type: String, default: 'Unknown' },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'notified', 'accepted', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Payment fields
  paymentId: { type: String, default: null },
  orderId: { type: String, default: null },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  advanceAmount: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String, default: null },
  refundStatus: {
    type: String,
    enum: ['not_applied', 'pending', 'completed', 'failed'],
    default: 'not_applied'
  },
  paymentMethod: { type: String, default: null },
  paidAt: { type: Date, default: null },

  price: { type: String },      // Display price like "₹1,099/-"
  actualPrice: { type: Number, default: 0 }, // Numeric price for calculations

  assignedPandit: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' },

  notifiedPandits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' }],

  location: String,
  expiryTime: Date,

  // Verification code for puja completion
  verificationCode: { type: String, default: null },
  codeGeneratedAt: { type: Date, default: null },
  codeExpiresAt: { type: Date, default: null },
  codeVerified: { type: Boolean, default: false },

   cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'pandit', 'system', null],
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledAtHours: {
    type: Number,
    default: null
  },
  cancellationRefundPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  cancellationRefundProcessed: {
    type: Boolean,
    default: false
  },expiresAt: {
    type: Date,
    default: null,
    index: { expireAfterSeconds: 0 } // MongoDB will auto-delete when this date is reached
  },

}, { timestamps: true });
bookingSchema.pre('save', function(next) {
  // If booking is pending payment and no expiry set, set to 30 minutes from now
  if (this.paymentStatus === 'pending' && this.status === 'pending' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    console.log(`⏰ Booking ${this._id} will expire at ${this.expiresAt}`);
  }

  // If payment is completed or booking is cancelled, remove expiry
  if ((this.paymentStatus === 'completed' || this.status === 'cancelled') && this.expiresAt) {
    this.expiresAt = null;
  }

  // Auto-calculate actualPrice from price string if not set
  if (this.price && !this.actualPrice) {
    this.actualPrice = extractNumericPrice(this.price);
    console.log(`📊 Auto-calculated actualPrice: ${this.actualPrice} from price: ${this.price}`);
  }

  next();
});

// ✅ Also add a cleanup job for older pending bookings without expiry
bookingSchema.statics.cleanupAbandonedBookings = async function() {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  const result = await this.deleteMany({
    paymentStatus: 'pending',
    status: 'pending',
    createdAt: { $lt: cutoffTime }
  });
  
  if (result.deletedCount > 0) {
    console.log(`🧹 Cleaned up ${result.deletedCount} abandoned bookings`);
  }
  
  return result;
};

bookingSchema.methods.isPayable = function() {
  return this.actualPrice > 0 && 
         this.paymentStatus !== 'completed' && 
         this.status !== 'cancelled' &&
         this.status !== 'completed';
};

// ✅ Add method to get advance amount
bookingSchema.methods.getAdvanceAmount = function() {
  return Math.round(this.actualPrice * 0.3);
};

// Indexes for efficient queries
bookingSchema.index({ panditId: 1, dateTime: 1 });
bookingSchema.index({ status: 1, userLocation: 1 });
bookingSchema.index({ customerId: 1, createdAt: -1 }); // ✅ FIX 14: Added index for customer booking lookups
bookingSchema.index({ email: 1 }); // ✅ FIX 15: Added index for guest booking lookups by email

module.exports = mongoose.model('Booking', bookingSchema);