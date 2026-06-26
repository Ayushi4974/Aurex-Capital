const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  roiMin: { type: Number, default: 0.0025 },
  roiMax: { type: Number, default: 0.02 },
  earningCap: { type: Number, default: 250 },
  directBonus: { type: Number, default: 8 },
  withdrawalFee: { type: Number, default: 5 },
  minWithdrawal: { type: Number, default: 20 },
  maxDailyWithdrawal: { type: Number, default: 5000 },
  poolPercentage: { type: Number, default: 2 },
  stakingDays: { type: Number, default: 45 },
  boosterHours: { type: Number, default: 48 },
  compoundEnabled: { type: Boolean, default: true },
  compoundMinBalance: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
