// backend/middleware/errorHandler.js - Production-ready error handler

const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging (never expose to client)
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({
      success: false,
      message: field
        ? `An account with this ${field} already exists.`
        : 'A duplicate entry was detected.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  // Cast error (invalid MongoDB ID)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  // HTTP status from thrown error
  const status = err.statusCode || err.status || 500;

  // User-friendly messages by status
  const statusMessages = {
    400: err.message || 'Invalid request.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: err.message || 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    500: 'An internal server error occurred. Please try again later.',
  };

  const message = statusMessages[status] || 'An unexpected error occurred.';

  return res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
