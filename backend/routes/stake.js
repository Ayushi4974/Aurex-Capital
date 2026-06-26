const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Staking = require('../models/Staking');
const { createStake, unstake } = require('../services/stakingService');
const { checkAndSetupBooster } = require('../services/boosterService');
const { processInvestment } = require('../services/mlmService');

// POST /api/stake/invest
router.post('/invest', verifyToken, async (req, res, next) => {
  try {
    const { amount, planType } = req.body;
    if (!amount || amount < 100) return res.status(400).json({ success: false, message: 'Minimum investment is $100' });

    const getPackageName = (a) => {
      if (a >= 10000) return 'Nexus Infinity';
      if (a >= 5000) return 'Nexus Titan';
      if (a >= 1000) return 'Nexus Elite';
      if (a >= 500) return 'Nexus Pro';
      return 'Nexus Start';
    };

    const packageName = getPackageName(amount);
    const roiPercentage = planType === 'FTP' ? (amount >= 1000 ? 0.75 : 0.5) : 0;

    const stake = await createStake(req.user.userId, amount, packageName, roiPercentage);

    // Trigger MLM engine for level/direct income on stake
    await processInvestment(req.user.userId, stake.stakeId, amount, packageName);
    await checkAndSetupBooster(req.user.userId, stake.stakeId, amount, stake.lockDate);

    return res.status(201).json({ success: true, message: 'Staked successfully', stake });
  } catch (err) { next(err); }
});

// GET /api/stake/my-stakes
router.get('/my-stakes', verifyToken, async (req, res, next) => {
  try {
    const stakes = await Staking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ success: true, stakes });
  } catch (err) { next(err); }
});

// POST /api/stake/unstake
router.post('/unstake', verifyToken, async (req, res, next) => {
  try {
    const { stakeId } = req.body;
    const result = await unstake(stakeId, req.user.userId);
    return res.json({ success: true, message: 'Unstaked successfully', ...result });
  } catch (err) { next(err); }
});

module.exports = router;
