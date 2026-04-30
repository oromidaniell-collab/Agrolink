const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  googleAuth,
  getMe,
  refreshToken,
  enable2FA,
  verify2FA,
  disable2FA
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', [
  body('fullName').notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

router.post('/google', googleAuth);

router.post('/refresh-token', refreshToken);

// 2FA Routes
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', protect, disable2FA);

router.get('/me', protect, getMe);

module.exports = router;