/**
 * Staking Service
 * Handles staking lock/release with 45-day periods.
 * Silver (100-1000): 50% reward. Gold (>1000): 100% reward.
 */

const Staking = require('../models/Staking');
const { creditWallet, debitWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const STAKING_DAYS = 45;

const getTier = (amount) => {
  return amount >= 1000 ? 'gold' : 'silver';
};

const getRewardPct = (tier) => {
  return tier === 'gold' ? 100 : 50;
};

const createStake = async (userId, amount, packageName = '', roiPercentage = 0) => {
  const tier = getTier(amount);
  const rewardPct = getRewardPct(tier);

  const lockDate = new Date();
  const releaseDate = new Date(lockDate);
  releaseDate.setDate(releaseDate.getDate() + STAKING_DAYS);

  // Debit from deposit balance
  await debitWallet(userId, 'depositBalance', amount, 'staking',
    `Staked $${amount} (${tier.toUpperCase()} tier) for ${STAKING_DAYS} days`);

  const stake = await Staking.create({
    userId, amount, tier, rewardPercentage: rewardPct,
    maxEarningCap: amount * 2.5,
    packageName, roiPercentage,
    lockDate, releaseDate, status: 'active'
  });

  await notificationService.send(
    userId, '🔒 Stake Locked',
    `$${amount} staked successfully (${tier.toUpperCase()} tier). Releases on ${releaseDate.toDateString()} with ${rewardPct}% reward.`,
    'staking', { stakeId: stake.stakeId, amount, tier, releaseDate }
  );

  return stake;
};

const releaseMaturedStakes = async () => {
  const now = new Date();
  const matured = await Staking.find({
    status: { $in: ['active', 'Active'] },
    releaseDate: { $lte: now }
  });

  let released = 0;
  let totalRewarded = 0;

  for (const stake of matured) {
    try {
      const reward = parseFloat((stake.amount * stake.rewardPercentage / 100).toFixed(4));
      const total = parseFloat((stake.amount + reward).toFixed(4));

      await creditWallet(stake.userId, 'earningBalance', total, 'staking',
        `Staking released: $${stake.amount} principal + $${reward} (${stake.rewardPercentage}% reward)`,
        stake.stakeId);

      stake.status = 'released';
      stake.reward = reward;
      await stake.save();

      await notificationService.send(
        stake.userId, '🎉 Staking Released',
        `Your stake of $${stake.amount} has been released with $${reward.toFixed(2)} reward. Total: $${total.toFixed(2)}`,
        'staking', { stakeId: stake.stakeId, reward, total }
      );

      released++;
      totalRewarded += reward;
    } catch (err) {
      console.error(`[Staking] Error releasing ${stake.stakeId}:`, err.message);
    }
  }

  return { released, totalRewarded };
};

const unstake = async (stakeId, userId) => {
  const stake = await Staking.findOne({ stakeId });
  if (!stake) throw new Error('Stake not found');
  if (stake.userId !== userId) throw new Error('Unauthorized');
  if (!['active', 'Active'].includes(stake.status)) throw new Error('Stake already released or cancelled');

  // Return principal only (no reward for early unstake)
  await creditWallet(userId, 'depositBalance', stake.amount, 'staking',
    `Early unstake: $${stake.amount} principal returned`, stake.stakeId);

  stake.status = 'cancelled';
  await stake.save();

  return { stake };
};

module.exports = { createStake, releaseMaturedStakes, unstake, getTier };
