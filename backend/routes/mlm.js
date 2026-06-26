const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const TeamBusiness = require('../models/TeamBusiness');
const BinaryTree = require('../models/BinaryTree');
const LevelIncome = require('../models/LevelIncome');
const DirectBonus = require('../models/DirectBonus');
const ROIHistory = require('../models/ROIHistory');
const RankHistory = require('../models/RankHistory');
const LevelUnlock = require('../models/LevelUnlock');

// GET /api/mlm/tree — binary tree data
router.get('/tree', verifyToken, async (req, res, next) => {
  try {
    const userId = req.query.root || req.user.userId;
    const buildTree = async (uid, depth = 0, max = 5) => {
      if (depth > max) return null;
      const node = await BinaryTree.findOne({ userId: uid });
      const user = await User.findOne({ userId: uid });
      if (!user) return null;
      return {
        userId: user.userId, name: user.name, rank: user.rank, status: user.status,
        position: node?.position || '', depth,
        left: node?.leftChild ? await buildTree(node.leftChild, depth + 1, max) : null,
        right: node?.rightChild ? await buildTree(node.rightChild, depth + 1, max) : null,
      };
    };
    const tree = await buildTree(userId);
    return res.json({ success: true, tree });
  } catch (err) { next(err); }
});

// GET /api/mlm/business — volume stats
router.get('/business', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    const tb = await TeamBusiness.findOne({ userId: req.user.userId });
    const unlock = await LevelUnlock.findOne({ userId: req.user.userId });
    return res.json({
      success: true,
      business: {
        leftBusiness: tb?.leftBusiness || 0,
        rightBusiness: tb?.rightBusiness || 0,
        totalBusiness: tb?.totalBusiness || 0,
        directCount: user?.directCount || 0,
        teamCount: user?.teamCount || 0,
        levelsUnlocked: unlock?.maxLevel || 0,
        todayBusiness: tb?.todayBusiness || 0,
        weeklyBusiness: tb?.weeklyBusiness || 0,
        monthlyBusiness: tb?.monthlyBusiness || 0,
      }
    });
  } catch (err) { next(err); }
});

// GET /api/mlm/earnings — income summary
router.get('/earnings', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [directBonuses, levelIncomes, roiHistory] = await Promise.all([
      DirectBonus.find({ toUser: userId }),
      LevelIncome.find({ receiver: userId }),
      ROIHistory.find({ userId }),
    ]);

    const totalDirect = directBonuses.reduce((s, d) => s + d.amount, 0);
    const totalLevel = levelIncomes.reduce((s, l) => s + l.amount, 0);
    const totalROI = roiHistory.reduce((s, r) => s + r.amount, 0);

    return res.json({
      success: true,
      earnings: {
        directBonus: { total: totalDirect, count: directBonuses.length, records: directBonuses.slice(0, 20) },
        levelIncome: { total: totalLevel, count: levelIncomes.length, records: levelIncomes.slice(0, 20) },
        roi: { total: totalROI, count: roiHistory.length, records: roiHistory.slice(0, 20) },
        grandTotal: totalDirect + totalLevel + totalROI
      }
    });
  } catch (err) { next(err); }
});

// GET /api/mlm/rank
router.get('/rank', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    const rankHistory = await RankHistory.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(10);
    const RANKS = [
      { rank: 'Scout', business: 2500 }, { rank: 'Ranger', business: 5000 },
      { rank: 'Explorer', business: 10000 }, { rank: 'Navigator', business: 25000 },
      { rank: 'Visionary', business: 50000 }, { rank: 'Titan', business: 100000 },
      { rank: 'Galaxy', business: 250000 }, { rank: 'Nexus Crown', business: 500000 },
      { rank: 'Quantum Legend', business: 1000000 }
    ];
    const currentRank = user?.rank || 'Member';
    const currentIdx = RANKS.findIndex(r => r.rank === currentRank);
    const nextRank = RANKS[currentIdx + 1] || null;
    return res.json({ success: true, rank: currentRank, nextRank, rankHistory, totalBusiness: user?.totalBusiness || 0 });
  } catch (err) { next(err); }
});

// GET /api/mlm/level-income
router.get('/level-income', verifyToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const records = await LevelIncome.find({ receiver: req.user.userId })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await LevelIncome.countDocuments({ receiver: req.user.userId });
    return res.json({ success: true, records, total });
  } catch (err) { next(err); }
});

// GET /api/mlm/direct-bonus
router.get('/direct-bonus', verifyToken, async (req, res, next) => {
  try {
    const records = await DirectBonus.find({ toUser: req.user.userId }).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, records });
  } catch (err) { next(err); }
});

module.exports = router;
