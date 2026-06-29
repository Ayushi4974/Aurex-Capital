/**
 * QNR Power Nodes Booster Service
 * Instead of personal second investments, QNR checks binary tree downline nodes.
 * 5 Nodes: +0.05% ROI
 * 20 Nodes: +0.10% ROI
 * 50 Nodes: +0.20% ROI
 * 100 Nodes: +0.30% ROI
 */

const User = require('../models/User');
const Investment = require('../models/Investment');
const BinaryTree = require('../models/BinaryTree');

/**
 * Calculates the current Power Nodes ROI booster rate for a user.
 */
const calculateNodeBooster = async (userId) => {
  const userNode = await BinaryTree.findOne({ userId });
  if (!userNode) return 0;

  // Count all descendants in the binary tree path
  const descendants = await BinaryTree.countDocuments({
    path: { $regex: new RegExp(`^${userNode.path}/`) }
  });

  if (descendants >= 100) return 0.0030;      // +0.30%
  if (descendants >= 50) return 0.0020;       // +0.20%
  if (descendants >= 20) return 0.0010;       // +0.10%
  if (descendants >= 5) return 0.0005;        // +0.05%
  return 0;
};

/**
 * Reconciles and updates active investments for a specific user.
 */
const reconcilePowerNodesForUser = async (userId) => {
  const boosterRate = await calculateNodeBooster(userId);
  const activeInvestments = await Investment.find({ userId, status: 'active' });
  let updated = 0;
  for (const inv of activeInvestments) {
    if (inv.roiPercent !== boosterRate) {
      inv.roiPercent = boosterRate;
      await inv.save();
      updated++;
    }
  }
  return updated;
};

/**
 * Reconciles and updates all active investments across all users.
 */
const reconcilePowerNodes = async () => {
  const activeInvestments = await Investment.find({ status: 'active' });
  let updated = 0;
  const userCache = {}; // Cache calculations during batch runs

  for (const inv of activeInvestments) {
    if (userCache[inv.userId] === undefined) {
      userCache[inv.userId] = await calculateNodeBooster(inv.userId);
    }
    const boosterRate = userCache[inv.userId];
    if (inv.roiPercent !== boosterRate) {
      inv.roiPercent = boosterRate;
      await inv.save();
      updated++;
    }
  }
  return { updated };
};

/**
 * Legacy router placeholder for instant booster checks on package purchase
 */
const checkAndSetupBooster = async (userId) => {
  try {
    await reconcilePowerNodesForUser(userId);
  } catch (err) {
    console.error('[BoosterService] Error updating node booster for user:', err.message);
  }
};

/**
 * Legacy cron placeholder
 */
const expireOldBoosters = async () => {
  return { expired: 0 };
};

module.exports = {
  calculateNodeBooster,
  reconcilePowerNodesForUser,
  reconcilePowerNodes,
  checkAndSetupBooster,
  expireOldBoosters
};
