/**
 * Withdrawal Service
 * Validates and processes withdrawal requests.
 * Rules: min $20, max $5000/day, 5% fee, 24h cooldown.
 */

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const WithdrawRequest = require('../models/WithdrawRequest');
const { debitWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const MIN_WITHDRAWAL = 20;
const MAX_DAILY = 5000;
const FEE_PCT = 5;
const COOLDOWN_HOURS = 24;

const requestWithdrawal = async (userId, amount, walletAddress = '') => {
  if (amount < MIN_WITHDRAWAL) {
    throw new Error(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`);
  }

  const user = await User.findOne({ userId });
  if (!user) throw new Error('User not found');
  if (user.isBlocked) throw new Error('Account is blocked');

  // Daily limit check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = user.lastWithdrawalDate ? new Date(user.lastWithdrawalDate) : null;
  let dailyUsed = user.dailyWithdrawalAmount || 0;
  if (lastDate && lastDate < today) {
    dailyUsed = 0; // Reset for new day
  }
  if (dailyUsed + amount > MAX_DAILY) {
    throw new Error(`Daily withdrawal limit of $${MAX_DAILY} exceeded. Used: $${dailyUsed}`);
  }

  // 24h cooldown check
  if (lastDate) {
    const hoursSince = (new Date() - lastDate) / 3600000;
    if (hoursSince < COOLDOWN_HOURS) {
      throw new Error(`Withdrawal cooldown active. Try again in ${(COOLDOWN_HOURS - hoursSince).toFixed(1)} hours.`);
    }
  }

  // Balance check
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error('Wallet not found');

  // Use earningBalance for withdrawals
  const totalAvailable = wallet.earningBalance + wallet.bonusBalance;
  if (totalAvailable < amount) {
    throw new Error(`Insufficient balance. Available: $${totalAvailable.toFixed(2)}`);
  }

  // Calculate fee and net
  const fee = parseFloat((amount * FEE_PCT / 100).toFixed(4));
  const netAmount = parseFloat((amount - fee).toFixed(4));

  // Create withdrawal request (pending admin approval)
  const request = await WithdrawRequest.create({
    userId, amount, fee, netAmount,
    walletAddress: walletAddress || user.walletAddress || '',
    status: 'pending', requestedAt: new Date()
  });

  // Update daily used amount
  await User.findOneAndUpdate({ userId }, {
    dailyWithdrawalAmount: dailyUsed + amount,
    lastWithdrawalDate: new Date()
  });

  await notificationService.send(
    userId, '📤 Withdrawal Requested',
    `Your withdrawal request of $${amount} (net: $${netAmount.toFixed(2)} after ${FEE_PCT}% fee) is pending admin approval.`,
    'withdrawal', { amount, fee, netAmount, withdrawId: request.withdrawId }
  );

  return request;
};

const approveWithdrawal = async (withdrawId, adminId) => {
  const request = await WithdrawRequest.findOne({ withdrawId });
  if (!request) throw new Error('Withdrawal request not found');
  if (request.status !== 'pending') throw new Error('Request already processed');

  const wallet = await Wallet.findOne({ userId: request.userId });
  if (!wallet) throw new Error('Wallet not found');

  // Debit from earningBalance first, then bonusBalance
  let remaining = request.amount;
  if (wallet.earningBalance >= remaining) {
    await debitWallet(request.userId, 'earningBalance', remaining, 'withdrawal',
      `Withdrawal approved: $${remaining}`, withdrawId);
  } else {
    const fromEarning = wallet.earningBalance;
    const fromBonus = remaining - fromEarning;
    if (fromEarning > 0) await debitWallet(request.userId, 'earningBalance', fromEarning, 'withdrawal', `Withdrawal`, withdrawId);
    if (fromBonus > 0) await debitWallet(request.userId, 'bonusBalance', fromBonus, 'withdrawal', `Withdrawal`, withdrawId);
  }

  request.status = 'approved';
  request.approvedAt = new Date();
  await request.save();

  await notificationService.send(
    request.userId, '✅ Withdrawal Approved',
    `Your withdrawal of $${request.amount} (net: $${request.netAmount.toFixed(2)}) has been approved.`,
    'withdrawal', { withdrawId, amount: request.amount }
  );

  return request;
};

const rejectWithdrawal = async (withdrawId, reason = '') => {
  const request = await WithdrawRequest.findOne({ withdrawId });
  if (!request) throw new Error('Withdrawal request not found');
  if (request.status !== 'pending') throw new Error('Request already processed');

  request.status = 'rejected';
  request.rejectionReason = reason;
  await request.save();

  // Restore daily withdrawal limit
  await User.findOneAndUpdate({ userId: request.userId }, {
    $inc: { dailyWithdrawalAmount: -request.amount }
  });

  await notificationService.send(
    request.userId, '❌ Withdrawal Rejected',
    `Your withdrawal of $${request.amount} was rejected. Reason: ${reason || 'Not specified'}`,
    'withdrawal', { withdrawId, amount: request.amount }
  );

  return request;
};

const resetDailyLimits = async () => {
  await User.updateMany({}, { dailyWithdrawalAmount: 0 });
  return { reset: true };
};

module.exports = { requestWithdrawal, approveWithdrawal, rejectWithdrawal, resetDailyLimits };
