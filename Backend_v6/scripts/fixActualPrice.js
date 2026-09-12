// backend/scripts/fixActualPrice.js

const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { extractNumericPrice } = require('../utils/priceUtils');
require('dotenv').config();

const fixActualPriceForBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find bookings with actualPrice = 0 or null but with price string
    const bookingsToFix = await Booking.find({
      $or: [
        { actualPrice: { $eq: 0 } },
        { actualPrice: { $exists: false } }
      ],
      price: { $ne: null, $ne: '' }
    });
    
    console.log(`Found ${bookingsToFix.length} bookings to fix`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const booking of bookingsToFix) {
      try {
        const extractedPrice = extractNumericPrice(booking.price);
        
        if (extractedPrice > 0) {
          booking.actualPrice = extractedPrice;
          await booking.save();
          fixedCount++;
          console.log(`✅ Fixed booking ${booking._id}: ${booking.price} → ${extractedPrice}`);
        } else {
          console.log(`⚠️ Could not extract price for booking ${booking._id}: ${booking.price}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`❌ Error fixing booking ${booking._id}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${fixedCount} bookings`);
    console.log(`   Errors: ${errorCount} bookings`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixActualPriceForBookings();