const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    // Increase max to reduce false-positives during page loads (product/service lists can be chatty)
    max: process.env.NODE_ENV === 'development' ? 50000 : 10000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1',
});


// Strict limiter for authentication routes
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: false,
});

// Login specific limiter (stricter)
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Create limiter (for resource creation)
exports.createLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 creates per minute
    message: 'Too many items created, please slow down.',
});

// File upload limiter
exports.uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 uploads per minute
    message: 'Too many file uploads, please wait before uploading more.',
});

module.exports = exports;
