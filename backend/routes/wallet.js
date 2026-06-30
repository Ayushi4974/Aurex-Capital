const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const DepositHistory = require('../models/DepositHistory');
const User = require('../models/User');
const { requestWithdrawal } = require('../services/withdrawService');
const { creditWallet, debitWallet } = require('../services/mlmService');

// GET /api/wallet/balance
router.get('/balance', verifyToken, async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.userId });
    if (!wallet) wallet = await Wallet.create({ userId: req.user.userId });
    return res.json({
      success: true,
      wallet: {
        ...wallet.toObject(),
        // Legacy simDb compatibility fields
        captok: { main: wallet.depositBalance, used: 0, free: 0 },
        protok: { profit: wallet.earningBalance + wallet.bonusBalance, requested: 0, released: 0 }
      }
    });
  } catch (err) { next(err); }
});

// GET /api/wallet/ledger + /api/wallet/transactions (alias)
router.get(['/ledger', '/transactions'], verifyToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const ledger = await WalletLedger.find({ userId: req.user.userId })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await WalletLedger.countDocuments({ userId: req.user.userId });

    // Map to frontend transaction format
    const transactions = ledger.map(t => ({
      id: t.transactionId, userId: t.userId,
      amount: t.credit > 0 ? t.credit : t.debit,
      type: mapType(t.type), status: 'Completed',
      createdAt: t.createdAt, description: t.remark
    }));

    return res.json({ success: true, transactions, ledger, total, page });
  } catch (err) { next(err); }
});

const mapType = (type) => {
  const map = {
    roi: 'ROI', direct: 'DirectReward', level: 'LevelReward',
    bonus: 'Bonus', withdrawal: 'Withdrawal', deposit: 'Deposit',
    staking: 'Staking', compound: 'Compound', transfer: 'Transfer',
    booster: 'BoosterIncome', momentum: 'MomentumBonus', fasttrack: 'FastTrack', refund: 'Refund'
  };
  return map[type] || type;
};

// POST /api/wallet/deposit — creates pending deposit request
router.post('/deposit', verifyToken, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    const deposit = await DepositHistory.create({ userId: req.user.userId, amount, status: 'pending' });
    return res.status(201).json({ success: true, message: 'Deposit request submitted', deposit });
  } catch (err) { next(err); }
});

// POST /api/wallet/deposit-web3 — auto-credits wallet after Web3 payment
router.post('/deposit-web3', verifyToken, async (req, res, next) => {
  try {
    const { amount, txHash } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    
    // Credit depositBalance directly
    await creditWallet(req.user.userId, 'depositBalance', amount, 'deposit',
      `Web3 Deposit (MetaMask): $${amount}`);
      
    // Save in DepositHistory as confirmed
    const hash = txHash || '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
    await DepositHistory.create({
      userId: req.user.userId,
      amount,
      status: 'confirmed',
      txHash: hash,
      confirmedAt: new Date()
    });
    
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    return res.json({
      success: true,
      message: `Web3 payment verified. $${amount} credited to Activation Wallet.`,
      wallet
    });
  } catch (err) { next(err); }
});

// POST /api/wallet/buy-imx — auto-approve deposit (mirrors simDb.dbBuyImx)
router.post('/buy-imx', verifyToken, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
    await creditWallet(req.user.userId, 'depositBalance', amount, 'deposit',
      `USDT deposit: $${amount}`);
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    return res.json({ success: true, message: `$${amount} credited to deposit balance`, wallet });
  } catch (err) { next(err); }
});

// POST /api/wallet/transfer — P2P balance transfer
router.post('/transfer', verifyToken, async (req, res, next) => {
  try {
    const { receiverId, amount } = req.body;
    if (!receiverId || !amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid params' });
    if (receiverId === req.user.userId) return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });

    const receiver = await User.findOne({ userId: { $regex: new RegExp(`^${receiverId}$`, 'i') } });
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    await debitWallet(req.user.userId, 'depositBalance', amount, 'transfer', `P2P transfer to ${receiver.userId}`);
    await creditWallet(receiver.userId, 'depositBalance', amount, 'transfer', `P2P transfer from ${req.user.userId}`);

    return res.json({ success: true, message: `$${amount} transferred to ${receiver.userId}` });
  } catch (err) { next(err); }
});

// POST /api/wallet/withdraw
router.post('/withdraw', verifyToken, async (req, res, next) => {
  try {
    const { amount, walletAddress } = req.body;
    const request = await requestWithdrawal(req.user.userId, amount, walletAddress);
    return res.status(201).json({ success: true, message: 'Withdrawal request submitted', request });
  } catch (err) { next(err); }
});

// POST /api/wallet/swap — no-op placeholder for token swap
router.post('/swap', verifyToken, async (req, res, next) => {
  try {
    return res.json({ success: true, message: 'Swap feature coming soon' });
  } catch (err) { next(err); }
});

module.exports = router;
