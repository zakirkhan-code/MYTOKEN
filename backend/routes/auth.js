// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendResetEmail } = require('../utils/email');
const { validateEmail, validatePassword, validateWalletAddress } = require('../utils/validators');
const auth = require('../middleware/auth');

// ============================================
// REGISTER - NOW WITH WALLET MANDATORY ✅
// ============================================

router.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword, walletAddress } = req.body;

    // Validation
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // ✅ WALLET ADDRESS MANDATORY
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required. Please connect your wallet first.'
      });
    }

    // ✅ WALLET FORMAT VALIDATION
    if (!validateWalletAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format. Use Ethereum address (0x...)'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check if wallet already used
    user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (user) {
      return res.status(400).json({ success: false, message: 'Wallet already connected to another account' });
    }

    // Create new user
    user = new User({
      email: email.toLowerCase(),
      password,
      walletAddress: walletAddress.toLowerCase()
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for verification link.',
      userId: user._id,
      email: user.email,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// VERIFY EMAIL - NOW PROPERLY SAVES TO DB ✅
// ============================================

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findOne({
      email: decoded.email,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    // ✅ PROPERLY UPDATE EMAIL VERIFICATION
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Save changes
    await user.save();

    // ✅ VERIFY IT WAS SAVED
    const updatedUser = await User.findById(user._id);
    if (!updatedUser.emailVerified) {
      throw new Error('Email verification failed to save to database');
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
      userId: user._id,
      emailVerified: true
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LOGIN - NOW WITH WALLET CHECK ✅
// ============================================

router.post('/login', async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Optional: Check if wallet is being connected
    if (walletAddress && !validateWalletAddress(walletAddress)) {
      return res.status(400).json({ success: false, message: 'Invalid wallet address format' });
    }

    // Get user with password field
    let user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ success: false, message: 'Account locked. Try again later.' });
    }

    // Check if account is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account banned. Reason: ${user.banReason || 'Security violation'}`
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
        requiresEmailVerification: true,
        userId: user._id
      });
    }

    // ✅ CHECK WALLET CONNECTION
    if (walletAddress && !user.walletAddress) {
      user.walletAddress = walletAddress.toLowerCase();
      await user.save();
    } else if (!user.walletAddress && !walletAddress) {
      // Wallet not connected - require it
      return res.status(400).json({
        success: false,
        message: 'Please connect your wallet to login',
        requiresWallet: true,
        userId: user._id
      });
    }

    // Check if 2FA is enabled
    if (user.twoFAEnabled) {
      return res.json({
        success: true,
        message: '2FA required',
        requires2FA: true,
        tempToken: jwt.sign({ userId: user._id, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' })
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: true
    });
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// LOGOUT
// ============================================

router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// FORGOT PASSWORD
// ============================================

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ success: true, message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    user.emailVerificationToken = resetToken;
    user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    // Send reset email
    try {
      await sendResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// RESET PASSWORD
// ============================================

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================
// GET CURRENT USER
// ============================================

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CHECK EMAIL VERIFICATION STATUS
// ============================================

router.get('/check-verification/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      email: user.email,
      emailVerified: user.emailVerified,
      walletAddress: user.walletAddress,
      requiresVerification: !user.emailVerified
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;