const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const directBonusSchema = new mongoose.Schema({
  bonusId: { type: String, unique: true, default: () => `DB_${uuidv4().split('-')[0].toUpperCase()}` },
  fromUser: { type: String, required: true },
  toUser: { type: String, required: true, index: true },
  investmentId: { type: String },
  amount: { type: Number, required: true },
  percentage: { type: Number, default: 8 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'credited', 'failed'], default: 'credited' }
}, { timestamps: true });

module.exports = mongoose.model('DirectBonus', directBonusSchema);
