const express = require('express');
const router = express.Router();

// Dev-only manual cron triggers
const { distributeROI, checkCaps } = require('../services/roiService');
const { releaseMaturedStakes } = require('../services/stakingService');
const { processAutoCompound } = require('../services/compoundService');
const { expireOldBoosters } = require('../services/boosterService');
const { distributeWeeklyPool } = require('../services/momentumService');
const { checkAndUpdate } = require('../services/rankService');
const { resetDailyLimits } = require('../services/withdrawService');
const User = require('../models/User');
const Session = require('../models/Session');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');

if (process.env.NODE_ENV !== 'development') {
  router.use((req, res) => res.status(404).json({ message: 'Not available in production' }));
  module.exports = router;
  return;
}

router.post('/daily-roi', async (req, res) => {
  const result = await distributeROI();
  res.json({ success: true, job: 'daily-roi', ...result });
});

router.post('/roi-cap', async (req, res) => {
  const result = await checkCaps();
  res.json({ success: true, job: 'roi-cap', ...result });
});

router.post('/staking-release', async (req, res) => {
  const result = await releaseMaturedStakes();
  res.json({ success: true, job: 'staking-release', ...result });
});

router.post('/auto-compound', async (req, res) => {
  const result = await processAutoCompound();
  res.json({ success: true, job: 'auto-compound', ...result });
});

router.post('/booster-expiry', async (req, res) => {
  const result = await expireOldBoosters();
  res.json({ success: true, job: 'booster-expiry', ...result });
});

router.post('/rank-check', async (req, res) => {
  const users = await User.find({ role: 'user' });
  for (const u of users) await checkAndUpdate(u.userId);
  res.json({ success: true, job: 'rank-check', checked: users.length });
});

router.post('/momentum-pool', async (req, res) => {
  const result = await distributeWeeklyPool();
  res.json({ success: true, job: 'momentum-pool', ...result });
});

router.post('/withdrawal-reset', async (req, res) => {
  const result = await resetDailyLimits();
  res.json({ success: true, job: 'withdrawal-reset', ...result });
});

router.post('/token-cleanup', async (req, res) => {
  const deleted = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
  res.json({ success: true, job: 'token-cleanup', deleted: deleted.deletedCount });
});

router.post('/otp-cleanup', async (req, res) => {
  const deleted = await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
  res.json({ success: true, job: 'otp-cleanup', deleted: deleted.deletedCount });
});

router.post('/notification-cleanup', async (req, res) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 3600000); // 30 days
  const deleted = await Notification.deleteMany({ read: true, createdAt: { $lt: cutoff } });
  res.json({ success: true, job: 'notification-cleanup', deleted: deleted.deletedCount });
});

module.exports = router;
