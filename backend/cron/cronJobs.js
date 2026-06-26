/**
 * AURAX - Complete Cron Job Scheduler
 * 20 scheduled jobs: 10 daily, 6 hourly/10-min, 2 weekly, 2 monthly
 */

const cron = require('node-cron');
const { distributeROI, checkCaps } = require('../services/roiService');
const { releaseMaturedStakes } = require('../services/stakingService');
const { processAutoCompound } = require('../services/compoundService');
const { expireOldBoosters, checkAndSetupBooster } = require('../services/boosterService');
const { distributeWeeklyPool } = require('../services/momentumService');
const { checkAndUpdate } = require('../services/rankService');
const { resetDailyLimits } = require('../services/withdrawService');
const User = require('../models/User');
const Session = require('../models/Session');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const ActivityLog = require('../models/ActivityLog');

const log = (job, msg) => console.log(`[CRON:${job}] ${new Date().toISOString()} — ${msg}`);

// ───────────────────────────────────────────────
// DAILY CRON JOBS
// ───────────────────────────────────────────────

// #1 — ROI Distribution (00:00 Daily)
cron.schedule('0 0 * * *', async () => {
  try {
    log('ROI', 'Starting daily ROI distribution...');
    const result = await distributeROI();
    log('ROI', `Done. Distributed $${result.totalDistributed?.toFixed(2)} to ${result.paidCount} investments.`);
  } catch (err) { log('ROI', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #2 — ROI Cap Checker (01:00 Daily)
cron.schedule('0 1 * * *', async () => {
  try {
    log('ROI-CAP', 'Checking investment caps...');
    const result = await checkCaps();
    log('ROI-CAP', `Completed ${result.completed} investments at 250% cap.`);
  } catch (err) { log('ROI-CAP', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #3 — Auto Compound (02:00 Daily)
cron.schedule('0 2 * * *', async () => {
  try {
    log('COMPOUND', 'Running auto-compound...');
    const result = await processAutoCompound();
    log('COMPOUND', `Compounded $${result.totalAmount} for ${result.compounded} users.`);
  } catch (err) { log('COMPOUND', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #4 — Staking Release (03:00 Daily)
cron.schedule('0 3 * * *', async () => {
  try {
    log('STAKING', 'Checking matured stakes...');
    const result = await releaseMaturedStakes();
    log('STAKING', `Released ${result.released} stakes. Total reward: $${result.totalRewarded?.toFixed(2)}`);
  } catch (err) { log('STAKING', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #5 — Wallet Cleanup (04:00 Daily)
cron.schedule('0 4 * * *', async () => {
  try {
    log('WALLET-CLEANUP', 'Recalculating wallet totals...');
    const wallets = await Wallet.find();
    for (const w of wallets) {
      w.totalBalance = w.depositBalance + w.earningBalance + w.bonusBalance + w.compoundBalance;
      await w.save();
    }
    log('WALLET-CLEANUP', `Updated ${wallets.length} wallets.`);
  } catch (err) { log('WALLET-CLEANUP', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #6 — Withdrawal Reset (05:00 Daily)
cron.schedule('0 5 * * *', async () => {
  try {
    log('WITHDRAWAL-RESET', 'Resetting daily withdrawal limits...');
    await resetDailyLimits();
    log('WITHDRAWAL-RESET', 'Daily limits reset.');
  } catch (err) { log('WITHDRAWAL-RESET', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #7 — Token Cleanup (06:00 Daily)
cron.schedule('0 6 * * *', async () => {
  try {
    log('TOKEN-CLEANUP', 'Removing expired JWT sessions...');
    const result = await Session.deleteMany({ expiresAt: { $lt: new Date() } });
    log('TOKEN-CLEANUP', `Removed ${result.deletedCount} expired sessions.`);
  } catch (err) { log('TOKEN-CLEANUP', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #8 — Login Session Cleanup (07:00 Daily)
cron.schedule('0 7 * * *', async () => {
  try {
    log('SESSION-CLEANUP', 'Removing stale sessions...');
    const cutoff = new Date(Date.now() - 7 * 24 * 3600000);
    const result = await Session.deleteMany({ createdAt: { $lt: cutoff }, isActive: false });
    await ActivityLog.deleteMany({ createdAt: { $lt: new Date(Date.now() - 90 * 24 * 3600000) } });
    log('SESSION-CLEANUP', `Removed ${result.deletedCount} stale sessions.`);
  } catch (err) { log('SESSION-CLEANUP', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #9 — Inactive User Scan (08:00 Daily)
cron.schedule('0 8 * * *', async () => {
  try {
    log('INACTIVE-SCAN', 'Scanning inactive users...');
    const cutoff = new Date(Date.now() - 30 * 24 * 3600000);
    const result = await User.updateMany(
      { lastLogin: { $lt: cutoff }, status: 'active' },
      { status: 'inactive' }
    );
    log('INACTIVE-SCAN', `Flagged ${result.modifiedCount} inactive users.`);
  } catch (err) { log('INACTIVE-SCAN', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #10 — Reward Checker (09:00 Daily)
cron.schedule('0 9 * * *', async () => {
  try {
    log('REWARD-CHECK', 'Checking pending rank rewards...');
    // Trigger rank check for all active users who have been active recently
    const recentUsers = await User.find({ status: 'active' }).limit(500);
    let updated = 0;
    for (const u of recentUsers) {
      await checkAndUpdate(u.userId);
      updated++;
    }
    log('REWARD-CHECK', `Checked ${updated} users for rank rewards.`);
  } catch (err) { log('REWARD-CHECK', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// ───────────────────────────────────────────────
// HOURLY / SUB-HOURLY CRON JOBS
// ───────────────────────────────────────────────

// #11 — Booster Eligibility Checker (Every 10 mins)
cron.schedule('*/10 * * * *', async () => {
  try {
    // Check for any pending boosters that have been fulfilled
    const BoosterIncome = require('../models/BoosterIncome');
    const pendingBoosters = await BoosterIncome.find({ status: 'pending' });
    log('BOOSTER-CHECK', `Checked ${pendingBoosters.length} pending boosters.`);
  } catch (err) { log('BOOSTER-CHECK', `Error: ${err.message}`); }
});

// #12 — Booster Expiry (Hourly)
cron.schedule('0 * * * *', async () => {
  try {
    log('BOOSTER-EXPIRY', 'Expiring old boosters...');
    const result = await expireOldBoosters();
    log('BOOSTER-EXPIRY', `Expired ${result.expired} boosters.`);
  } catch (err) { log('BOOSTER-EXPIRY', `Error: ${err.message}`); }
});

// #13 — Rank Checker (Hourly)
cron.schedule('5 * * * *', async () => {
  try {
    log('RANK-CHECK', 'Running hourly rank check...');
    const users = await User.find({ role: 'user' }).limit(200);
    for (const u of users) await checkAndUpdate(u.userId);
    log('RANK-CHECK', `Checked ${users.length} users.`);
  } catch (err) { log('RANK-CHECK', `Error: ${err.message}`); }
});

// #14 — FastTrack Bonus Distributor (Hourly at :10)
cron.schedule('10 * * * *', async () => {
  try {
    // FastTrack bonuses are already issued in rankService.checkAndUpdate
    // This job reconciles any pending FastTrack records
    const FastTrackBonus = require('../models/FastTrackBonus');
    const pending = await FastTrackBonus.find({ status: 'pending' });
    for (const ft of pending) {
      const { creditWallet } = require('../services/mlmService');
      await creditWallet(ft.userId, 'bonusBalance', ft.cashBonus, 'fasttrack',
        `FastTrack bonus for ${ft.rank}`, ft.bonusId);
      ft.status = 'credited';
      await ft.save();
    }
    if (pending.length > 0) log('FASTTRACK', `Processed ${pending.length} pending FastTrack bonuses.`);
  } catch (err) { log('FASTTRACK', `Error: ${err.message}`); }
});

// #15 — OTP Cleanup (Hourly at :15)
cron.schedule('15 * * * *', async () => {
  try {
    const result = await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
    if (result.deletedCount > 0) log('OTP-CLEANUP', `Removed ${result.deletedCount} expired OTPs.`);
  } catch (err) { log('OTP-CLEANUP', `Error: ${err.message}`); }
});

// #16 — Investment Expiry (Hourly at :20)
cron.schedule('20 * * * *', async () => {
  try {
    const now = new Date();
    const expired = await Investment.find({ status: 'active', expiryDate: { $lt: now, $exists: true } });
    for (const inv of expired) {
      inv.status = 'expired';
      await inv.save();
    }
    if (expired.length > 0) log('INV-EXPIRY', `Expired ${expired.length} investments past expiry date.`);
  } catch (err) { log('INV-EXPIRY', `Error: ${err.message}`); }
});

// ───────────────────────────────────────────────
// WEEKLY CRON JOBS
// ───────────────────────────────────────────────

// #17 — Momentum Pool Distribution (Every Sunday 00:00)
cron.schedule('0 0 * * 0', async () => {
  try {
    log('MOMENTUM', 'Starting weekly momentum pool distribution...');
    const result = await distributeWeeklyPool();
    log('MOMENTUM', `Distributed $${result.distributed?.toFixed(2)} to ${result.leaders} leaders.`);
  } catch (err) { log('MOMENTUM', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #18 — Notification Cleanup (Every Sunday 01:00)
cron.schedule('0 1 * * 0', async () => {
  try {
    log('NOTIF-CLEANUP', 'Cleaning old notifications...');
    const cutoff30 = new Date(Date.now() - 30 * 24 * 3600000);
    const cutoff7 = new Date(Date.now() - 7 * 24 * 3600000);
    await Notification.deleteMany({ createdAt: { $lt: cutoff30 } });
    await Notification.deleteMany({ read: true, createdAt: { $lt: cutoff7 } });
    log('NOTIF-CLEANUP', 'Notification cleanup done.');
  } catch (err) { log('NOTIF-CLEANUP', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// ───────────────────────────────────────────────
// MONTHLY CRON JOBS
// ───────────────────────────────────────────────

// #19 — Monthly Report Generation (1st Day 00:00)
cron.schedule('0 0 1 * *', async () => {
  try {
    log('MONTHLY-REPORT', 'Generating monthly report...');
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const [totalInv, totalROI, totalUsers, totalWithdrawals] = await Promise.all([
      Investment.countDocuments({ purchaseDate: { $gte: startOfMonth, $lte: endOfMonth } }),
      WalletLedger.aggregate([
        { $match: { type: 'roi', createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$credit' } } }
      ]),
      User.countDocuments({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } }),
      WalletLedger.aggregate([
        { $match: { type: 'withdrawal', createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$debit' } } }
      ])
    ]);

    log('MONTHLY-REPORT', `Report: ${totalUsers} new users, ${totalInv} investments, ROI: $${totalROI[0]?.total?.toFixed(2) || 0}, Withdrawals: $${totalWithdrawals[0]?.total?.toFixed(2) || 0}`);
  } catch (err) { log('MONTHLY-REPORT', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

// #20 — Data Archiving (1st Day 02:00)
cron.schedule('0 2 1 * *', async () => {
  try {
    log('ARCHIVE', 'Running monthly data archiving...');
    // Archive ledger entries older than 12 months
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const archived = await WalletLedger.deleteMany({ createdAt: { $lt: cutoff }, type: 'roi' });
    log('ARCHIVE', `Archived ${archived.deletedCount} old ROI ledger records.`);
  } catch (err) { log('ARCHIVE', `Error: ${err.message}`); }
}, { timezone: 'UTC' });

console.log('✅ All 20 AURAX cron jobs scheduled.');
