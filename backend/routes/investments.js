const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { debitWallet, processInvestment } = require('../services/mlmService');
const { checkAndSetupBooster } = require('../services/boosterService');
const notificationService = require('../services/notificationService');

const PACKAGES = {
  'Nexus Start':   { amount: 100,   roiMin: 0.0025, roiMax: 0.02 },
  'Nexus Pro':     { amount: 500,   roiMin: 0.0040, roiMax: 0.02 },
  'Nexus Elite':   { amount: 1000,  roiMin: 0.0050, roiMax: 0.02 },
  'Nexus Titan':   { amount: 5000,  roiMin: 0.0070, roiMax: 0.02 },
  'Nexus Infinity':{ amount: 10000, roiMin: 0.0100, roiMax: 0.02 },
};

const getPackageName = (amount) => {
  if (amount >= 10000) return 'Nexus Infinity';
  if (amount >= 5000) return 'Nexus Titan';
  if (amount >= 1000) return 'Nexus Elite';
  if (amount >= 500) return 'Nexus Pro';
  return 'Nexus Start';
};

// POST /api/investments/purchase
router.post('/purchase', verifyToken, async (req, res, next) => {
  try {
    const { amount, planType } = req.body;
    if (!amount || amount < 100) return res.status(400).json({ success: false, message: 'Minimum investment is $100' });

    const userId = req.user.userId;
    const packageName = getPackageName(amount);
    const earningCap = parseFloat((amount * 2.5).toFixed(4));

    // Check wallet balance
    await debitWallet(userId, 'depositBalance', amount, 'investment',
      `Package purchase: ${packageName} ($${amount})`);

    // Create investment record
    const inv = await Investment.create({
      userId, package: packageName, amount, earningCap,
      planType: planType || 'package', purchaseDate: new Date()
    });

    // Update user's package info
    await User.findOneAndUpdate({ userId }, {
      activePackage: inv.investmentId,
      packageName, packageAmount: amount, investmentDate: new Date()
    });

    // Run MLM engine
    await processInvestment(userId, inv.investmentId, amount, packageName);

    // Check booster
    await checkAndSetupBooster(userId, inv.investmentId, amount, inv.purchaseDate);

    await notificationService.send(userId, '✅ Investment Successful',
      `You've successfully invested $${amount} in ${packageName}. Daily ROI will be credited.`,
      'roi', { investmentId: inv.investmentId, amount, package: packageName });

    return res.status(201).json({ success: true, message: 'Investment successful', investment: inv });
  } catch (err) { next(err); }
});

// GET /api/investments/my-investments
router.get('/my-investments', verifyToken, async (req, res, next) => {
  try {
    const investments = await Investment.find({ userId: req.user.userId }).sort({ purchaseDate: -1 });
    return res.json({ success: true, investments });
  } catch (err) { next(err); }
});

// GET /api/investments/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const inv = await Investment.findOne({ investmentId: req.params.id, userId: req.user.userId });
    if (!inv) return res.status(404).json({ success: false, message: 'Investment not found' });
    return res.json({ success: true, investment: inv });
  } catch (err) { next(err); }
});

module.exports = router;
