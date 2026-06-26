const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Wallet = require('../models/Wallet');
const BinaryTree = require('../models/BinaryTree');
const Notification = require('../models/Notification');
const { formatUser } = require('./auth');

// GET /api/user/profile
router.get('/profile', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    const profile = await UserProfile.findOne({ userId: req.user.userId });
    return res.json({ success: true, user: { ...formatUser(user.toObject(), wallet), profile } });
  } catch (err) { next(err); }
});

// PUT /api/user/profile
router.put('/profile', verifyToken, async (req, res, next) => {
  try {
    const { fullName, mobile, country, state, city, address, walletAddress, bankDetails } = req.body;
    if (walletAddress) await User.findOneAndUpdate({ userId: req.user.userId }, { walletAddress });
    if (mobile) await User.findOneAndUpdate({ userId: req.user.userId }, { mobile });
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { fullName, country, state, city, address, bankDetails },
      { new: true, upsert: true }
    );
    return res.json({ success: true, profile });
  } catch (err) { next(err); }
});

// GET /api/user/direct-team
router.get('/direct-team', verifyToken, async (req, res, next) => {
  try {
    const directs = await User.find({ sponsorId: req.user.userId });
    const result = await Promise.all(directs.map(async (u) => {
      const wallet = await Wallet.findOne({ userId: u.userId });
      return formatUser(u.toObject(), wallet);
    }));
    return res.json({ success: true, team: result, count: result.length });
  } catch (err) { next(err); }
});

// GET /api/user/tree/:rootId — recursive binary tree for visualization
router.get('/tree/:rootId', verifyToken, async (req, res, next) => {
  try {
    const rootId = req.params.rootId || req.user.userId;
    const buildTree = async (userId, depth = 0, maxDepth = 5) => {
      if (depth > maxDepth) return null;
      const node = await BinaryTree.findOne({ userId });
      const user = await User.findOne({ userId });
      if (!user) return null;
      return {
        userId: user.userId, name: user.name, rank: user.rank,
        position: node?.position || '', depth,
        left: node?.leftChild ? await buildTree(node.leftChild, depth + 1, maxDepth) : null,
        right: node?.rightChild ? await buildTree(node.rightChild, depth + 1, maxDepth) : null,
      };
    };
    const tree = await buildTree(rootId);
    return res.json({ success: true, tree });
  } catch (err) { next(err); }
});

// GET /api/user/notifications
router.get('/notifications', verifyToken, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 }).limit(50);
    const unread = notifications.filter(n => !n.read).length;
    return res.json({ success: true, notifications, unread });
  } catch (err) { next(err); }
});

// PUT /api/user/notifications/read
router.put('/notifications/read', verifyToken, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.userId }, { read: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

module.exports = router;
