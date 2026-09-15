const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateAdmin } = require('../middleware/auth');

// Public: Submit contact form
router.post('/submit', contactController.submitContact);

// Admin: Get all messages
router.get('/admin/messages', authenticateAdmin, contactController.getAllMessages);

// Admin: Get single message (also marks it as read)
router.get('/admin/messages/:id', authenticateAdmin, contactController.getMessage);

// Admin: Update message status (read / replied / spam / unread)
router.patch('/admin/messages/:id/status', authenticateAdmin, contactController.updateMessageStatus);

// Admin: Reply to a message (sends email + marks as replied)
router.post('/admin/messages/:id/reply', authenticateAdmin, contactController.replyToMessage);

// Admin: Delete message
router.delete('/admin/messages/:id', authenticateAdmin, contactController.deleteMessage);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Contact API is working!' });
});

module.exports = router;
