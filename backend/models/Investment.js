const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const investmentSchema = new mongoose.Schema({
  investmentId: { type: String, unique: true, default: () => `INV_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  package: { type: String, required: true },
  amount: { type: Number, required: true },
  roiPercent: { type: Number, default: 0 },
  roiEarned: { type: Number, default: 0 },
  earningCap: { type: Number, required: true }, // 250% of amount
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  boostEligible: { type: Boolean, default: false },
  boostStatus: { type: String, enum: ['pending', 'completed', 'expired', 'none'], default: 'none' },
  firstInvestment: { type: Boolean, default: false },
  compoundSource: { type: Boolean, default: false },
  parentInvestmentId: { type: String, default: '' },
  planType: { type: String, enum: ['FTP', 'UTP', 'package'], default: 'package' }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
