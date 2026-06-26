const mongoose = require('mongoose');

const levelUnlockSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  directCount: { type: Number, default: 0 },
  levelsUnlocked: { type: Number, default: 0 },
  maxLevel: { type: Number, default: 0 },
  unlockDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'expired'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('LevelUnlock', levelUnlockSchema);
