/**
 * Auto Compound Service
 * Runs daily: if earningBalance >= 10, creates a new investment (compound source).
 */

const Wallet = require('../models/Wallet');
const Investment = require('../models/Investment');
const AutoCompound = require('../models/AutoCompound');
const { debitWallet } = require('./mlmService');
const { processInvestment } = require('./mlmService');
const notificationService = require('./notificationService');

const getPackageName = (amount) => {
  if (amount >= 10000) return 'Nexus Infinity';
  if (amount >= 5000) return 'Nexus Titan';
  if (amount >= 1000) return 'Nexus Elite';
  if (amount >= 500) return 'Nexus Pro';
  return 'Nexus Start';
};

const processAutoCompound = async () => {
  const MIN_AMOUNT = 100; // minimum package
  const wallets = await Wallet.find({ earningBalance: { $gte: MIN_AMOUNT } });

  let compounded = 0;
  let totalAmount = 0;

  for (const wallet of wallets) {
    try {
      const compoundAmount = Math.floor(wallet.earningBalance / MIN_AMOUNT) * MIN_AMOUNT;
      if (compoundAmount < MIN_AMOUNT) continue;

      const packageName = getPackageName(compoundAmount);
      const earningCap = parseFloat((compoundAmount * 2.5).toFixed(4));

      // Debit earning balance
      await debitWallet(wallet.userId, 'earningBalance', compoundAmount, 'compound',
        `Auto-compound: $${compoundAmount} reinvested into ${packageName}`);

      // Create new investment
      const inv = await Investment.create({
        userId: wallet.userId, package: packageName, amount: compoundAmount,
        earningCap, compoundSource: true, purchaseDate: new Date(),
        planType: 'package'
      });

      // Record compound event
      const compound = await AutoCompound.create({
        userId: wallet.userId, walletBalance: compoundAmount,
        newInvestment: { investmentId: inv.investmentId, amount: compoundAmount, date: new Date() },
        status: 'completed'
      });

      // Trigger MLM engine for this compound investment
      await processInvestment(wallet.userId, inv.investmentId, compoundAmount, packageName);

      await notificationService.send(
        wallet.userId, '🔄 Auto-Compound Executed',
        `$${compoundAmount} from your earnings has been auto-compounded into ${packageName}.`,
        'compound', { amount: compoundAmount, package: packageName }
      );

      compounded++;
      totalAmount += compoundAmount;
    } catch (err) {
      console.error(`[AutoCompound] Error for ${wallet.userId}:`, err.message);
    }
  }

  return { compounded, totalAmount };
};

module.exports = { processAutoCompound };
