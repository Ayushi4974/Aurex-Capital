const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const rankRewardSchema = new mongoose.Schema({
  rewardId: { type: String, unique: true, default: () => `RWD_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  rewardName: { type: String, required: true },
  rewardType: { type: String, enum: ['tour', 'gadget', 'car', 'villa', 'cash'], required: true },
  rewardValue: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'claimed', 'approved', 'delivered'], default: 'pending' },
  claimed: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('RankReward', rankRewardSchema);
