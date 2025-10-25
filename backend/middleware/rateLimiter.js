const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Subscription creation rate limiter
 */
const subscriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 subscriptions per hour
  message: {
    success: false,
    message: 'Too many subscription attempts, please try again later.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  subscriptionLimiter,
};

