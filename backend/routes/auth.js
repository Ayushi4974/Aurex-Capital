const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Session = require('../models/Session');
const OTP = require('../models/OTP');
const PasswordReset = require('../models/PasswordReset');
const ActivityLog = require('../models/ActivityLog');
const { processRegistration } = require('../services/mlmService');
const notificationService = require('../services/notificationService');
const { authLimiter } = require('../middleware/rateLimiter');

const generateTokens = (user) => {
  const payload = { userId: user.userId, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
  return { token, refreshToken };
};

// POST /api/auth/register
router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('sponsorId').notEmpty(),
  body('name').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, mobile, sponsorId, placement, username } = req.body;

    const sponsor = await User.findOne({ userId: { $regex: new RegExp(`^${sponsorId}$`, 'i') } });
    if (!sponsor) return res.status(400).json({ success: false, message: 'Invalid Sponsor ID' });

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);

    let finalUsername = (username || email.split('@')[0] || '').toLowerCase().trim();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const checkName = attempts === 0 ? finalUsername : `${finalUsername}${Math.floor(100 + Math.random() * 900)}`;
      const existing = await User.findOne({ username: checkName });
      if (!existing) {
        finalUsername = checkName;
        isUnique = true;
      }
      attempts++;
    }

    const newUser = new User({
      name, email, password: hashedPassword,
      plainPassword: password,
      username: finalUsername,
      mobile: mobile || '', sponsorId: sponsor.userId,
      position: (placement || 'left').toLowerCase(),
      role: 'user', status: 'active'
    });
    await newUser.save();

    // Create UserProfile
    await UserProfile.create({ userId: newUser.userId, fullName: name });

    // Run MLM registration (binary placement, wallet, team business)
    await processRegistration(newUser);

    const { token, refreshToken } = generateTokens(newUser);
    await Session.create({
      userId: newUser.userId, token, refreshToken,
      ip: req.ip, userAgent: req.get('User-Agent') || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000)
    });

    await notificationService.send(
      newUser.userId, '🎉 Welcome to AURAX!',
      `Your account has been created successfully. Your User ID is ${newUser.userId}.`,
      'system'
    );

    const userObj = newUser.toObject();
    delete userObj.password;
    userObj.wallet = { depositBalance: 0, earningBalance: 0, bonusBalance: 0, totalBalance: 0 };

    return res.status(201).json({ success: true, message: 'Registration successful', token, refreshToken, user: formatUser(userObj) });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { userId, password, email } = req.body;
    const query = userId
      ? { userId: { $regex: new RegExp(`^${userId}$`, 'i') } }
      : { email: email?.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Account is blocked' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const { token, refreshToken } = generateTokens(user);
    await Session.create({
      userId: user.userId, token, refreshToken,
      ip: req.ip, userAgent: req.get('User-Agent') || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 3600000)
    });

    await User.findOneAndUpdate({ userId: user.userId }, { lastLogin: new Date() });
    await ActivityLog.create({ userId: user.userId, login: new Date(), ip: req.ip });

    const Wallet = require('../models/Wallet');
    const wallet = await Wallet.findOne({ userId: user.userId });
    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ success: true, token, refreshToken, user: formatUser(userObj, wallet) });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await Session.findOneAndUpdate({ token }, { isActive: false });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ userId: decoded.userId });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const tokens = generateTokens(user);
    return res.json({ success: true, ...tokens });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If email exists, reset link sent.' });
    const token = require('crypto').randomBytes(32).toString('hex');
    await PasswordReset.create({
      userId: user.userId, token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    });
    // In production: send email. For now just return token in dev.
    const msg = process.env.NODE_ENV === 'development' ? `Reset token: ${token}` : 'Reset link sent to email.';
    return res.json({ success: true, message: msg, ...(process.env.NODE_ENV === 'development' && { token }) });
  } catch (err) { next(err); }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const reset = await PasswordReset.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
    if (!reset) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    const hashed = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ userId: reset.userId }, { password: hashed, plainPassword: password });
    reset.used = true;
    await reset.save();
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
});

// POST /api/auth/change-password
router.post('/change-password', require('../middleware/auth').verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ userId: req.user.userId });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = await bcrypt.hash(newPassword, 12);
    user.plainPassword = newPassword;
    await user.save();
    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp, type } = req.body;
    const record = await OTP.findOne({ email, otp, type, verified: false, expiresAt: { $gt: new Date() } });
    if (!record) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    record.verified = true;
    await record.save();
    return res.json({ success: true, message: 'OTP verified' });
  } catch (err) { next(err); }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp, type, expiresAt: new Date(Date.now() + 5 * 60000) });
    return res.json({ success: true, message: 'OTP sent', ...(process.env.NODE_ENV === 'development' && { otp }) });
  } catch (err) { next(err); }
});

// POST /api/auth/validate-sponsor
router.post('/validate-sponsor', async (req, res, next) => {
  try {
    const { sponsorId } = req.body;
    const sponsor = await User.findOne({ userId: { $regex: new RegExp(`^${sponsorId}$`, 'i') } });
    if (!sponsor) return res.json({ success: false, valid: false, message: 'Sponsor ID not found' });
    return res.json({ success: true, valid: true, sponsorName: sponsor.name, sponsorId: sponsor.userId });
  } catch (err) { next(err); }
});

// POST /api/auth/validate-username
router.post('/validate-username', async (req, res, next) => {
  try {
    const { username } = req.body;
    const exists = await User.findOne({ username });
    return res.json({ success: true, available: !exists });
  } catch (err) { next(err); }
});

// Format user object to match frontend expectations
const formatUser = (user, wallet = null) => ({
  userId: user.userId,
  name: user.name || user.fullName || '',
  email: user.email,
  mobile: user.mobile || '',
  role: user.role,
  sponsorId: user.sponsorId || '',
  rank: user.rank || 'Member',
  status: user.status,
  isBlocked: user.isBlocked || false,
  directCount: user.directCount || 0,
  teamCount: user.teamCount || 0,
  totalBusiness: user.totalBusiness || 0,
  investmentDate: user.investmentDate,
  packageName: user.packageName || '',
  packageAmount: user.packageAmount || 0,
  levelUnlocked: user.levelUnlocked || 0,
  walletAddress: user.walletAddress || '',
  createdAt: user.createdAt,
  wallet: wallet ? {
    depositBalance: wallet.depositBalance,
    earningBalance: wallet.earningBalance,
    bonusBalance: wallet.bonusBalance,
    stakingBalance: wallet.stakingBalance,
    compoundBalance: wallet.compoundBalance,
    lockedBalance: wallet.lockedBalance,
    totalBalance: wallet.totalBalance,
    // Legacy fields for simDb compatibility
    captok: { main: wallet.depositBalance, used: 0, free: 0 },
    protok: { profit: wallet.earningBalance + wallet.bonusBalance, requested: 0, released: 0 }
  } : {
    depositBalance: 0, earningBalance: 0, bonusBalance: 0,
    captok: { main: 0, used: 0, free: 0 },
    protok: { profit: 0, requested: 0, released: 0 }
  },
  business: {
    self: user.packageAmount || 0,
    directTeam: user.directCount || 0,
    totalTeam: user.teamCount || 0,
    leftBusiness: 0,
    rightBusiness: 0
  }
});

module.exports = router;
module.exports.formatUser = formatUser;
