// backend/utils/bookingValidation.js

// Validate if a booking can be cancelled (general use)
const validateCancellableBooking = (booking, options = {}) => {
  const errors = [];
  const { allowPastBookings = false } = options;
  
  if (!booking) {
    errors.push('Booking not found');
    return { valid: false, errors };
  }
  
  if (booking.status === 'completed') {
    errors.push('Completed bookings cannot be cancelled');
  }
  
  if (booking.status === 'cancelled') {
    errors.push('Booking is already cancelled');
  }
  
  // Check if booking is in the past — skip this check for admin overrides
  if (!allowPastBookings) {
    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    if (bookingDate < now && booking.status !== 'completed') {
      errors.push('Past bookings cannot be cancelled');
    }
  }
  
  return { 
    valid: errors.length === 0, 
    errors 
  };
};

const getCancellationRefundInfo = (booking) => {
  const hoursUntilPuja = (new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60);
  
  // Thresholds must match REFUND_RULES in paymentController.js
  if (hoursUntilPuja > 30) {
    return { eligible: true, percentage: 50, message: '50% refund eligible (30+ hours before puja)' };
  } else {
    return { eligible: false, percentage: 0, message: 'No refund eligible (within 30 hours of puja)' };
  }
};

module.exports = {
  validateCancellableBooking,
  getCancellationRefundInfo
};