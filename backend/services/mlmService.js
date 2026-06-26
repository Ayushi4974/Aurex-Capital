/**
 * AURAX MLM Engine
 * Handles: registration, binary placement, investment processing,
 * direct bonus (8%), level income (30 levels), team business volume updates,
 * momentum pool contribution (2%), rank checks trigger.
 */

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const BinaryTree = require('../models/BinaryTree');
const TeamBusiness = require('../models/TeamBusiness');
const Investment = require('../models/Investment');
const InvestmentHistory = require('../models/InvestmentHistory');
const DirectBonus = require('../models/DirectBonus');
const LevelIncome = require('../models/LevelIncome');
const LevelUnlock = require('../models/LevelUnlock');
const MomentumPool = require('../models/MomentumPool');
const notificationService = require('./notificationService');

// ─────────────────────────────────────────────
// LEVEL INCOME PERCENTAGES (30 levels)
// ─────────────────────────────────────────────
const LEVEL_PERCENTAGES = {
  1: 10, 2: 5, 3: 3, 4: 2, 5: 2,
  6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
  11: 0.5, 12: 0.5, 13: 0.5, 14: 0.5, 15: 0.5,
  16: 0.5, 17: 0.5, 18: 0.5, 19: 0.5, 20: 0.5,
  21: 0.25, 22: 0.25, 23: 0.25, 24: 0.25, 25: 0.25,
  26: 0.25, 27: 0.25, 28: 0.25, 29: 0.25, 30: 0.25,
};

// Returns max unlocked level based on direct count
const getUnlockedLevels = (directCount) => {
  if (directCount >= 10) return 30;
  if (directCount >= 8)  return 20;
  if (directCount >= 6)  return 15;
  if (directCount >= 4)  return 10;
  if (directCount >= 2)  return 5;
  return 0;
};

// ─────────────────────────────────────────────
// WALLET HELPER: credit a balance bucket
// ─────────────────────────────────────────────
const creditWallet = async (userId, bucket, amount, type, remark, referenceId = '') => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error(`Wallet not found for ${userId}`);
  const before = wallet[bucket];
  wallet[bucket] += amount;
  await wallet.save();

  const ledgerWalletType = bucket.endsWith('Balance') ? bucket.replace('Balance', '') : bucket;

  await WalletLedger.create({
    userId, walletType: ledgerWalletType, credit: amount, debit: 0,
    balanceBefore: before, balanceAfter: wallet[bucket],
    remark, referenceId, type
  });
  return wallet;
};

// ─────────────────────────────────────────────
// WALLET HELPER: debit a balance bucket
// ─────────────────────────────────────────────
const debitWallet = async (userId, bucket, amount, type, remark, referenceId = '') => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error(`Wallet not found for ${userId}`);
  if (wallet[bucket] < amount) throw new Error(`Insufficient ${bucket} balance`);
  const before = wallet[bucket];
  wallet[bucket] -= amount;
  await wallet.save();

  const ledgerWalletType = bucket.endsWith('Balance') ? bucket.replace('Balance', '') : bucket;

  await WalletLedger.create({
    userId, walletType: ledgerWalletType, credit: 0, debit: amount,
    balanceBefore: before, balanceAfter: wallet[bucket],
    remark, referenceId, type
  });
  return wallet;
};

// ─────────────────────────────────────────────
// BINARY TREE TRAVERSAL: find deepest available node
// on the sponsor's chosen leg
// ─────────────────────────────────────────────
const findPlacementNode = async (sponsorId, preferredPosition) => {
  const queue = [{ nodeId: sponsorId, position: preferredPosition }];
  while (queue.length > 0) {
    const { nodeId, position } = queue.shift();
    const node = await BinaryTree.findOne({ userId: nodeId });
    if (!node) continue;

    const childField = position === 'left' ? 'leftChild' : 'rightChild';
    if (!node[childField]) {
      // Slot is free
      return { parentId: nodeId, position };
    }
    // Slot occupied — go deeper
    queue.push({ nodeId: node[childField], position });
  }
  return { parentId: sponsorId, position: preferredPosition };
};

// ─────────────────────────────────────────────
// BUILD PATH for a new node
// ─────────────────────────────────────────────
const buildPath = async (parentId, newUserId) => {
  if (!parentId) return `/${newUserId}`;
  const parentNode = await BinaryTree.findOne({ userId: parentId });
  return parentNode ? `${parentNode.path}/${newUserId}` : `/${newUserId}`;
};

// ─────────────────────────────────────────────
// REGISTRATION: create user, wallet, tree node,
// team business, level unlock
// ─────────────────────────────────────────────
const processRegistration = async (newUser) => {
  const { userId, sponsorId } = newUser;
  const preferredPosition = (newUser.position || 'left').toLowerCase();

  // Find placement
  let parentId = sponsorId;
  let finalPosition = preferredPosition;

  if (sponsorId) {
    const sponsor = await BinaryTree.findOne({ userId: sponsorId });
    if (sponsor) {
      const placement = await findPlacementNode(sponsorId, preferredPosition);
      parentId = placement.parentId;
      finalPosition = placement.position;
    }
  }

  // Calculate depth
  const parentNode = parentId ? await BinaryTree.findOne({ userId: parentId }) : null;
  const depth = parentNode ? parentNode.depth + 1 : 0;
  const path = await buildPath(parentId, userId);

  // Create BinaryTree node
  const treeNode = await BinaryTree.create({
    userId, parentId: parentId || '', position: finalPosition,
    leftChild: '', rightChild: '', depth, path
  });

  // Update parent's child pointer
  if (parentId) {
    const field = finalPosition === 'left' ? 'leftChild' : 'rightChild';
    await BinaryTree.findOneAndUpdate({ userId: parentId }, { [field]: userId });
  }

  // Update placementId and position on User record
  await User.findOneAndUpdate({ userId }, { placementId: parentId || '', position: finalPosition });

  // Create Wallet (zeroed)
  await Wallet.create({ userId });

  // Create TeamBusiness
  await TeamBusiness.create({ userId });

  // Create LevelUnlock
  await LevelUnlock.create({ userId, directCount: 0, levelsUnlocked: 0, maxLevel: 0 });

  // Update sponsor's directCount & LevelUnlock
  if (sponsorId) {
    const sponsor = await User.findOneAndUpdate(
      { userId: sponsorId },
      { $inc: { directCount: 1 } },
      { new: true }
    );
    const newDirectCount = sponsor.directCount;
    const newMaxLevel = sponsor.role === 'admin' ? 30 : getUnlockedLevels(newDirectCount);
    await LevelUnlock.findOneAndUpdate(
      { userId: sponsorId },
      { directCount: newDirectCount, levelsUnlocked: newMaxLevel, maxLevel: newMaxLevel }
    );
  }

  // Increment teamCount for all binary ancestors
  let ancestorId = parentId;
  while (ancestorId) {
    await User.findOneAndUpdate({ userId: ancestorId }, { $inc: { teamCount: 1 } });
    const ancestorNode = await BinaryTree.findOne({ userId: ancestorId });
    ancestorId = ancestorNode ? ancestorNode.parentId : null;
  }

  return { treeNode };
};

// ─────────────────────────────────────────────
// GET SPONSOR CHAIN (level income upline)
// Returns array of {userId, level, sponsorId} up to 30 levels
// ─────────────────────────────────────────────
const getSponsorChain = async (startUserId, maxLevels = 30) => {
  const chain = [];
  let current = await User.findOne({ userId: startUserId });
  for (let level = 1; level <= maxLevels; level++) {
    if (!current || !current.sponsorId) break;
    const sponsor = await User.findOne({ userId: current.sponsorId });
    if (!sponsor) break;
    chain.push({ user: sponsor, level });
    current = sponsor;
  }
  return chain;
};

// ─────────────────────────────────────────────
// BINARY ANCESTOR CHAIN: returns all binary parents
// ─────────────────────────────────────────────
const getBinaryAncestors = async (userId) => {
  const ancestors = [];
  let nodeId = userId;
  while (true) {
    const node = await BinaryTree.findOne({ userId: nodeId });
    if (!node || !node.parentId) break;
    ancestors.push({ parentId: node.parentId, childPosition: node.position });
    nodeId = node.parentId;
  }
  return ancestors;
};

// ─────────────────────────────────────────────
// INVESTMENT PROCESSING: the full MLM engine trigger
// ─────────────────────────────────────────────
const processInvestment = async (userId, investmentId, amount, packageName) => {
  // 1. Create InvestmentHistory record
  await InvestmentHistory.create({
    investmentId, userId, action: 'purchase', amount, details: { packageName }
  });

  // 2. DIRECT BONUS (8% to sponsor)
  const investor = await User.findOne({ userId });
  if (investor && investor.sponsorId) {
    const bonusAmt = parseFloat((amount * 0.08).toFixed(4));
    const sponsor = await User.findOne({ userId: investor.sponsorId });
    if (sponsor) {
      await creditWallet(sponsor.userId, 'bonusBalance', bonusAmt, 'direct',
        `Direct bonus 8% from ${userId} investment`, investmentId);
      await DirectBonus.create({
        fromUser: userId, toUser: sponsor.userId,
        investmentId, amount: bonusAmt, percentage: 8
      });
      await notificationService.send(
        sponsor.userId, '💰 Direct Bonus Received',
        `You earned $${bonusAmt.toFixed(2)} direct bonus from ${userId}'s investment of $${amount}`,
        'bonus', { amount: bonusAmt, fromUser: userId }
      );
    }
  }

  // 3. LEVEL INCOME (up to 30 levels via sponsor chain)
  const sponsorChain = await getSponsorChain(userId, 30);
  for (const { user: receiver, level } of sponsorChain) {
    const unlock = await LevelUnlock.findOne({ userId: receiver.userId });
    const maxLevel = unlock ? unlock.maxLevel : 0;
    if (level > maxLevel) continue; // Skip — level not unlocked

    const pct = LEVEL_PERCENTAGES[level] || 0;
    if (pct === 0) continue;

    const incomeAmt = parseFloat((amount * pct / 100).toFixed(4));
    await creditWallet(receiver.userId, 'bonusBalance', incomeAmt, 'level',
      `Level ${level} income (${pct}%) from ${userId}`, investmentId);
    await LevelIncome.create({
      fromUser: userId, receiver: receiver.userId,
      level, percentage: pct, investmentId, amount: incomeAmt
    });
    await notificationService.send(
      receiver.userId, `🌐 Level ${level} Income`,
      `You earned $${incomeAmt.toFixed(2)} (${pct}%) level ${level} income from ${userId}`,
      'bonus', { level, amount: incomeAmt }
    );
  }

  // 4. UPDATE BINARY BUSINESS VOLUMES for all ancestor nodes
  const ancestors = await getBinaryAncestors(userId);
  for (const { parentId, childPosition } of ancestors) {
    const updateField = childPosition === 'left' ? 'leftBusiness' : 'rightBusiness';
    await TeamBusiness.findOneAndUpdate(
      { userId: parentId },
      { $inc: { [updateField]: amount, totalBusiness: amount, monthlyBusiness: amount, weeklyBusiness: amount, todayBusiness: amount } },
      { upsert: true }
    );
    // Update User.totalBusiness
    await User.findOneAndUpdate({ userId: parentId }, { $inc: { totalBusiness: amount } });
  }

  // 5. MOMENTUM POOL CONTRIBUTION (2%)
  const poolContribution = parseFloat((amount * 0.02).toFixed(4));
  const now = new Date();
  const weekNum = getWeekNumber(now);
  let pool = await MomentumPool.findOne({ week: weekNum, year: now.getFullYear(), status: 'active' });
  if (!pool) {
    const weekStart = getWeekStart(now);
    pool = await MomentumPool.create({
      week: weekNum, year: now.getFullYear(),
      totalCollection: 0, status: 'active', startDate: weekStart
    });
  }
  await MomentumPool.findByIdAndUpdate(pool._id, { $inc: { totalCollection: poolContribution } });

  // 6. RANK CHECK — defer to rankService (imported lazily to avoid circular dep)
  const rankService = require('./rankService');
  for (const { parentId } of ancestors) {
    await rankService.checkAndUpdate(parentId);
  }
  if (investor) await rankService.checkAndUpdate(userId);

  return { success: true };
};

// Helper: ISO week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

module.exports = {
  processRegistration,
  processInvestment,
  creditWallet,
  debitWallet,
  getUnlockedLevels,
  getBinaryAncestors,
  getSponsorChain,
};
