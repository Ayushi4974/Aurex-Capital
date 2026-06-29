/**
 * Loyalty Booster Service
 * Users who avoid withdrawals for 90 days receive an additional 5% bonus.
 */

const User = require('../models/User');
const Investment = require('../models/Investment');
const WithdrawRequest = require('../models/WithdrawRequest');
const { creditWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const LOYALTY_DAYS = 90;
const BONUS_PCT = 5;

const distributeLoyaltyBoosters = async () => {
  console.log('[Loyalty] Running Loyalty Booster verification...');
  let creditedCount = 0;
  let totalDistributed = 0;

  try {
    const users = await User.find({ status: 'active', role: 'user' });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOYALTY_DAYS);

    for (const user of users) {
      // Check if user has active investments
      const activeInvestments = await Investment.find({ userId: user.userId, status: 'active' });
      if (activeInvestments.length === 0) continue;

      // Ensure user has been registered for at least 90 days
      if (user.createdAt > cutoffDate) continue;

      // Check for any withdrawal requests in the last 90 days
      const recentWithdrawals = await WithdrawRequest.findOne({
        userId: user.userId,
        status: { $ne: 'rejected' },
        createdAt: { $gte: cutoffDate }
      });

      if (recentWithdrawals) continue;

      // Calculate total active investment principal
      const totalPrincipal = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      if (totalPrincipal <= 0) continue;

      const bonusAmount = parseFloat((totalPrincipal * (BONUS_PCT / 100)).toFixed(4));
      if (bonusAmount <= 0) continue;

      // Check if the Loyalty Booster was already credited recently
      const WalletLedger = require('../models/WalletLedger');
      const lastLoyaltyCredited = await WalletLedger.findOne({
        userId: user.userId,
        type: 'loyalty',
        createdAt: { $gte: cutoffDate }
      });

      if (lastLoyaltyCredited) continue;

      // Credit the wallet
      await creditWallet(user.userId, 'bonusBalance', bonusAmount, 'loyalty',
        `90-day Loyalty Booster (5% of active investment principal: $${totalPrincipal})`);

      // Notify the user
      await notificationService.send(
        user.userId, '❤️ Loyalty Booster Credited',
        `Congratulations! You avoided withdrawals for 90 days and earned a 5% Loyalty Booster of $${bonusAmount.toFixed(2)} on your active principal!`,
        'bonus', { amount: bonusAmount }
      );

      creditedCount++;
      totalDistributed += bonusAmount;
    }
  } catch (err) {
    console.error('[Loyalty] Error during verification:', err.message);
  }

  console.log(`[Loyalty] Finished. Credited $${totalDistributed.toFixed(2)} to ${creditedCount} users.`);
  return { creditedCount, totalDistributed };
};

module.exports = { distributeLoyaltyBoosters };
