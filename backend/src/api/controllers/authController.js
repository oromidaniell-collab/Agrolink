const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const otplib = require('otplib');
const qrcode = require('qrcode');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Access Token
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// @desc    Register user
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      nationalId,
      username,
      fullName,
      email,
      phone,
      password,
      role,
      location,
      latitude,
      longitude,
      county,
      subCounty
    } = req.body;

    // Ensure email is lowercase
    email = email.toLowerCase().trim();
    username = username.toLowerCase().trim();

    // Validate role-specific requirements
    if (!role || !['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be farmer or buyer' });
    }

    if (role === 'farmer' && !nationalId) {
      return res.status(400).json({ message: 'National ID is required for farmers' });
    }

    // Check if user exists
    const whereConditions = [
      require('sequelize').where(require('sequelize').fn('LOWER', require('sequelize').col('email')), require('sequelize').Op.eq, email),
      { phone },
      require('sequelize').where(require('sequelize').fn('LOWER', require('sequelize').col('username')), require('sequelize').Op.eq, username)
    ];
    if (nationalId) {
      whereConditions.push({ nationalId });
    }

    const userExists = await User.findOne({
      where: {
        [require('sequelize').Op.or]: whereConditions
      }
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists with this email, phone, or username'
      });
    }

    // Create user
    const user = await User.create({
      nationalId: nationalId || null,
      username,
      fullName,
      email,
      phone,
      password,
      role,
      location,
      latitude,
      longitude,
      county,
      subCounty,
      twoFaEnabled: false,
      failedLoginAttempts: 0,
      isVerified: role === 'buyer' // Farmers need manual verification
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await RefreshToken.createToken(user);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        nationalId: user.nationalId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        county: user.county,
        twoFaEnabled: user.twoFaEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // Normalize email input
    if (email && email.includes('@')) {
      email = email.toLowerCase().trim();
    } else if (email) {
      email = email.trim();
    }

    // Find user by email or phone (frontend passes the identifier as 'email')
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: require('sequelize').where(require('sequelize').fn('LOWER', require('sequelize').col('email')), require('sequelize').Op.eq, email.toLowerCase()) },
          { phone: email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check for Account Lock
    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
      return res.status(403).json({
        message: `Account locked. Try again later.`
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
        user.failedLoginAttempts = 0; // Reset attempts after locking
        await user.save();
        return res.status(403).json({ message: 'Account locked due to too many failed attempts' });
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    // Check 2FA
    if (user.twoFaEnabled) {
      return res.json({
        success: true,
        twoFactorRequired: true,
        userId: user.id
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await RefreshToken.createToken(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        county: user.county,
        avatar: user.avatar,
        twoFaEnabled: user.twoFaEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Sign In
exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ message: 'Google Token is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { email: email.toLowerCase() },
          { googleId }
        ]
      } 
    });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        avatar: picture,
        role: 'buyer', // Default role
        password: crypto.randomBytes(16).toString('hex'), // Random password
        isVerified: true,
        googleId
      });
    } else if (!user.googleId) {
        // Link existing account
        user.googleId = googleId;
        if (!user.avatar) user.avatar = picture;
        await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = await RefreshToken.createToken(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        county: user.county,
        avatar: user.avatar,
        twoFaEnabled: user.twoFaEnabled
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// @desc    Refresh Token
exports.refreshToken = async (req, res, next) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: 'Refresh Token is required!' });
  }

  try {
    const refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      return res.status(403).json({ message: 'Refresh token is not in database!' });
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      return res.status(403).json({
        message: 'Refresh token was expired. Please make a new signin request',
      });
    }

    const user = await User.findByPk(refreshToken.userId);
    const newAccessToken = generateAccessToken(user.id, user.role);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enable 2FA Step 1: Generate Secret
exports.enable2FA = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const secret = otplib.authenticator.generateSecret();

    user.twoFaSecret = secret;
    await user.save();

    const otpauth = otplib.authenticator.keyuri(user.email, 'AgroLink', secret);

    qrcode.toDataURL(otpauth, (err, imageUrl) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.json({
        success: true,
        secret,
        qrCode: imageUrl
      });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA Token (For Enabling or Login)
exports.verify2FA = async (req, res, next) => {
  try {
    const { token, userId } = req.body; // userId needed if verifying during login

    // Determine user context (Logged in vs Login flow)
    let user;
    if (req.user) {
      user = await User.findByPk(req.user.id);
    } else if (userId) {
      user = await User.findByPk(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = otplib.authenticator.check(token, user.twoFaSecret);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    // IF enabling 2FA
    if (req.user && !user.twoFaEnabled) {
      user.twoFaEnabled = true;
      await user.save();
      return res.json({ success: true, message: '2FA Enabled Successfully' });
    }

    // IF Logging in
    if (!req.user) {
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = await RefreshToken.createToken(user);

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          location: user.location,
          county: user.county,
          avatar: user.avatar,
          twoFaEnabled: user.twoFaEnabled
        }
      });
    }

    res.json({ success: true, message: 'Token verified' });

  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA
exports.disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);

    const isValid = otplib.authenticator.check(token, user.twoFaSecret);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    user.twoFaEnabled = false;
    user.twoFaSecret = null;
    await user.save();

    res.json({ success: true, message: '2FA Disabled' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'twoFaSecret'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};