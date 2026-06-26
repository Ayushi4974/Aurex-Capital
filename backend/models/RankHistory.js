const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const rankHistorySchema = new mongoose.Schema({
  rankId: { type: String, unique: true, default: () => `RNK_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  oldRank: { type: String, default: 'Member' },
  newRank: { type: String, required: true },
  business: { type: Number, default: 0 },
  achievedDate: { type: Date, default: Date.now },
  rewardStatus: { type: String, enum: ['pending', 'claimed', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('RankHistory', rankHistorySchema);
