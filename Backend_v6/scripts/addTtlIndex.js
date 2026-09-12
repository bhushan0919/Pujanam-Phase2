// backend/scripts/addTtlIndex.js

const mongoose = require('mongoose');
require('dotenv').config();

const addTtlIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Booking = require('../models/Booking');
    
    // Drop existing expiresAt index if any
    await Booking.collection.dropIndex('expiresAt_1').catch(() => {});
    
    // Create TTL index (auto-delete after expiresAt date)
    await Booking.collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: 'ttl_expires_at' }
    );
    
    console.log('✅ TTL index created on expiresAt field');
    
    // Also create compound index for cleanup queries
    await Booking.collection.createIndex(
      { paymentStatus: 1, status: 1, createdAt: 1 },
      { name: 'cleanup_abandoned' }
    );
    
    console.log('✅ Compound index created for cleanup');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

addTtlIndex();