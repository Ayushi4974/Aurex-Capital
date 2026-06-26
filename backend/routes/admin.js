const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Staking = require('../models/Staking');
const DepositHistory = require('../models/DepositHistory');
const WithdrawRequest = require('../models/WithdrawRequest');
const Investment = require('../models/Investment');
const DirectBonus = require('../models/DirectBonus');
const LevelIncome = require('../models/LevelIncome');
const ROIHistory = require('../models/ROIHistory');
const AuditLog = require('../models/AuditLog');
const SystemConfig = require('../models/SystemConfig');
const { approveWithdrawal, rejectWithdrawal } = require('../services/withdrawService');
const { creditWallet } = require('../services/mlmService');
const { formatUser } = require('./auth');

// All admin routes require auth + admin role
router.use(verifyToken, requireAdmin);

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) query.$or = [
      { userId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (status) query.status = status;
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(query);
    const result = await Promise.all(users.map(async u => {
      const wallet = await Wallet.findOne({ userId: u.userId });
      return formatUser(u.toObject(), wallet);
    }));
    return res.json({ success: true, users: result, total });
  } catch (err) { next(err); }
});

// GET /api/admin/stakes
router.get('/stakes', async (req, res, next) => {
  try {
    const stakes = await Staking.find().sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, stakes });
  } catch (err) { next(err); }
});

// GET /api/admin/deposits/pending
router.get('/deposits/pending', async (req, res, next) => {
  try {
    const deposits = await DepositHistory.find({ status: 'pending' }).sort({ createdAt: -1 });
    return res.json({ success: true, deposits });
  } catch (err) { next(err); }
});

// POST /api/admin/deposits/approve
router.post('/deposits/approve', async (req, res, next) => {
  try {
    const { depositId } = req.body;
    const deposit = await DepositHistory.findOne({ depositId });
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    if (deposit.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

    await creditWallet(deposit.userId, 'depositBalance', deposit.amount, 'deposit',
      `Deposit approved: $${deposit.amount}`, depositId);
    deposit.status = 'confirmed';
    deposit.confirmedAt = new Date();
    await deposit.save();

    await AuditLog.create({ adminId: req.user.userId, userId: deposit.userId, action: 'APPROVE_DEPOSIT', module: 'Deposits', after: { depositId, amount: deposit.amount } });
    return res.json({ success: true, message: 'Deposit approved', deposit });
  } catch (err) { next(err); }
});

// POST /api/admin/deposits/reject
router.post('/deposits/reject', async (req, res, next) => {
  try {
    const { depositId, reason } = req.body;
    const deposit = await DepositHistory.findOne({ depositId });
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit not found' });
    deposit.status = 'rejected';
    await deposit.save();
    await AuditLog.create({ adminId: req.user.userId, userId: deposit.userId, action: 'REJECT_DEPOSIT', module: 'Deposits' });
    return res.json({ success: true, message: 'Deposit rejected' });
  } catch (err) { next(err); }
});

// GET /api/admin/withdrawals
router.get('/withdrawals', async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const withdrawals = await WithdrawRequest.find(query).sort({ requestedAt: -1 }).limit(200);
    return res.json({ success: true, withdrawals });
  } catch (err) { next(err); }
});

// POST /api/admin/withdrawals/process
router.post('/withdrawals/process', async (req, res, next) => {
  try {
    const { withdrawalId, status } = req.body;
    let result;
    if (status === 'Completed' || status === 'approved') {
      result = await approveWithdrawal(withdrawalId, req.user.userId);
    } else {
      result = await rejectWithdrawal(withdrawalId, req.body.reason || '');
    }
    await AuditLog.create({ adminId: req.user.userId, action: `WITHDRAWAL_${status.toUpperCase()}`, module: 'Withdrawals', after: { withdrawalId } });
    return res.json({ success: true, message: `Withdrawal ${status}`, withdrawal: result });
  } catch (err) { next(err); }
});

// POST /api/admin/declare-psp — credit profit share
router.post('/declare-psp', async (req, res, next) => {
  try {
    const { percentage } = req.body;
    if (!percentage || percentage <= 0) return res.status(400).json({ success: false, message: 'Invalid percentage' });
    const investments = await Investment.find({ status: 'active' });
    let credited = 0;
    for (const inv of investments) {
      const amount = parseFloat((inv.amount * percentage / 100).toFixed(4));
      await creditWallet(inv.userId, 'earningBalance', amount, 'roi',
        `PSP Distribution: ${percentage}% on $${inv.amount}`);
      credited++;
    }
    await AuditLog.create({ adminId: req.user.userId, action: 'DECLARE_PSP', module: 'System', after: { percentage, credited } });
    return res.json({ success: true, message: `PSP distributed to ${credited} investors`, percentage, credited });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, activeInvestments, pendingDeposits, pendingWithdrawals, totalROI] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Investment.countDocuments({ status: 'active' }),
      DepositHistory.countDocuments({ status: 'pending' }),
      WithdrawRequest.countDocuments({ status: 'pending' }),
      ROIHistory.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    const directBonusTotal = await DirectBonus.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const levelIncomeTotal = await LevelIncome.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    return res.json({
      success: true, stats: {
        totalUsers, activeInvestments, pendingDeposits, pendingWithdrawals,
        totalROIDistributed: totalROI[0]?.total || 0,
        totalDirectBonus: directBonusTotal[0]?.total || 0,
        totalLevelIncome: levelIncomeTotal[0]?.total || 0,
      }
    });
  } catch (err) { next(err); }
});

// PUT /api/admin/user/:id/block
router.put('/user/:id/block', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const before = { isBlocked: user.isBlocked };
    user.isBlocked = !user.isBlocked;
    user.status = user.isBlocked ? 'blocked' : 'active';
    await user.save();
    await AuditLog.create({ adminId: req.user.userId, userId: id, action: user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', module: 'Users', before, after: { isBlocked: user.isBlocked } });
    return res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
  } catch (err) { next(err); }
});

// POST /api/admin/settings
router.post('/settings', async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) config = new SystemConfig();
    Object.assign(config, req.body);
    await config.save();
    return res.json({ success: true, config });
  } catch (err) { next(err); }
});

// GET /api/admin/settings
router.get('/settings', async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) config = await SystemConfig.create({});
    return res.json({ success: true, config });
  } catch (err) { next(err); }
});

module.exports = router;
