const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fastTrackBonusSchema = new mongoose.Schema({
  bonusId: { type: String, unique: true, default: () => `FTB_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  rank: { type: String, required: true },
  business: { type: Number, default: 0 },
  cashBonus: { type: Number, default: 0 },
  poolShare: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'credited', 'failed'], default: 'credited' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FastTrackBonus', fastTrackBonusSchema);
