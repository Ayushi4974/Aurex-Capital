/**
 * Momentum Pool Service
 * Weekly Sunday distribution to top-ranked leaders.
 * Top 10: 40%, Next 20: 30%, Next 30: 20%, Remaining: 10%
 */

const MomentumPool = require('../models/MomentumPool');
const MomentumDistribution = require('../models/MomentumDistribution');
const User = require('../models/User');
const { creditWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const RANK_ORDER = ['Member', 'Scout', 'Ranger', 'Explorer', 'Navigator',
  'Visionary', 'Titan', 'Galaxy', 'Nexus Crown', 'Quantum Legend'];

const distributeWeeklyPool = async () => {
  const pool = await MomentumPool.findOne({ status: 'active' });
  if (!pool || pool.totalCollection <= 0) {
    console.log('[Momentum] No active pool to distribute.');
    return { distributed: 0 };
  }

  const total = pool.totalCollection;
  pool.status = 'distributed';
  pool.endDate = new Date();
  pool.distribution = total;
  await pool.save();

  // Get all ranked leaders (not Member) sorted by rank desc, then business desc
  const leaders = await User.find({ rank: { $ne: 'Member' } })
    .sort({ totalBusiness: -1 });

  if (leaders.length === 0) return { distributed: 0 };

  // Slice into groups
  const top10 = leaders.slice(0, 10);
  const next20 = leaders.slice(10, 30);
  const next30 = leaders.slice(30, 60);
  const remaining = leaders.slice(60);

  const groups = [
    { users: top10,    share: 0.40 },
    { users: next20,   share: 0.30 },
    { users: next30,   share: 0.20 },
    { users: remaining, share: 0.10 }
  ];

  let totalDistributed = 0;

  for (const group of groups) {
    if (group.users.length === 0) continue;
    const groupTotal = total * group.share;
    const perUser = parseFloat((groupTotal / group.users.length).toFixed(4));

    for (const user of group.users) {
      try {
        await creditWallet(user.userId, 'bonusBalance', perUser, 'momentum',
          `Weekly momentum pool distribution (${(group.share * 100)}% group)`, pool.poolId);
        await MomentumDistribution.create({
          poolId: pool.poolId, userId: user.userId, amount: perUser,
          rank: user.rank, percentage: group.share * 100, status: 'credited'
        });
        await notificationService.send(
          user.userId, '🌊 Momentum Pool Bonus',
          `You received $${perUser.toFixed(2)} from the weekly momentum pool distribution!`,
          'momentum', { amount: perUser, poolId: pool.poolId }
        );
        totalDistributed += perUser;
      } catch (err) {
        console.error(`[Momentum] Error for ${user.userId}:`, err.message);
      }
    }
  }

  console.log(`[Momentum] Distributed $${totalDistributed.toFixed(2)} to ${leaders.length} leaders.`);
  return { distributed: totalDistributed, leaders: leaders.length };
};

module.exports = { distributeWeeklyPool };
