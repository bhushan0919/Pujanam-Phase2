// backend/utils/cleanupJobs.js

const cron = require('node-cron'); // npm install node-cron
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

/**
 * Clean up abandoned bookings (pending payment for > 24 hours)
 */
const cleanupAbandonedBookings = async () => {
  try {
    console.log('🧹 Running abandoned bookings cleanup...');
    
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find abandoned bookings
    const abandonedBookings = await Booking.find({
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: { $lt: cutoffTime }
    });
    
    if (abandonedBookings.length === 0) {
      console.log('No abandoned bookings found');
      return;
    }
    
    console.log(`Found ${abandonedBookings.length} abandoned bookings`);
    
    // Delete associated notifications first
    const bookingIds = abandonedBookings.map(b => b._id);
    const notificationsDeleted = await Notification.deleteMany({ 
      bookingId: { $in: bookingIds } 
    });
    console.log(`Deleted ${notificationsDeleted.deletedCount} associated notifications`);
    
    // Delete the bookings
    const result = await Booking.deleteMany({ 
      _id: { $in: bookingIds } 
    });
    
    console.log(`✅ Cleaned up ${result.deletedCount} abandoned bookings`);
    
    // Log for audit
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logEntry = {
      timestamp: new Date().toISOString(),
      deletedCount: result.deletedCount,
      bookingIds: bookingIds.map(id => id.toString()),
      reason: 'abandoned_payment'
    };
    
    fs.appendFileSync(
      path.join(logsDir, 'cleanup.log'),
      JSON.stringify(logEntry) + '\n'
    );
    
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
};

/**
 * Clean up expired verification codes (older than 2 hours)
 */
const cleanupExpiredCodes = async () => {
  try {
    const result = await Booking.updateMany(
      {
        verificationCode: { $ne: null },
        codeExpiresAt: { $lt: new Date() }
      },
      {
        $set: { verificationCode: null }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned up ${result.modifiedCount} expired verification codes`);
    }
  } catch (error) {
    console.error('❌ Code cleanup failed:', error);
  }
};

// Schedule jobs
const startCleanupJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Running scheduled cleanup...');
    cleanupAbandonedBookings();
    cleanupExpiredCodes();
  });
  
  console.log('✅ Scheduled cleanup jobs started');
};

module.exports = {
  cleanupAbandonedBookings,
  cleanupExpiredCodes,
  startCleanupJobs
};