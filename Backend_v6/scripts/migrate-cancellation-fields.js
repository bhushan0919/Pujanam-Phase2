// backend/scripts/migrate-cancellation-fields.js

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

async function migrateCancellationFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all cancelled bookings without cancelledBy field
    const cancelledBookings = await Booking.find({
      status: 'cancelled',
      cancelledBy: { $exists: false }
    });
    
    console.log(`Found ${cancelledBookings.length} cancelled bookings without cancellation metadata`);
    
    for (const booking of cancelledBookings) {
      // Try to infer who cancelled based on available data
      let cancelledBy = 'system';
      
      // If there's a refund, it was likely an admin or user cancellation
      if (booking.refundId || booking.refundStatus === 'completed') {
        cancelledBy = 'admin'; // Admin cancellations process refunds
      } else if (booking.paymentStatus === 'refunded') {
        cancelledBy = 'admin';
      } else {
        cancelledBy = 'user'; // Assume user cancellation
      }
      
      booking.cancelledBy = cancelledBy;
      booking.cancelledAt = booking.updatedAt || booking.createdAt;
      booking.cancelledAtHours = -1; // Unknown
      booking.cancellationReason = 'Legacy cancellation (migrated)';
      
      await booking.save();
      console.log(`✅ Updated booking ${booking._id}: cancelledBy = ${cancelledBy}`);
    }
    
    console.log('Migration complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateCancellationFields();
