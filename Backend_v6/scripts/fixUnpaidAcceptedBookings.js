// backend/scripts/fixUnpaidAcceptedBookings.js

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

const fixUnpaidAcceptedBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find accepted/completed bookings without payment
    const problematicBookings = await Booking.find({
      status: { $in: ['accepted', 'confirmed', 'completed'] },
      paymentStatus: { $ne: 'completed' }
    });
    
    console.log(`Found ${problematicBookings.length} problematic bookings (accepted but unpaid)`);
    
    for (const booking of problematicBookings) {
      console.log(`\n📋 Booking ${booking._id}:`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Payment Status: ${booking.paymentStatus}`);
      console.log(`   Customer: ${booking.name}`);
      console.log(`   Amount: ${booking.price}`);
      
      // Revert status to pending/notified
      const originalStatus = booking.status;
      booking.status = booking.panditId ? 'pending' : 'notified';
      booking.panditId = null; // Remove pandit assignment
      booking.acceptedAt = null;
      
      await booking.save();
      
      console.log(`   ✅ Reverted status from ${originalStatus} to ${booking.status}`);
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${problematicBookings.length} bookings`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixUnpaidAcceptedBookings();