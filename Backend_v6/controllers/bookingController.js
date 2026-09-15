// bookingController.js
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pandit = require('../models/Pandit');
const NotificationService = require('../utils/notificationService');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');
const { validateCancellableBooking } = require('../utils/bookingValidation');
const { extractNumericPrice, calculateAdvanceAmount } = require('../utils/priceUtils');

// Helper function to extract location from address
const extractLocationFromAddress = (address) => {
  if (!address) return 'Unknown';
  
  // Known cities in the system
  const knownCities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 
                       'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
                       'Nagpur', 'Indore', 'Bhopal', 'Vadodara', 'Surat'];
  
  // Check for exact matches first (case-insensitive)
  const lowerAddress = address.toLowerCase();
  for (const city of knownCities) {
    if (lowerAddress.includes(city.toLowerCase())) {
      console.log(`📍 Extracted city "${city}" from address`);
      return city;
    }
  }
  
  // Try to extract using regex (common patterns)
  const cityPatterns = [
    /,\s*([A-Za-z\s]+?)\s*,\s*[A-Z]{2,3}\s*\d{6}/,  // "City, State PIN"
    /,\s*([A-Za-z\s]+?)\s*,\s*[A-Z]{2,3}/,           // "City, State"
    /in\s+([A-Za-z\s]+?)(?:\s|$)/i,                  // "in City"
    /at\s+([A-Za-z\s]+?)(?:\s|$)/i                   // "at City"
  ];
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      // Verify extracted city is in known list
      for (const city of knownCities) {
        if (extracted.toLowerCase().includes(city.toLowerCase()) ||
            city.toLowerCase().includes(extracted.toLowerCase())) {
          console.log(`📍 Extracted city "${city}" using pattern`);
          return city;
        }
      }
    }
  }
  
  console.log(`⚠️ Could not extract city from address: ${address.substring(0, 50)}...`);
  return 'Unknown';
};


exports.createBooking = async (req, res, next) => {
  try {
    console.log('='.repeat(50));
    console.log('📝 NEW BOOKING REQUEST RECEIVED');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));

    const {
      name, contact, email, serviceId, panditId, dateTime, address, message, price, userLocation: requestedLocation
    } = req.body;

    // Validation
    if (!name || !dateTime || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, dateTime, address are required'
      });
    }

    // ✅ FIX Bug 2: If user is authenticated and contact is missing/invalid,
    // look up their actual phone number from the database
    let resolvedContact = contact;
    if (req.user?.id && (!resolvedContact || !/^\d{10}$/.test(resolvedContact))) {
      try {
        const Customer = require('../models/Customer');
        const customer = await Customer.findById(req.user.id).select('phone').lean();
        if (customer?.phone) {
          resolvedContact = customer.phone;
          console.log(`📱 Using customer DB phone for booking: ${resolvedContact}`);
        }
      } catch (lookupErr) {
        console.warn('⚠️ Could not lookup customer phone:', lookupErr.message);
      }
    }

    if (!resolvedContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact number is required'
      });
    }

    if (!serviceId && !panditId) {
      return res.status(400).json({
        success: false,
        message: 'Either service or pandit selection is required'
      });
    }

    // Get service details if provided
    let service = null;
    if (serviceId) {
      service = await Service.findById(serviceId).lean();
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
    }

    // ✅ FIX 1: Extract location FIRST (before any conditional logic)
    let finalUserLocation = requestedLocation;
    if (!finalUserLocation) {
      finalUserLocation = extractLocationFromAddress(address);
    }
    console.log('📍 Extracted location:', finalUserLocation);

    // Calculate actual numeric price
    let actualPrice = 0;
    let displayPrice = price;

    if (service && service.price) {
      actualPrice = extractNumericPrice(service.price);
      displayPrice = service.price;
    } else if (price) {
      actualPrice = extractNumericPrice(price);
    }
    
    // Validate price
    if (actualPrice === 0 && (service?.price || price)) {
      console.warn(`⚠️ Warning: Could not extract price from: ${service?.price || price}`);
    }

    // Create booking object (not saved yet for pandit-specific bookings)
    const bookingData = {
      name, contact: resolvedContact, email,
      serviceId: serviceId || null,
      panditId: panditId || null,
      dateTime: new Date(dateTime),
      address,
      userLocation: finalUserLocation,
      message,
      price: displayPrice || 'Price on request',
      actualPrice,
      customerId: req.user?.id,
      status: panditId ? 'pending' : 'pending'
    };

    // City validation — check pandits exist in that city (regardless of current availability)
    if (finalUserLocation && finalUserLocation !== 'Unknown') {
      const escapedLocation = finalUserLocation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const panditsInCity = await Pandit.countDocuments({
        location: { $regex: `^${escapedLocation}$`, $options: 'i' }
      });

      console.log(`🏙️ City validation for ${finalUserLocation}: ${panditsInCity} pandits found`);

      if (panditsInCity === 0) {
        const availableCities = await Pandit.distinct('location');
        return res.status(400).json({
          success: false,
          message: `No pandits available in ${finalUserLocation}. Please select a different city.`,
          availableCities: availableCities.filter(c => c && c.trim().length > 0),
          requestedCity: finalUserLocation
        });
      }
    }

    // ✅ FIX 3: For specific pandit booking, also verify the selected pandit is in the city
    if (panditId) {
      const pandit = await Pandit.findById(panditId);
      
      if (!pandit) {
        return res.status(404).json({
          success: false,
          message: 'Selected pandit not found'
        });
      }
      
      // Verify pandit is available
      if (!pandit.isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Selected pandit is currently unavailable'
        });
      }
      
      // ✅ FIX 4: Verify pandit's location matches requested city
      if (finalUserLocation && finalUserLocation !== 'Unknown') {
        const panditCity = pandit.location;
        const cityMatch = panditCity && 
          panditCity.toLowerCase() === finalUserLocation.toLowerCase();
        
        if (!cityMatch) {
          return res.status(400).json({
            success: false,
            message: `Selected pandit is based in ${panditCity}, but you requested service in ${finalUserLocation}. Please select a pandit from ${finalUserLocation} or change your location.`
          });
        }
      }
      
      // Verify pandit offers the service (if service is selected)
      if (serviceId && service) {
        const offersService = pandit.services.some(s => 
          s.toLowerCase() === service.name.toLowerCase()
        );
        
        if (!offersService) {
          return res.status(400).json({
            success: false,
            message: `Selected pandit does not offer ${service.name}. Please choose a different pandit or service.`
          });
        }
      }
      
      // Create and save booking
      const booking = new Booking(bookingData);
      booking.panditId = panditId;
      booking.status = 'pending';
      await booking.save();
      
      console.log(`✅ Booking saved with specific pandit: ${pandit.name}`);
      
      // Send notification ONLY to this pandit
      const io = req.app.get('io');
      await NotificationService.notifySinglePandit(booking, pandit, io);
      
      return res.status(201).json({
        success: true,
        booking,
        message: `Booking request sent to ${pandit.name}. They will confirm soon.`,
        pandit: {
          name: pandit.name,
          contact: pandit.contact,
          location: pandit.location
        }
      });
    }

    // ✅ FIX 5: For service-only bookings (no specific pandit)
    if (serviceId && !panditId) {
      console.log('🔍 Saving booking — pandits will be notified after payment confirmation...');
      
      // Create and save booking — do NOT notify pandits yet (wait for advance payment)
      const booking = new Booking(bookingData);
      await booking.save();
      console.log('✅ Booking saved:', booking._id);
      
      return res.status(201).json({
        success: true,
        booking,
        message: 'Booking created! Please complete the advance payment to confirm.',
        panditsNotified: 0,
        location: finalUserLocation
      });
    }

    // Fallback (should not reach here)
    return res.status(201).json({
      success: true,
      booking: new Booking(bookingData),
      message: 'Booking created successfully!'
    });

  } catch (err) {
    console.error('❌ Booking creation error:', err);
    next(err);
  }
};


// Get bookings (admin or filter)
exports.getBookings = async (req, res, next) => {
  try {
    const q = {};
    const { status, panditId, serviceId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    if (status) q.status = status;
    if (panditId) q.panditId = panditId;
    if (serviceId) q.serviceId = serviceId;
    if (dateFrom || dateTo) {
      q.dateTime = {};
      if (dateFrom) q.dateTime.$gte = new Date(dateFrom);
      if (dateTo) q.dateTime.$lte = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * lim;

    const bookings = await Booking.find(q)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name contact email')
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await Booking.countDocuments(q);
    res.json({ success: true, bookings, total, page: pageNum, totalPages: Math.ceil(total / lim) });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name contact email')
      .lean();
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// Update booking status/details (admin/pandit)
exports.updateBooking = async (req, res, next) => {
  try {
    const { status, panditId, dateTime, address, message, price } = req.body;
    const update = {};
    if (status) update.status = status;
    if (panditId !== undefined) update.panditId = panditId;
    if (dateTime) update.dateTime = new Date(dateTime);
    if (address) update.address = address;
    if (message) update.message = message;
    if (price) update.price = price;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    const { valid, errors } = validateCancellableBooking(booking, { allowPastBookings: true });
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }

    // ✅ Add status validation
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Optional: Add time-based restriction for admin cancellations
    // const hoursUntilPuja = (new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60);
    // if (hoursUntilPuja < 2 && hoursUntilPuja > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot cancel booking less than 2 hours before puja (${hoursUntilPuja.toFixed(1)} hours remaining)`
    //   });
    // }

    // Capture status before changing it
    const previousStatus = booking.status;

    // Update status
    booking.status = 'cancelled';
    booking.cancelledBy = 'admin';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by administrator';
    await booking.save();

    // Log the cancellation
    console.log(`📝 Admin cancelled booking ${booking._id} - Previous status: ${previousStatus}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (err) {
    console.error('❌ Admin cancel booking error:', err);
    next(err);
  }
};

// Pandit accepts booking
// Pandit accepts booking
exports.acceptBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const panditId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate('serviceId', 'name price')
      .populate('panditId', 'name email contact');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // ✅ Payment status check: only block if payment was initiated (orderId exists) but not completed
    // Bookings without an orderId have not yet entered the payment flow
    if (booking.orderId && booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept booking: Payment not completed. Customer needs to complete payment first.',
        paymentStatus: booking.paymentStatus,
        actionRequired: 'customer_payment'
      });
    }

    // Check if booking is still available
    if (booking.status !== 'notified' && booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Booking already accepted by another pandit'
      });
    }

    // Also check if booking is too close to the event time
    const hoursUntilPuja = (new Date(booking.dateTime) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilPuja < 1) {
      const timeMsg = hoursUntilPuja <= 0
        ? 'Puja time has already passed'
        : `Only ${Math.round(hoursUntilPuja * 60)} minutes until puja time`;
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking: ${timeMsg}.`,
        hoursUntilPuja: hoursUntilPuja
      });
    }

    // Get all pandits who were notified (for sending removal events)
    const notifiedPandits = booking.notifiedPandits || [];

    // Delete all notifications for this booking
    const Notification = require('../models/Notification');
    const deletedNotifications = await Notification.deleteMany({ bookingId: booking._id });
    console.log(`🗑️ Deleted ${deletedNotifications.deletedCount} notifications for booking ${booking._id}`);

    // Get pandit details
    const Pandit = require('../models/Pandit');
    const pandit = await Pandit.findById(panditId);

    // Update booking
    booking.panditId = panditId;
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    // Emit socket event to remove notification from all notified pandits
    const io = req.app.get('io');
    if (io) {
      // Notify the accepting pandit that booking is accepted
      io.to(`pandit_${panditId}`).emit('booking_accepted', {
        bookingId: booking._id,
        message: `You accepted booking for ${booking.serviceId?.name}`
      });

      // Notify all other pandits to remove this notification
      notifiedPandits.forEach(notifiedPanditId => {
        if (notifiedPanditId.toString() !== panditId.toString()) {
          io.to(`pandit_${notifiedPanditId}`).emit('remove_notification', {
            bookingId: booking._id,
            message: `Booking for ${booking.serviceId?.name} has been accepted by another pandit`
          });
        }
      });

      console.log(`📡 Emitted remove_notification to ${notifiedPandits.length - 1} other pandits`);
    }

    // Send email confirmation
    try {
      const NotificationService = require('../utils/notificationService');
      await NotificationService.sendBookingConfirmation(booking, pandit);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking accepted successfully!',
      booking
    });

  } catch (err) {
    console.error('❌ Error accepting booking:', err);
    next(err);
  }
};


// Get pandit's bookings
exports.getPanditBookings = async (req, res, next) => {
  try {
    const panditId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { panditId };
    if (status) {
      // Support comma-separated statuses e.g. 'notified,pending'
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }

    const pageNum = Math.max(1, parseInt(page));
    const lim = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * lim;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price duration')
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(lim)
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / lim)
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBookingByUser = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };

    if (req.user?.id) {
      // ✅ Logged-in user → strict ownership
      query.customerId = req.user.id;
    } else {
      // ✅ Guest user → fallback
      query.$or = [
        { email: req.body.email },
        { contact: req.body.contact }
      ];
    }

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized"
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'user';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });

  } catch (err) {
    console.error('❌ Cancel error:', err);
    next(err);
  }
};

// Helper to notify admin
exports.notifyAdminBookingAccepted = async (booking, panditId) => {
  const pandit = await Pandit.findById(panditId);
  const service = await Service.findById(booking.serviceId);

  // console.log(`📢 Booking Accepted: ${service.name} by ${pandit.name} for ${booking.name}`);
};

// After successful payment: notify pandits about new paid booking
exports.afterSuccessfulPayment = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate('serviceId', 'name price');

    if (!booking) {
      console.error(`afterSuccessfulPayment: Booking ${bookingId} not found`);
      return;
    }

    console.log(`💳 Payment confirmed for booking ${bookingId}, notifying pandits...`);

    const suitablePandits = await NotificationService.findSuitablePandits(booking);

    if (suitablePandits.length > 0) {
      // We don't have io here, pass null (NotificationService should handle it)
      await NotificationService.notifyPandits(booking, suitablePandits, null);

      booking.status = 'notified';
      booking.notifiedPandits = suitablePandits.map(p => p._id);
      await booking.save();

      console.log(`📢 Notified ${suitablePandits.length} pandits after payment for booking ${bookingId}`);
    } else {
      console.log(`⚠️ No suitable pandits found for booking ${bookingId} after payment`);
    }
  } catch (error) {
    console.error(`❌ afterSuccessfulPayment error for booking ${bookingId}:`, error);
  }
};
