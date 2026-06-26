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
  { rank: 'Scout',         business: 2500,    cashBonus: 50,    rewardType: 'cash' },
  { rank: 'Ranger',        business: 5000,    cashBonus: 100,   rewardType: 'cash' },
  { rank: 'Explorer',      business: 10000,   cashBonus: 200,   rewardType: 'gadget' },
  { rank: 'Navigator',     business: 25000,   cashBonus: 500,   rewardType: 'tour' },
  { rank: 'Visionary',     business: 50000,   cashBonus: 2500,  rewardType: 'car' },
  { rank: 'Titan',         business: 100000,  cashBonus: 5000,  rewardType: 'car' },
  { rank: 'Galaxy',        business: 250000,  cashBonus: 10000, rewardType: 'villa' },
  { rank: 'Nexus Crown',   business: 500000,  cashBonus: 25000, rewardType: 'villa' },
  { rank: 'Quantum Legend',business: 1000000, cashBonus: 50000, rewardType: 'villa' },
];

const RANK_ORDER = ['Member', 'Scout', 'Ranger', 'Explorer', 'Navigator',
  'Visionary', 'Titan', 'Galaxy', 'Nexus Crown', 'Quantum Legend'];

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

        // Credit FastTrack cash bonus
        if (tier.cashBonus > 0) {
          await creditWallet(userId, 'bonusBalance', tier.cashBonus, 'fasttrack',
            `FastTrack bonus for achieving ${tier.rank} rank`);
          await FastTrackBonus.create({
            userId, rank: tier.rank, business: totalBusiness,
            cashBonus: tier.cashBonus, poolShare: 0, status: 'credited'
          });
        }

        // Create physical/cash reward record
        await RankReward.create({
          userId, rewardName: `${tier.rank} Achievement Reward`,
          rewardType: tier.rewardType, rewardValue: tier.cashBonus,
          status: 'pending'
        });

        // Notify user
        await notificationService.send(
          userId, `🏆 Rank Achieved: ${tier.rank}!`,
          `Congratulations! You've been promoted to ${tier.rank} with $${tier.cashBonus.toFixed(2)} FastTrack bonus!`,
          'rank', { rank: tier.rank, bonus: tier.cashBonus }
        );
      }
    }
  } catch (err) {
    console.error('[RankService] Error:', err.message);
  }
};

module.exports = { checkAndUpdate, RANK_THRESHOLDS };
