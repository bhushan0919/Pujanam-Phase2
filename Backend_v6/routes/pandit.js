// routes/pandit.js

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const panditController = require('../controllers/panditController');
const { authenticatePandit } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Pandit = require('../models/Pandit');
const Notification = require('../models/Notification');
const upload = require('../middleware/cloudinaryUpload');


// Apply pandit authentication to all routes
router.use(authenticatePandit);

// Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard request from pandit:', req.user.id);
    const Pandit = require('../models/Pandit');
    const Booking = require('../models/Booking');
    
    const panditId = req.user.id;
    
    // Get pandit details
    const pandit = await Pandit.findById(panditId).select('-password');
    
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.countDocuments({
      panditId,
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['accepted', 'confirmed'] }
    });
    
    // Get completed bookings
    const completedBookings = await Booking.find({
      panditId,
      status: 'completed'
    });

    // ✅ FIXED: Single totalEarnings calculation using actualPrice
    const totalEarnings = completedBookings.reduce((total, booking) => {
      return total + (booking.actualPrice || 0);
    }, 0);

    // Get upcoming bookings count
    const upcomingBookings = await Booking.countDocuments({
      panditId,
      dateTime: { $gte: new Date() },
      status: { $in: ['accepted', 'confirmed'] }
    });

    res.json({
      success: true,
      dashboard: {
        pandit,
        todayBookings,
        completedBookings: completedBookings.length,
        totalEarnings,
        upcomingBookings,
        totalBookings: completedBookings.length + todayBookings + upcomingBookings
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Error loading dashboard' });
  }
});

// Availability
router.patch('/availability', async (req, res) => {
  try {
    const { isOnline } = req.body;
    const panditId = req.user.id;
    
    const Pandit = require('../models/Pandit');
    const pandit = await Pandit.findByIdAndUpdate(
      panditId,
      { isOnline },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: `You are now ${isOnline ? 'online' : 'offline'}`,
      pandit
    });
  } catch (error) {
    console.error('Availability update error:', error);
    res.status(500).json({ success: false, message: 'Error updating availability' });
  }
});

// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const panditId = req.user.id;
    
    // Fetch all active notifications for this pandit
    const notifications = await Notification.find({
      panditId: panditId,
      expiresAt: { $gt: new Date() },
      isRead: false
    })
    .populate({
      path: 'bookingId',
      populate: {
        path: 'serviceId',
        select: 'name price duration category'
      }
    })
    .sort({ createdAt: -1 })
    .lean();
    
    // Filter out notifications where booking no longer exists or was cancelled/unpaid
    const validNotifications = notifications.filter(n => {
      if (!n.bookingId) return false;
      // Only show notifications for paid bookings (payment confirmed)
      const booking = n.bookingId;
      return booking.paymentStatus === 'completed' && booking.status !== 'cancelled';
    });
    
    console.log(`📊 Found ${validNotifications.length} valid (paid) notifications`);

    // Format to match what the frontend notification card expects
    const formatted = validNotifications.map(n => {
      const booking = n.bookingId;
      return {
        _id: n._id,
        notificationId: n._id,
        bookingId: booking._id,
        type: n.type,
        message: n.message,
        serviceName: booking.serviceId?.name || 'Puja Service',
        servicePrice: booking.serviceId?.price || booking.price || 'N/A',
        bookingDateTime: booking.dateTime,
        location: booking.userLocation || booking.location || 'Not specified',
        customerName: booking.name || 'Not provided',
        customerContact: booking.contact || 'Not provided',
        customerEmail: booking.email || '',
        price: booking.price || booking.serviceId?.price || 'N/A',
        contact: booking.contact || 'Not provided',
        address: booking.address || 'Not provided',
        message: booking.message || '',
        status: booking.status,
        createdAt: n.createdAt,
        expiresAt: n.expiresAt,
        isRead: n.isRead
      };
    });
    
    res.json({ success: true, notifications: formatted });
    
  } catch (error) {
    console.error('❌ Notifications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add to routes/pandit.js for testing
router.post('/notifications/test-create', async (req, res) => {
  try {
    const panditId = req.user.id;
    const { bookingId } = req.body;
    
    const Notification = require('../models/Notification');
    const Booking = require('../models/Booking');
    
    // Find a recent booking if no bookingId provided
    let targetBookingId = bookingId;
    if (!targetBookingId) {
      const recentBooking = await Booking.findOne().sort({ createdAt: -1 });
      if (recentBooking) {
        targetBookingId = recentBooking._id;
      } else {
        return res.status(404).json({ 
          success: false, 
          message: 'No bookings found' 
        });
      }
    }
    
    const notification = new Notification({
      panditId: panditId,
      bookingId: targetBookingId,
      type: 'booking_request',
      message: 'Test notification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    await notification.save();
    
    res.json({
      success: true,
      message: 'Test notification created',
      notification
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications/debug', async (req, res) => {
  try {
    const panditId = req.user.id;
    
    // Direct database query
    const Notification = require('../models/Notification');
    
    const allNotifications = await Notification.find({
      panditId: panditId
    }).lean();
    
    const now = new Date();
    
    res.json({
      success: true,
      panditId,
      currentTime: now,
      totalNotifications: allNotifications.length,
      notifications: allNotifications.map(n => ({
        _id: n._id,
        panditId: n.panditId,
        bookingId: n.bookingId,
        type: n.type,
        isRead: n.isRead,
        expiresAt: n.expiresAt,
        createdAt: n.createdAt,
        isExpired: now > new Date(n.expiresAt),
        hoursUntilExpiry: Math.round((new Date(n.expiresAt) - now) / (1000 * 60 * 60))
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
})
router.post('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const NotificationService = require('../utils/notificationService');
    
    const success = await NotificationService.markAsRead(id);
    
    if (success) {
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to mark notification as read' });
    }
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

;


router.get('/dashboard-stats', async (req, res) => {
  try {
    const panditId = req.user.id;

    console.log('📊 Fetching dashboard stats for pandit:', panditId);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current date for upcoming bookings
    const now = new Date();

    // Use Promise.all for parallel queries (faster)
    const [
      todayBookingsCount,
      completedBookings,
      upcomingBookingsCount,
      panditDetails,
      notificationsCount,
      paidBookings
    ] = await Promise.all([
      // Today's bookings
      Booking.countDocuments({
        panditId,
        dateTime: { $gte: today, $lt: tomorrow },
        status: { $in: ['accepted', 'confirmed'] }
      }),

      // Completed bookings (for earnings)
      Booking.find({
        panditId,
        status: 'completed'
      }).select('actualPrice'),

      // Upcoming bookings
      Booking.countDocuments({
        panditId,
        dateTime: { $gte: now },
        status: { $in: ['accepted', 'confirmed'] }
      }),

      // Pandit details
      Pandit.findById(panditId).select('-password'),

      // Notifications count
      Notification.countDocuments({
        panditId,
        isRead: false,
        expiresAt: { $gt: new Date() }
      }),

      // ✅ ADDED: Paid bookings for advance received
      Booking.find({
        panditId,
        paymentStatus: 'completed'
      })
    ]);

    // Calculate total earnings
    const totalEarnings = completedBookings.reduce((total, booking) => {
      return total + (booking.actualPrice || 0);
    }, 0);

    // ✅ Calculate total advance received
    const totalAdvanceReceived = paidBookings.reduce((sum, booking) => {
      return sum + (booking.advanceAmount || 0);
    }, 0);

    // Get today's bookings details (limit to 5)
    const todayBookings = await Booking.find({
      panditId,
      dateTime: { $gte: today, $lt: tomorrow },
      status: { $in: ['accepted', 'confirmed'] }
    })
      .populate('serviceId', 'name price')
      .sort({ dateTime: 1 })
      .limit(5)
      .lean();

    // ✅ CORRECTED: Build the response object properly
    res.json({
      success: true,
      dashboard: {
        pandit: panditDetails,
        todayBookings: todayBookingsCount,
        completedBookings: completedBookings.length,
        totalEarnings,
        totalAdvanceReceived,  // ✅ Added
        paidBookingsCount: paidBookings.length,  // ✅ Added
        upcomingBookings: upcomingBookingsCount,
        notificationsCount,
        todayBookingsList: todayBookings,
        stats: {
          totalBookings: completedBookings.length + todayBookingsCount + upcomingBookingsCount,
          completionRate: completedBookings.length > 0 ?
            Math.round((completedBookings.length / (completedBookings.length + upcomingBookingsCount)) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard stats'
    });
  }
});

// Bookings
router.get('/bookings', bookingController.getPanditBookings);
router.get('/bookings/today', async (req, res) => {
  try {
    const panditId = req.user.id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const bookings = await Booking.find({
      panditId,
      dateTime: { $gte: today, $lt: tomorrow }
    })
    .populate('serviceId', 'name price')
    .sort({ dateTime: 1 })
    .lean();
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Today bookings error:', error);
    res.status(500).json({ success: false, message: 'Error loading today\'s bookings' });
  }
})
router.get('/bookings/completed', async (req, res) => {
  try {
    const panditId = req.user.id;
    
    const bookings = await Booking.find({
      panditId,
      status: 'completed'
    })
    .populate('serviceId', 'name price')
    .sort({ dateTime: -1 })
    .lean();
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Completed bookings error:', error);
    res.status(500).json({ success: false, message: 'Error loading completed bookings' });
  }
})
router.post('/bookings/:bookingId/accept', bookingController.acceptBooking);

;

// Get earnings breakdown
router.get('/earnings', async (req, res) => {
  try {
    const panditId = req.user.id;
    
    const bookings = await Booking.find({
      panditId,
      status: 'completed'
    })
    .populate('serviceId', 'name')
    .sort({ dateTime: -1 })
    .lean();
    
    const earningsData = bookings.map(booking => ({
      ...booking,
      earnings: booking.actualPrice || 0
    }));
    
    const totalEarnings = earningsData.reduce((sum, item) => sum + item.earnings, 0);
    
    res.json({
      success: true,
      totalEarnings,
      bookings: earningsData
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({ success: false, message: 'Error loading earnings' });
  }
});

// Get completed bookings history
;

// Update booking status
router.patch('/bookings/:bookingId/complete', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const panditId = req.user.id;
    
    const Booking = require('../models/Booking');
    
    // Find booking and verify it belongs to this pandit
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      panditId: panditId 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or not assigned to you' 
      });
    }
    
    // Check if booking can be completed (should be accepted/confirmed first)
    if (!['accepted', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot complete booking with status: ${booking.status}` 
      });
    }
    
    // Update status to completed
    booking.status = 'completed';
    await booking.save();
    
    console.log(`✅ Booking ${bookingId} marked as completed by pandit ${panditId}`);
    
    res.json({ 
      success: true, 
      message: 'Booking completed successfully!',
      booking 
    });
    
  } catch (error) {
    console.error('❌ Error completing booking:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


// Profile
router.get('/profile', async (req, res) => {
  try {
    const panditId = req.user.id;
    const Pandit = require('../models/Pandit');
    
    const pandit = await Pandit.findById(panditId).select('-password');
    
    if (!pandit) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }
    
    res.json({
      success: true,
      pandit
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Error loading profile' });
  }
});

// Update pandit profile with contact uniqueness check
router.put('/profile', upload.single('panditImage'), async (req, res) => {
  try {
    const panditId = req.user.id;
    const updateData = {};
    
    // Only update allowed fields
    if (req.body.username) {
      // Check if username already exists for another pandit
      const existingPandit = await Pandit.findOne({ 
        username: req.body.username, 
        _id: { $ne: panditId }
      });
      
      if (existingPandit) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken. Please choose another username.'
        });
      }
      updateData.username = req.body.username;
    }
    
    // ✅ ADD CONTACT UNIQUENESS CHECK
    if (req.body.contact) {
      // Validate contact format
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(req.body.contact)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 10-digit Indian mobile number'
        });
      }
      
      // Check if contact already exists for another pandit
      const existingContact = await Pandit.findOne({ 
        contact: req.body.contact, 
        _id: { $ne: panditId }
      });
      
      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Contact number already registered with another pandit account.'
        });
      }
      updateData.contact = req.body.contact;
    }
    
    // Handle image update with Cloudinary
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    // Handle password change
    if (req.body.currentPassword && req.body.newPassword) {
      const pandit = await Pandit.findById(panditId);
      const isValid = await pandit.comparePassword(req.body.currentPassword);
      
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      updateData.password = req.body.newPassword;
    }
    
    const updatedPandit = await Pandit.findByIdAndUpdate(
      panditId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      pandit: updatedPandit
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let userMessage = '';
      
      if (field === 'username') {
        userMessage = 'Username already taken. Please choose another username.';
      } else if (field === 'email') {
        userMessage = 'Email already registered with another account.';
      } else if (field === 'contact') {
        userMessage = 'Contact number already registered with another pandit account.';
      } else {
        userMessage = `${field} already exists. Please use a different ${field}.`;
      }
      
      return res.status(400).json({
        success: false,
        message: userMessage
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generating verification code for booking completion
router.post('/bookings/:bookingId/generate-code', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const panditId = req.user.id;
    
    const Booking = require('../models/Booking');
    
    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      panditId: panditId
    }).populate('serviceId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }
    
    // Check if booking is in correct status
    if (!['accepted', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate code for booking with status: ${booking.status}`
      });
    }
    
    // Check if code already exists and not expired
    if (booking.verificationCode && booking.codeExpiresAt > new Date()) {
      return res.json({
        success: true,
        message: 'Code already generated',
        verificationCode: booking.verificationCode,
        expiresAt: booking.codeExpiresAt
      });
    }
    
    // Generate 6-digit random code
    const generateCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    const verificationCode = generateCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours expiry
    
    // Update booking with code
    booking.verificationCode = verificationCode;
    booking.codeGeneratedAt = new Date();
    booking.codeExpiresAt = expiresAt;
    booking.codeVerified = false;
    
    await booking.save();
    
    console.log(`✅ Code ${verificationCode} generated for booking ${bookingId}`);
    
    res.json({
      success: true,
      message: 'Verification code generated successfully',
      data: {
        bookingId: booking._id,
        verificationCode: verificationCode,
        expiresAt: expiresAt,
        serviceName: booking.serviceId?.name,
        customerName: booking.name
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify code and complete booking
router.post('/bookings/:bookingId/verify-code', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { code } = req.body;
    const panditId = req.user.id;
    
    const Booking = require('../models/Booking');
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }
    
    // Find booking
    const booking = await Booking.findOne({
      _id: bookingId,
      panditId: panditId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }
    
    // Check if code exists
    if (!booking.verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'No verification code generated for this booking'
      });
    }
    
    // Check if code is expired
    if (booking.codeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please generate a new code.'
      });
    }
    
    // Check if code matches
    if (booking.verificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
    }
    
    // Mark as verified and complete booking
    booking.codeVerified = true;
    booking.status = 'completed';
    booking.verificationCode = null; // Clear code after verification
    
    await booking.save();
    
    console.log(`✅ Booking ${bookingId} completed with code verification`);
    
    res.json({
      success: true,
      message: '✅ Booking completed successfully!',
      booking: {
        id: booking._id,
        status: booking.status,
        completedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying code:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get code status for a booking (for pandit)
router.get('/bookings/:bookingId/code-status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const panditId = req.user.id;
    
    const Booking = require('../models/Booking');
    
    const booking = await Booking.findOne({
      _id: bookingId,
      panditId: panditId
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        hasCode: !!booking.verificationCode,
        verificationCode: booking.verificationCode,
        expiresAt: booking.codeExpiresAt,
        isExpired: booking.codeExpiresAt < new Date(),
        isVerified: booking.codeVerified
      }
    });
    
  } catch (error) {
    console.error('Error getting code status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// Add this debug endpoint to check booking data
router.get('/debug/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('🔍 Debugging booking:', bookingId);
    
    const Booking = require('../models/Booking');
    
    // Try to find the booking
    const booking = await Booking.findById(bookingId)
      .populate('serviceId')
      .lean();
    
    if (!booking) {
      console.log('❌ Booking not found in database!');
      return res.json({
        exists: false,
        message: 'Booking not found',
        bookingId: bookingId
      });
    }
    
    
    
    res.json({
      exists: true,
      booking: booking
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.json({ error: error.message });
  }
});

router.post('/update-activity', async (req, res) => {
  try {
    const panditId = req.user.id;
    await Pandit.findByIdAndUpdate(panditId, { 
      lastActivityAt: new Date() 
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get online status with auto-check
router.get('/online-status', async (req, res) => {
  try {
    const panditId = req.user.id;
    const pandit = await Pandit.findById(panditId).select('isOnline lastActivityAt lastLoginAt');
    
    if (!pandit) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }
    
    const now = new Date();
    const lastActivity = new Date(pandit.lastActivityAt);
    const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
    const hoursSinceLastLogin = (now - new Date(pandit.lastLoginAt)) / (1000 * 60 * 60);
    
    let isOnline = pandit.isOnline;
    let statusChanged = false;
    
    // Auto-offline after 12 hours of inactivity
    if (isOnline && hoursSinceLastActivity >= 12) {
      isOnline = false;
      statusChanged = true;
      await Pandit.findByIdAndUpdate(panditId, { 
        isOnline: false,
        $push: { 
          statusHistory: {
            status: 'offline',
            reason: 'auto_inactivity',
            timestamp: new Date()
          }
        }
      });
      console.log(`🕐 Pandit ${panditId} auto-offline after 12 hours inactivity`);
    }
    
    // Auto-offline after 7 days of no login (even with activity)
    if (isOnline && hoursSinceLastLogin >= 168) { // 7 days
      isOnline = false;
      statusChanged = true;
      await Pandit.findByIdAndUpdate(panditId, { 
        isOnline: false,
        $push: { 
          statusHistory: {
            status: 'offline',
            reason: 'session_expired',
            timestamp: new Date()
          }
        }
      });
      console.log(`🕐 Pandit ${panditId} auto-offline after 7 days no login`);
    }
    
    res.json({ 
      success: true, 
      isOnline,
      statusChanged,
      lastActivityAt: pandit.lastActivityAt,
      lastLoginAt: pandit.lastLoginAt,
      hoursSinceLastActivity: hoursSinceLastActivity.toFixed(1),
      hoursSinceLastLogin: hoursSinceLastLogin.toFixed(1),
      serverTime: now.toISOString()
    });
    
  } catch (error) {
    console.error('Online status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/profile/image', upload.single('panditImage'), async (req, res) => {
  try {
    const panditId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Cloudinary returns full URL in req.file.path
    const imageUrl = req.file.path;
    
    // Update pandit with new image
    const updatedPandit = await Pandit.findByIdAndUpdate(
      panditId,
      { image: imageUrl },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile image updated successfully',
      imageUrl: imageUrl,
      pandit: updatedPandit
    });
    
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


router.post('/logout', async (req, res) => {
  try {
    const panditId = req.user.id;
    await Pandit.findByIdAndUpdate(panditId, { isOnline: false });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Debug endpoint - Remove after testing
router.get('/debug/locations', async (req, res) => {
  try {
    const allPandits = await Pandit.find().select('name location');
    const locations = await Pandit.distinct('location');
    res.json({
      totalPandits: allPandits.length,
      pandits: allPandits,
      distinctLocations: locations
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Change password (including first login)
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, isFirstLogin } = req.body;
    const panditId = req.user.id;
    
    const pandit = await Pandit.findById(panditId);
    
    if (!pandit) {
      return res.status(404).json({ success: false, message: 'Pandit not found' });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Always verify current/temporary password before allowing change
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }

    const isValid = await bcrypt.compare(currentPassword, pandit.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: isFirstLogin ? 'Invalid temporary password' : 'Invalid current password'
      });
    }
    
    // Use plain assignment — the pre-save hook will hash it once
    pandit.password = newPassword;
    pandit.isFirstLogin = false;
    await pandit.save();
    
    // Generate new token
    const token = jwt.sign(
      { id: pandit._id, role: 'pandit', email: pandit.email, name: pandit.name },
      process.env.JWT_SECRET || 'fallback-secret-for-development',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully',
      token,
      pandit: {
        id: pandit._id,
        name: pandit.name,
        username: pandit.username,
        isFirstLogin: false
      }
    });
    
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;