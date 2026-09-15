// backend/services/cancellationService.js

const Booking = require('../models/Booking');

const { extractNumericPrice, calculateAdvanceAmount } = require('../utils/priceUtils');
const { processRefund, getRefundEligibility } = require('../controllers/paymentController');

class CancellationService {
  /**
   * Unified cancellation method that handles both policy and refunds
   * @param {string} bookingId - Booking ID
   * @param {string} userId - User ID making the request
   * @param {string} cancelledBy - 'user', 'admin', or 'pandit'
   * @param {string} reason - Optional cancellation reason
   * @returns {Object} Cancellation result
   */
  static async cancelBooking(bookingId, userId, cancelledBy = 'user', reason = null) {
    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name price');
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    // Verify ownership (for user cancellations)
    if (cancelledBy === 'user') {
      const isOwner = booking.customerId?.toString() === userId ||
                     booking.email === userId ||
                     booking.contact === userId;
      if (!isOwner) {
        throw new Error('Unauthorized to cancel this booking');
      }
    }
    
    // Status validation
    if (booking.status === 'completed') {
      throw new Error('Completed bookings cannot be cancelled');
    }
    
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }
    
    // Calculate refund eligibility (same rules for all cancellation methods)
    const eligibility = getRefundEligibility({
      bookingDateTime: booking.dateTime,
      createdAt: booking.createdAt,
      now: new Date()
    });
    
    // Special case: No pandit accepted (full refund regardless of timing)
    const noPanditAccepted = !booking.panditId && ['pending', 'notified'].includes(booking.status);
    const finalEligibility = noPanditAccepted 
      ? { eligible: true, percentage: 100, reason: 'No pandit has accepted your booking yet' }
      : eligibility;
    
    // Process refund if eligible and payment was made
    let refundResult = null;
    if (finalEligibility.eligible && finalEligibility.percentage > 0 && booking.paymentStatus === 'completed') {
      refundResult = await processRefund(bookingId, finalEligibility.percentage);
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledBy = cancelledBy;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || (finalEligibility.reason);
    booking.cancellationRefundPercentage = finalEligibility.percentage;
    booking.cancellationRefundProcessed = !!refundResult?.success;
    
    await booking.save();
    
    return {
      success: true,
      message: this.getCancellationMessage(finalEligibility, refundResult),
      booking: {
        id: booking._id,
        status: booking.status,
        cancelledAt: booking.cancelledAt
      },
      refund: refundResult ? {
        percentage: finalEligibility.percentage,
        amount: booking.advanceAmount * finalEligibility.percentage / 100,
        processed: refundResult.success
      } : null,
      eligibility: finalEligibility
    };
  }
  
  static getCancellationMessage(eligibility, refundResult) {
    if (eligibility.eligible && eligibility.percentage === 100) {
      if (refundResult?.success) {
        return 'Booking cancelled successfully. Full refund will be processed to your original payment method.';
      }
      return 'Booking cancelled successfully. Full refund is applicable.';
    } else if (eligibility.eligible && eligibility.percentage === 50) {
      if (refundResult?.success) {
        return 'Booking cancelled successfully. 50% refund will be processed.';
      }
      return 'Booking cancelled successfully. 50% refund applicable.';
    } else {
      return `Booking cancelled successfully. ${eligibility.reason}`;
    }
  }
  
  /**
   * Check if a booking can be cancelled (for UI)
   */
  static canCancel(booking) {
    if (!booking) return false;
    if (booking.status === 'completed') return false;
    if (booking.status === 'cancelled') return false;
    
    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    
    // Allow cancellation anytime, but show appropriate refund message
    return bookingDate > now;
  }
  
  /**
   * Get cancellation info for UI (refund percentage, message)
   */
  static getCancellationInfo(booking) {
    if (!booking) return null;
    
    const eligibility = getRefundEligibility({
      bookingDateTime: booking.dateTime,
      createdAt: booking.createdAt,
      now: new Date()
    });
    
    const noPanditAccepted = !booking.panditId && ['pending', 'notified'].includes(booking.status);
    
    if (noPanditAccepted) {
      return {
        canCancel: true,
        refundPercentage: 100,
        refundAmount: booking.advanceAmount || 0,
        message: 'Full refund available (no pandit has accepted your booking yet)',
        showConfirmation: true
      };
    }
    
    if (eligibility.eligible && eligibility.percentage === 100) {
      return {
        canCancel: true,
        refundPercentage: 100,
        refundAmount: booking.advanceAmount || 0,
        message: 'Full refund available',
        showConfirmation: true
      };
    } else if (eligibility.eligible && eligibility.percentage === 50) {
      const refundAmount = (booking.advanceAmount || 0) * 0.5;
      return {
        canCancel: true,
        refundPercentage: 50,
        refundAmount: refundAmount,
        message: `50% refund available (₹${refundAmount.toFixed(0)} will be refunded)`,
        showConfirmation: true
      };
    } else {
      const hoursUntilPuja = (new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60);
      return {
        canCancel: true,  // Always allow cancellation, just with 0% refund
        refundPercentage: 0,
        refundAmount: 0,
        message: `No refund available (only ${hoursUntilPuja.toFixed(1)} hours until puja)`,
        showConfirmation: true
      };
    }
  }
}

module.exports = CancellationService;
