const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const resendVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again in one minute',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

module.exports = { apiLimiter, resendVerifyLimiter };
