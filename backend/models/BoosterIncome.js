const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const boosterIncomeSchema = new mongoose.Schema({
  boosterId: { type: String, unique: true, default: () => `BOOST_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  investment1: {
    investmentId: { type: String },
    amount: { type: Number, default: 0 },
    date: { type: Date }
  },
  investment2: {
    investmentId: { type: String },
    amount: { type: Number, default: 0 },
    date: { type: Date }
  },
  unlockAmount: { type: Number, default: 0 },
  eligible: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  expiry: { type: Date },
  status: { type: String, enum: ['pending', 'active', 'completed', 'expired'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('BoosterIncome', boosterIncomeSchema);
