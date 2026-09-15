// backend/controllers/contactController.js

const ContactMessage = require('../models/ContactMessage');
const RateLimit = require('../models/RateLimit');
const emailService = require('../utils/emailService');

// Rate limit configuration
const MAX_MESSAGES_PER_HOUR = 2;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Check rate limit
const checkRateLimit = async (ip) => {
  const record = await RateLimit.findOne({ ip });
  
  if (!record) {
    return { allowed: true };
  }
  
  const now = Date.now();
  const windowStart = record.firstRequest.getTime();
  const timeElapsed = now - windowStart;
  
  // If window has expired, reset
  if (timeElapsed > RATE_LIMIT_WINDOW) {
    await RateLimit.deleteOne({ ip });
    return { allowed: true };
  }
  
  // Check if under limit
  if (record.count < MAX_MESSAGES_PER_HOUR) {
    return { allowed: true };
  }
  
  // Calculate time until reset
  const resetTime = Math.ceil((RATE_LIMIT_WINDOW - timeElapsed) / (60 * 1000));
  
  return {
    allowed: false,
    resetMinutes: resetTime,
    message: `Too many messages. Please try again in ${resetTime} minute(s).`
  };
};

// Update rate limit
const updateRateLimit = async (ip) => {
  const record = await RateLimit.findOne({ ip });
  
  if (!record) {
    await RateLimit.create({ ip, count: 1, firstRequest: new Date() });
  } else {
    record.count += 1;
    record.lastRequest = new Date();
    await record.save();
  }
};

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Validate message length
    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message must be between 10 and 2000 characters'
      });
    }
    
    // Check rate limit
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimit.message,
        retryAfter: rateLimit.resetMinutes * 60
      });
    }
    
    // Create contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      phone: phone || null,
      message,
      ip,
      userAgent,
      status: 'unread'
    });
    
    await contactMessage.save();
    
    // Update rate limit
    await updateRateLimit(ip);
    
    // Send auto-reply email to user (optional)
    try {
      await emailService.sendContactAutoReply(email, name, message);
    } catch (emailError) {
      console.error('Auto-reply email failed:', emailError);
      // Don't fail the request if email fails
    }
    
    // Notify admin via socket (if connected)
    const io = req.app.get('io');
    if (io) {
      io.emit('new_contact_message', {
        id: contactMessage._id,
        name: contactMessage.name,
        email: contactMessage.email,
        createdAt: contactMessage.createdAt
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      messageId: contactMessage._id
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

// Admin: Get all contact messages
exports.getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await ContactMessage.countDocuments(query);
    
    const stats = {
      total: await ContactMessage.countDocuments(),
      unread: await ContactMessage.countDocuments({ status: 'unread' }),
      read: await ContactMessage.countDocuments({ status: 'read' }),
      replied: await ContactMessage.countDocuments({ status: 'replied' }),
      spam: await ContactMessage.countDocuments({ status: 'spam' })
    };
    
    res.json({
      success: true,
      messages,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get single message
exports.getMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Mark as read if it was unread
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }
    
    res.json({ success: true, message });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update message status
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    
    if (!['unread', 'read', 'replied', 'spam'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updateData = { status };
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (status === 'replied') updateData.repliedAt = new Date();
    
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message status updated',
      data: message
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Reply to message
exports.replyToMessage = async (req, res) => {
  try {
    const { reply, adminNote } = req.body;
    
    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Send email reply
    const emailSent = await emailService.sendContactReply(
      message.email,
      message.name,
      reply,
      message.message
    );
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reply email'
      });
    }
    
    // Update message status
    message.status = 'replied';
    message.adminNote = adminNote || message.adminNote;
    message.repliedAt = new Date();
    await message.save();
    
    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
    
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get rate limit stats
exports.getRateLimitStats = async (req, res) => {
  try {
    const blockedIPs = await RateLimit.find({ count: { $gte: MAX_MESSAGES_PER_HOUR } });
    const totalRecords = await RateLimit.countDocuments();
    
    res.json({
      success: true,
      stats: {
        totalIPs: totalRecords,
        blockedIPs: blockedIPs.length,
        maxMessagesPerHour: MAX_MESSAGES_PER_HOUR,
        windowMinutes: RATE_LIMIT_WINDOW / (60 * 1000)
      },
      blockedIPs: blockedIPs.map(ip => ({
        ip: ip.ip,
        count: ip.count,
        firstRequest: ip.firstRequest,
        lastRequest: ip.lastRequest
      }))
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};