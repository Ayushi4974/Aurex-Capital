/**
 * Rank Service
 * Checks a user's total business against rank thresholds,
 * promotes rank, credits FastTrack bonus, creates RankHistory.
 */

const User = require('../models/User');
const TeamBusiness = require('../models/TeamBusiness');
const RankHistory = require('../models/RankHistory');
const RankReward = require('../models/RankReward');
const FastTrackBonus = require('../models/FastTrackBonus');
const { creditWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const RANK_THRESHOLDS = [
  { rank: 'Explorer',      business: 10000,    cashBonus: 100,   rewardType: 'cash',   rewardValueUSD: 100,    rewardDescription: '$100 Cash Bonus' },
  { rank: 'Navigator',     business: 50000,    cashBonus: 500,   rewardType: 'cash',   rewardValueUSD: 500,    rewardDescription: '$500 Cash Bonus' },
  { rank: 'Pioneer',       business: 100000,   cashBonus: 0,     rewardType: 'gadget', rewardValueUSD: 1200,   rewardDescription: 'MacBook' },
  { rank: 'Visionary',     business: 500000,   cashBonus: 0,     rewardType: 'tour',   rewardValueUSD: 5000,   rewardDescription: 'Dubai Trip' },
  { rank: 'Titan',         business: 1000000,  cashBonus: 0,     rewardType: 'fund',   rewardValueUSD: 25000,  rewardDescription: 'Car Fund' },
  { rank: 'Galaxy',        business: 5000000,  cashBonus: 0,     rewardType: 'car',    rewardValueUSD: 60000,  rewardDescription: 'Luxury Car' },
  { rank: 'Nexus Crown',   business: 10000000, cashBonus: 0,     rewardType: 'villa',  rewardValueUSD: 200000, rewardDescription: 'Villa Fund' },
];

const RANK_ORDER = ['Member', 'Explorer', 'Navigator', 'Pioneer', 'Visionary', 'Titan', 'Galaxy', 'Nexus Crown'];

const checkAndUpdate = async (userId) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) return;

    const tb = await TeamBusiness.findOne({ userId });
    const totalBusiness = (tb ? tb.totalBusiness : 0) + (user.totalBusiness || 0);

    const currentRankIndex = RANK_ORDER.indexOf(user.rank || 'Member');

    // Check if a higher rank is achieved
    for (const tier of RANK_THRESHOLDS) {
      const tierIndex = RANK_ORDER.indexOf(tier.rank);
      if (totalBusiness >= tier.business && currentRankIndex < tierIndex) {
        const oldRank = user.rank;
        user.rank = tier.rank;
        await user.save();

        // Create RankHistory
        await RankHistory.create({
          userId, oldRank, newRank: tier.rank,
          business: totalBusiness, achievedDate: new Date()
        });

        // Create pending FastTrack cash bonus
        if (tier.cashBonus > 0) {
          await FastTrackBonus.create({
            userId, rank: tier.rank, business: totalBusiness,
            cashBonus: tier.cashBonus, poolShare: 0, status: 'pending'
          });
        }

        // Create physical/cash reward record
        await RankReward.create({
          userId, rewardName: `${tier.rank} Achievement Reward`,
          rewardType: tier.rewardType, rewardValue: tier.cashBonus || tier.rewardValueUSD || 0,
          status: 'pending'
        });

        // Notify user
        const rewardMsg = tier.cashBonus > 0
          ? `with $${tier.cashBonus.toFixed(2)} FastTrack bonus!`
          : `with the ${tier.rewardDescription} reward!`;
        await notificationService.send(
          userId, `🏆 Rank Achieved: ${tier.rank}!`,
          `Congratulations! You've been promoted to ${tier.rank} ${rewardMsg}`,
          'rank', { rank: tier.rank, bonus: tier.cashBonus }
        );
      }
    }
  } catch (err) {
    console.error('[RankService] Error:', err.message);
  }
};

const checkVelocityFastTrack = async (userId) => {
  try {
    const user = await User.findOne({ userId });
    if (!user) return;

    const tb = await TeamBusiness.findOne({ userId });
    if (!tb || tb.totalBusiness === 0) return;

    const daysSinceRegistration = (new Date() - user.createdAt) / (1000 * 60 * 60 * 24);

    const milestones = [
      { key: 'VELOCITY_5000_15', limitDays: 15, requiredBusiness: 5000, reward: 100 },
      { key: 'VELOCITY_25000_30', limitDays: 30, requiredBusiness: 25000, reward: 500 },
      { key: 'VELOCITY_100000_60', limitDays: 60, requiredBusiness: 100000, reward: 2000 },
      { key: 'VELOCITY_500000_90', limitDays: 90, requiredBusiness: 500000, reward: 10000 }
    ];

    for (const m of milestones) {
      if (daysSinceRegistration <= m.limitDays && tb.totalBusiness >= m.requiredBusiness) {
        const alreadyAchieved = await FastTrackBonus.findOne({ userId, rank: m.key });
        if (!alreadyAchieved) {
          await FastTrackBonus.create({
            userId, rank: m.key, business: tb.totalBusiness,
            cashBonus: m.reward, poolShare: 0, status: 'pending',
            date: new Date()
          });

          await notificationService.send(
            userId, '🚀 Velocity FastTrack Achieved!',
            `Congratulations! You achieved the $${m.requiredBusiness} business target in ${m.limitDays} days! Your $${m.reward} reward will be processed shortly.`,
            'bonus', { amount: m.reward }
          );
        }
      }
    }
  } catch (err) {
    console.error('[RankService:FastTrack] Error:', err.message);
  }
};

module.exports = { checkAndUpdate, checkVelocityFastTrack, RANK_THRESHOLDS };
