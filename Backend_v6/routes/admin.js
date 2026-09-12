// backend/routes/admin.js - CORRECTED VERSION
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const { authenticateAdmin, isAdmin } = require('../middleware/auth');
const Booking = require('../models/Booking'); 
const { validatePandit, validateService } = require('../middleware/validation');
const upload = require('../middleware/cloudinaryUpload');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

// Handle OPTIONS requests for all routes
router.options('*', (req, res) => {
  console.log('📡 OPTIONS request received for admin route');
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ✅ Public routes (no authentication required)
router.post('/login', adminController.adminLogin);

// ✅ Apply admin middleware ONLY to protected routes
router.use(authenticateAdmin);
router.use(isAdmin);

// Test route to verify authentication is working
router.get('/test-auth', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin authentication working!',
    user: req.user 
  });
});

// Dashboard and data routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/all-data', adminController.getAllData);

// ==================== PANDIT MANAGEMENT ====================
// ✅ FIXED: Now using adminController (not panditController)
router.post('/pandits', upload.single('panditImage'), validatePandit, adminController.createPandit);
router.put('/pandits/:id', upload.single('panditImage'), validatePandit, adminController.updatePandit);
router.delete('/pandits/:id', adminController.deletePandit);
router.patch('/pandits/:id/toggle-availability', adminController.togglePanditAvailability);
router.post('/pandits/bulk-update', adminController.bulkUpdatePandits);
router.post('/pandits/:id/resend-credentials', adminController.resendPanditCredentials); // Optional

// ==================== SERVICE MANAGEMENT ====================
router.post('/services', upload.single('serviceImage'), validateService, serviceController.createService);
router.put('/services/:id', upload.single('serviceImage'), validateService, serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);
router.patch('/services/:id/toggle-activity', adminController.toggleServiceActivity);
router.post('/services/bulk-update', adminController.bulkUpdateServices);

// ==================== BOOKINGS ====================
router.get('/bookings', adminController.getAllBookings);

// ⚠️ Static routes must come BEFORE /:id to avoid shadowing
router.get('/bookings/ghost', async (req, res) => {
  try {
    const ghostBookings = await Booking.find({
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: { $lt: new Date(Date.now() - 1 * 60 * 60 * 1000) } // Older than 1 hour
    })
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: ghostBookings.length,
      bookings: ghostBookings.map(b => ({
        id: b._id,
        customerName: b.name,
        contact: b.contact,
        email: b.email,
        service: b.serviceId?.name,
        createdAt: b.createdAt,
        age: Math.floor((Date.now() - new Date(b.createdAt)) / (1000 * 60 * 60)) + ' hours'
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Admin endpoint to manually clean ghost bookings
router.delete('/bookings/ghost/cleanup', async (req, res) => {
  try {
    const { olderThanHours = 24, bookingIds } = req.body;
    
    let query = {
      paymentStatus: 'pending',
      status: 'pending'
    };
    
    if (bookingIds && bookingIds.length > 0) {
      query._id = { $in: bookingIds };
    } else {
      query.createdAt = { $lt: new Date(Date.now() - olderThanHours * 60 * 60 * 1000) };
    }
    
    const bookingsToDelete = await Booking.find(query);
    
    if (bookingsToDelete.length === 0) {
      return res.json({
        success: true,
        message: 'No ghost bookings found',
        deletedCount: 0
      });
    }
    
    // Delete notifications first
    const bookingIdsToDelete = bookingsToDelete.map(b => b._id);
    await Notification.deleteMany({ bookingId: { $in: bookingIdsToDelete } });
    
    // Delete bookings
    const result = await Booking.deleteMany({ _id: { $in: bookingIdsToDelete } });
    
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} ghost bookings`,
      deletedCount: result.deletedCount,
      deletedBookings: bookingsToDelete.map(b => ({
        id: b._id,
        customerName: b.name,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bookings/:id', adminController.getBookingDetails);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.post('/bookings/:bookingId/admin-cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name')
      .populate('customerId', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Status validation
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    // ✅ Set all cancellation fields
    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by admin';
    booking.cancelledAtHours = hoursDifference;
    
    // Process full refund for admin cancellations
    let refundMessage = '';
    if (booking.paymentStatus === 'completed' && booking.advanceAmount > 0) {
      try {
        const paymentController = require('../controllers/paymentController');
        const refundResult = await paymentController.processRefund(bookingId, 100);
        if (refundResult.success) {
          refundMessage = ' Full refund has been processed.';
          booking.cancellationRefundPercentage = 100;
          booking.cancellationRefundProcessed = true;
        }
      } catch (refundError) {
        console.error('Refund failed:', refundError);
        refundMessage = ' Refund processing failed. Please process manually.';
      }
    }
    
    await booking.save();
    
    console.log(`✅ Admin cancelled booking ${bookingId} - cancelledBy: admin, hoursUntilPuja: ${hoursDifference.toFixed(1)}`);
    
    res.json({
      success: true,
      message: `Booking cancelled successfully.${refundMessage}`,
      booking
    });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// ==================== ANALYTICS & ACTIVITY ====================
router.get('/pandits/performance', adminController.getPanditPerformance);
router.get('/analytics/bookings', adminController.getBookingAnalytics);
router.get('/activity/recent', adminController.getRecentActivity);

// ==================== SUPPORT TICKETS ====================
router.get('/support-tickets', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const tickets = await SupportTicket.find(query)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'serviceId dateTime price status name contact')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await SupportTicket.countDocuments(query);
    
    const stats = {
      total: await SupportTicket.countDocuments(),
      open: await SupportTicket.countDocuments({ status: 'open' }),
      inProgress: await SupportTicket.countDocuments({ status: 'in_progress' }),
      resolved: await SupportTicket.countDocuments({ status: 'resolved' }),
      closed: await SupportTicket.countDocuments({ status: 'closed' })
    };
    
    res.json({
      success: true,
      tickets,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/support-tickets/:id', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('bookingId', 'serviceId dateTime price status name contact address');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      ticket
    });
    
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.patch('/support-tickets/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
    }
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    console.log(`✅ Ticket ${ticket._id} status updated to: ${status}`);
    
    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket
    });
    
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/support-tickets/:id', authenticateAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Support ticket deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



module.exports = router;