const mongoose = require('mongoose');

const rankRewardCatalogSchema = new mongoose.Schema({
  rankName: {
    type: String,
    enum: ['Member', 'Scout', 'Ranger', 'Explorer', 'Navigator', 'Visionary', 'Titan', 'Galaxy', 'Nexus Crown', 'Quantum Legend'],
    required: true,
    unique: true
  },
  requiredBusiness: { type: Number, required: true },
  rewardType: { type: String, default: 'cash' },
  rewardDescription: { type: String, default: '' },
  rewardValueUSD: { type: Number, default: 0 },
  bonusAmount: { type: Number, default: 0 }, // FastTrack cash bonus
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RankRewardCatalog', rankRewardCatalogSchema);
