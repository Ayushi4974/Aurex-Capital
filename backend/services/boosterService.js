/**
 * Booster Service
 * 48-hour window: if user makes a second investment same or higher package
 * within 48h of the first, the first investment amount is unlocked (credited to wallet).
 */

const BoosterIncome = require('../models/BoosterIncome');
const Investment = require('../models/Investment');
const { creditWallet } = require('./mlmService');
const notificationService = require('./notificationService');

const BOOSTER_HOURS = 48;

// Called when a new investment is made — check/setup booster
const checkAndSetupBooster = async (userId, investmentId, amount, purchaseDate) => {
  // Check if there is an existing pending booster for this user
  const existingBooster = await BoosterIncome.findOne({ userId, status: 'pending' });

  if (!existingBooster) {
    // First investment — create pending booster record
    const expiry = new Date(purchaseDate);
    expiry.setHours(expiry.getHours() + BOOSTER_HOURS);

    await BoosterIncome.create({
      userId,
      investment1: { investmentId, amount, date: purchaseDate },
      expiry, status: 'pending'
    });
    // Mark the investment as booster eligible
    await Investment.findOneAndUpdate({ investmentId }, { boostEligible: true, boostStatus: 'pending' });
  } else {
    // Second investment — check if within 48h window and same or higher package
    const now = new Date();
    if (now > existingBooster.expiry) {
      existingBooster.status = 'expired';
      await existingBooster.save();
      await Investment.findOneAndUpdate(
        { investmentId: existingBooster.investment1.investmentId },
        { boostStatus: 'expired' }
      );
      return;
    }

    if (amount >= existingBooster.investment1.amount) {
      // Booster activated!
      existingBooster.investment2 = { investmentId, amount, date: purchaseDate };
      existingBooster.unlockAmount = existingBooster.investment1.amount;
      existingBooster.eligible = true;
      existingBooster.claimed = true;
      existingBooster.status = 'completed';
      await existingBooster.save();

      // Credit first investment amount to earningBalance
      await creditWallet(userId, 'earningBalance', existingBooster.unlockAmount, 'booster',
        `Booster income: investment #1 ($${existingBooster.unlockAmount}) unlocked!`,
        existingBooster.boosterId);

      await Investment.findOneAndUpdate(
        { investmentId: existingBooster.investment1.investmentId },
        { boostStatus: 'completed' }
      );

      await notificationService.send(
        userId, '🚀 Booster Activated!',
        `Your booster income of $${existingBooster.unlockAmount.toFixed(2)} has been unlocked! Second investment confirmed.`,
        'bonus', { unlockAmount: existingBooster.unlockAmount }
      );
    }
  }
};

// Expire boosters past 48h
const expireOldBoosters = async () => {
  const now = new Date();
  const expired = await BoosterIncome.find({ status: 'pending', expiry: { $lt: now } });

  for (const booster of expired) {
    booster.status = 'expired';
    await booster.save();
    await Investment.findOneAndUpdate(
      { investmentId: booster.investment1?.investmentId },
      { boostStatus: 'expired' }
    );
    await notificationService.send(
      booster.userId, '⏰ Booster Expired',
      `Your booster window has expired. Make a second investment to activate the booster next time.`,
      'system'
    );
  }

  return { expired: expired.length };
};

module.exports = { checkAndSetupBooster, expireOldBoosters };
