// backend/controllers/paymentController.js - FIXED VERSION
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const CancellationService = require('../services/cancellationService');
const { extractNumericPrice, calculateAdvanceAmount, isValidPriceForPayment } = require('../utils/priceUtils');



// Initialize Razorpay with error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
//  console.log('✅ Razorpay initialized successfully');
} catch (error) {
 // console.error('❌ Razorpay initialization failed:', error.message);
}




// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { bookingId, totalAmount } = req.body;

    // ✅ Build query with available fields only
    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    
    query.$or = orConditions;

    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    // ✅ FIX 6: Prevent duplicate payment orders for already-paid bookings
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'This booking has already been paid' });
    }

    let advanceAmount;
    if (totalAmount) {
      advanceAmount = calculateAdvanceAmount(totalAmount);
    } else if (booking.actualPrice > 0) {
      advanceAmount = calculateAdvanceAmount(booking.actualPrice);
    } else if (booking.price) {
      const extractedPrice = extractNumericPrice(booking.price);
      if (extractedPrice === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price for this booking. Please contact support.',
          priceString: booking.price
        });
      }
      advanceAmount = calculateAdvanceAmount(extractedPrice);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment: No valid price found for this booking.'
      });
    }
     if (advanceAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment: Advance amount is ₹${advanceAmount}. Please contact support.`,
        advanceAmount
      });
    }

  //  console.log(`Booking ID: ${bookingId}`);
   // console.log(`Total Amount: ₹${totalAmount}`);
   // console.log(`Advance Amount (30%): ₹${advanceAmount}`);

    const options = {
      amount: advanceAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      payment_capture: 1,
      notes: {
        bookingId: bookingId.toString(),
        customerId: req.user.id.toString(),
        totalAmount: totalAmount,
        advanceAmount: advanceAmount
      }
    };

    const order = await razorpay.orders.create(options);
   // console.log('✅ Razorpay order created:', order.id);

    // Update booking with order ID
    await Booking.findByIdAndUpdate(bookingId, {
      orderId: order.id,
      advanceAmount: advanceAmount
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: advanceAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
   // console.error('❌ Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment order' });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId, totalAmount } = req.body;

    // ✅ Build query with available fields only
    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    
    query.$or = orConditions;

    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }    
    // Verify Razorpay signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

   // console.log(`Expected: ${expectedSignature}`);
  //  console.log(`Received: ${signature}`);

    if (expectedSignature !== signature) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const advanceAmount = calculateAdvanceAmount(totalAmount || booking.actualPrice || 0);

    await Booking.findByIdAndUpdate(bookingId, {
      paymentId: paymentId,
      paymentStatus: 'completed',
      paidAt: new Date(),
      advanceAmount: advanceAmount
    });

    console.log('✅ Payment verified for booking:', bookingId);

    // ✅ Trigger post-payment actions (notify pandits)
    const { afterSuccessfulPayment } = require('./bookingController');
    await afterSuccessfulPayment(bookingId);

    res.json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process Refund (internal helper)
exports.processRefund = async (bookingId, refundPercentage = 100) => {
  try {
   // console.log(`Processing refund for booking: ${bookingId}, ${refundPercentage}%`);

    const booking = await Booking.findById(bookingId);

    if (!booking || booking.paymentStatus !== 'completed') {
      return { success: false, message: 'Invalid booking or payment not completed' };
    }

    if (!booking.paymentId) {
      return { success: false, message: 'No payment found for this booking' };
    }

    const refundAmount = (booking.advanceAmount * refundPercentage) / 100;

    const refundOptions = {
      payment_id: booking.paymentId,
      amount: Math.round(refundAmount * 100),
      notes: {
        bookingId: bookingId.toString(),
        reason: `Cancellation refund - ${refundPercentage}%`
      }
    };

    const refund = await razorpay.payments.refund(refundOptions);

    await Booking.findByIdAndUpdate(bookingId, {
      refundId: refund.id,
      refundAmount: refundAmount,
      refundStatus: 'completed',
      paymentStatus: refundPercentage === 100 ? 'refunded' : 'partially_refunded'
    });

   // console.log('✅ Refund processed:', refund.id);
    return { success: true, refund };

  } catch (error) {
  //  console.error('❌ Refund error:', error);
    return { success: false, message: error.message };
  }
};

// Refund eligibility rules
const REFUND_RULES = [
  {
    name: 'PUJA_PASSED',
    priority: 1,
    condition: ({ hoursUntilPuja }) => hoursUntilPuja <= 0,
    result: { eligible: false, percentage: 0, reason: 'Puja has already passed. No refund available.' }
  },
  {
    name: 'FULL_REFUND_EARLY_CANCELLATION',
    priority: 2,
    condition: ({ hoursSinceBooking }) => hoursSinceBooking <= 5,
    result: ({ hoursSinceBooking }) => ({ 
      eligible: true, 
      percentage: 100, 
      reason: `Cancelled within 5 hours of booking (${hoursSinceBooking.toFixed(1)} hours ago)`
    })
  },
  {
    name: 'HALF_REFUND_ADVANCE_NOTICE',
    priority: 3,
    condition: ({ hoursUntilPuja }) => hoursUntilPuja > 30,
    result: ({ hoursUntilPuja }) => ({ 
      eligible: true, 
      percentage: 50, 
      reason: `Cancelled ${hoursUntilPuja.toFixed(1)} hours before puja (30+ hours threshold)`
    })
  },
  {
    name: 'NO_REFUND_LATE_CANCELLATION',
    priority: 4,
    condition: ({ hoursUntilPuja }) => hoursUntilPuja > 0 && hoursUntilPuja <= 30,
    result: ({ hoursUntilPuja }) => ({ 
      eligible: false, 
      percentage: 0, 
      reason: `Cancelled within 30 hours of puja. Only ${hoursUntilPuja.toFixed(1)} hours remaining.`
    })
  }
];

// Default fallback rule
const DEFAULT_RULE = {
  name: 'DEFAULT_FALLBACK',
  result: { eligible: false, percentage: 0, reason: 'Not eligible for refund. Please contact support.' }
};

/**
 * Evaluate refund eligibility based on defined rules
 * Rules are evaluated in priority order (lower number = higher priority)
 */
const getRefundEligibility = ({ bookingDateTime, createdAt, now = new Date() }) => {
  const bookingDate = new Date(bookingDateTime);
  const createdDate = new Date(createdAt);
  const current = new Date(now);

  const hoursSinceBooking = (current - createdDate) / (1000 * 60 * 60);
  const hoursUntilPuja = (bookingDate - current) / (1000 * 60 * 60);

  console.log(`📊 Refund eligibility check:`, {
    hoursSinceBooking: hoursSinceBooking.toFixed(2),
    hoursUntilPuja: hoursUntilPuja.toFixed(2),
    bookingDate: bookingDate.toISOString(),
    currentTime: current.toISOString()
  });

  // Find first matching rule (sorted by priority)
  const sortedRules = [...REFUND_RULES].sort((a, b) => a.priority - b.priority);
  
  for (const rule of sortedRules) {
    try {
      if (rule.condition({ hoursSinceBooking, hoursUntilPuja })) {
        const result = typeof rule.result === 'function' 
          ? rule.result({ hoursSinceBooking, hoursUntilPuja })
          : rule.result;
        
        console.log(`✅ Matched rule: ${rule.name} -> ${result.percentage}% refund`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error evaluating rule ${rule.name}:`, error);
    }
  }

  console.log(`⚠️ No rule matched, using default fallback`);
  return DEFAULT_RULE.result;
};

// ✅ Export it so other functions can use it
exports.getRefundEligibility = getRefundEligibility;

// Now this works correctly
const getEligibilityWithSpecialCase = (booking) => {
  const eligibility = exports.getRefundEligibility({
    bookingDateTime: booking.dateTime,
    createdAt: booking.createdAt,
    now: new Date()
  });

  // Special case: No pandit accepted yet
  const noPanditAccepted = !booking.panditId && ['pending', 'notified'].includes(booking.status);
  
  if (noPanditAccepted) {
    return {
      eligible: true,
      percentage: 100,
      reason: 'No pandit has accepted your booking yet. Full refund applicable.',
      originalEligibility: eligibility
    };
  }

  // ✅ Now this works correctly
  if (booking.cancelledBy === 'admin') {
    return {
      eligible: true,
      percentage: 100,
      reason: 'Booking cancelled by administrator. Full refund processed.',
      originalEligibility: eligibility
    };
  }

  return { ...eligibility };
};

// Cancel booking with refund
exports.cancelBookingWithRefund = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const result = await CancellationService.cancelBooking(
      bookingId,
      req.user.id,
      'user',
      req.body.reason || 'Cancelled via payment flow'
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check refund eligibility (for frontend)
exports.checkRefundEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    query.$or = orConditions;

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }

    const eligibility = getEligibilityWithSpecialCase(booking);
    
    // Calculate actual refund amount
    const refundAmount = eligibility.eligible 
      ? (booking.advanceAmount || 0) * eligibility.percentage / 100 
      : 0;

    res.json({
      success: true,
      eligible: eligibility.eligible,
      percentage: eligibility.percentage,
      reason: eligibility.reason,
      advanceAmount: booking.advanceAmount || 0,
      refundAmount: refundAmount,
      message: exports.getRefundMessage(eligibility, booking),
      hoursUntilPuja: ((new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60)).toFixed(1),
      hoursSinceBooking: ((new Date() - new Date(booking.createdAt)) / (1000 * 60 * 60)).toFixed(1)
    });
  } catch (error) {
   // console.error('Refund eligibility error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this helper for better user messaging
exports.getRefundMessage = (eligibility, booking) => {
  if (eligibility.eligible) {
    if (eligibility.percentage === 100) {
      return `✅ Full refund (₹${booking.advanceAmount}) will be processed to your original payment method.`;
    } else if (eligibility.percentage === 50) {
      const refundAmount = (booking.advanceAmount * 0.5).toFixed(0);
      return `⚠️ 50% refund (₹${refundAmount}) will be processed. ₹${(booking.advanceAmount * 0.5).toFixed(0)} will be deducted as cancellation fee.`;
    }
  } else {
    return `❌ No refund applicable. ${eligibility.reason}`;
  }
  return eligibility.reason;
};
// Handle payment cancelled/dismissed by user
// Called when user closes Razorpay modal or payment fails
exports.handlePaymentCancelled = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const query = { _id: bookingId };
    const orConditions = [{ customerId: req.user.id }];
    if (req.user.email) orConditions.push({ email: req.user.email });
    if (req.user.phone) orConditions.push({ contact: req.user.phone });
    query.$or = orConditions;

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    // Only cancel if payment was never completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already been paid'
      });
    }

    if (booking.status === 'cancelled') {
      return res.json({ success: true, message: 'Booking already cancelled' });
    }

    // Mark as cancelled with system reason
    booking.status = 'cancelled';
    booking.cancelledBy = 'system';
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Payment cancelled or dismissed by user';
    booking.paymentStatus = 'failed';
    await booking.save();

    // Clean up any notifications for this booking
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ bookingId: booking._id });

    console.log(`🚫 Booking ${bookingId} cancelled due to payment cancellation`);

    res.json({
      success: true,
      message: 'Booking cancelled as payment was not completed',
      bookingId: booking._id
    });

  } catch (error) {
    console.error('❌ handlePaymentCancelled error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
