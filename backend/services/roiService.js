/**
 * ROI Service
 * Runs daily: generates random ROI (0.25%–2%) for all active investments,
 * checks 250% cap, credits earningBalance, creates ROIHistory records.
 */

const Investment = require('../models/Investment');
const ROIHistory = require('../models/ROIHistory');
const InvestmentHistory = require('../models/InvestmentHistory');
const BinaryTree = require('../models/BinaryTree');
const { creditWallet } = require('./mlmService');
const notificationService = require('./notificationService');

// Get daily ROI percentage based on package amount
const getROIRate = (amount) => {
  // Random between package floor and 2%
  let floor = 0.0025;
  if (amount >= 10000) floor = 0.01;
  else if (amount >= 5000) floor = 0.007;
  else if (amount >= 1000) floor = 0.005;
  else if (amount >= 500) floor = 0.004;
  else if (amount >= 100) floor = 0.0025;
  const max = 0.02;
  return parseFloat((floor + Math.random() * (max - floor)).toFixed(6));
};

const distributeROI = async () => {
  console.log('[ROI] Starting daily ROI distribution...');
  let totalDistributed = 0;
  let paidCount = 0;

  const investments = await Investment.find({ status: 'active' });

  for (const inv of investments) {
    try {
      let rate = getROIRate(inv.amount);
      rate = parseFloat((rate + (inv.roiPercent || 0)).toFixed(6));
      let roiAmount = parseFloat((inv.amount * rate).toFixed(4));

      const remaining = inv.earningCap - inv.roiEarned;
      if (remaining <= 0) {
        // Cap already reached — mark completed
        inv.status = 'completed';
        await inv.save();
        await InvestmentHistory.create({ investmentId: inv.investmentId, userId: inv.userId, action: 'expiry', amount: 0 });
        continue;
      }

      // Cap the ROI to remaining amount
      if (roiAmount > remaining) roiAmount = parseFloat(remaining.toFixed(4));

      inv.roiEarned = parseFloat((inv.roiEarned + roiAmount).toFixed(4));
      if (inv.roiEarned >= inv.earningCap) {
        inv.status = 'completed';
        await InvestmentHistory.create({ investmentId: inv.investmentId, userId: inv.userId, action: 'expiry', amount: roiAmount });
      }
      await inv.save();

      await creditWallet(inv.userId, 'earningBalance', roiAmount, 'roi',
        `Daily ROI ${(rate * 100).toFixed(2)}% on $${inv.amount} investment`, inv.investmentId);

      const dayNumber = Math.ceil(inv.roiEarned / (inv.amount * 0.0025));
      await ROIHistory.create({
        userId: inv.userId, investmentId: inv.investmentId,
        amount: roiAmount, percentage: rate * 100, dayNumber, credited: true
      });

      await notificationService.send(
        inv.userId, '📈 Daily ROI Credited',
        `$${roiAmount.toFixed(2)} ROI (${(rate * 100).toFixed(2)}%) has been credited to your wallet.`,
        'roi', { amount: roiAmount, rate: rate * 100, investmentId: inv.investmentId }
      );

      totalDistributed += roiAmount;
      paidCount++;
    } catch (err) {
      console.error(`[ROI] Error for investment ${inv.investmentId}:`, err.message);
    }
  }

  console.log(`[ROI] Done. Paid: $${totalDistributed.toFixed(2)} to ${paidCount} investments.`);
  return { totalDistributed, paidCount };
};

const checkCaps = async () => {
  const investments = await Investment.find({ status: 'active' });
  let completed = 0;
  for (const inv of investments) {
    if (inv.roiEarned >= inv.earningCap) {
      inv.status = 'completed';
      await inv.save();
      completed++;
      await notificationService.send(
        inv.userId, '✅ Investment Completed',
        `Your investment of $${inv.amount} has reached the 250% earning cap. Investment completed.`,
        'roi', { investmentId: inv.investmentId }
      );
    }
  }
  return { completed };
};

module.exports = { distributeROI, checkCaps, getROIRate };
