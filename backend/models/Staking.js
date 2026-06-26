const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const stakingSchema = new mongoose.Schema({
  stakeId: { type: String, unique: true, default: () => `STK_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  planType: { type: String, enum: ['FTP', 'UTP', 'staking'], default: 'FTP' },
  packageName: { type: String, default: '' },
  roiPercentage: { type: Number, default: 0 },
  tier: { type: String, enum: ['silver', 'gold'], default: 'silver' },
  reward: { type: Number, default: 0 },
  rewardPercentage: { type: Number, default: 50 },
  maxEarningCap: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  lockDate: { type: Date, default: Date.now },
  releaseDate: { type: Date },
  status: { type: String, enum: ['active', 'Active', 'released', 'cancelled', 'Completed'], default: 'active' },
  roiStartDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Staking', stakingSchema);
