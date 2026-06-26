const mongoose = require('mongoose');

const investmentHistorySchema = new mongoose.Schema({
  investmentId: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  action: { type: String, enum: ['purchase', 'compound', 'boost', 'expiry', 'roi'], required: true },
  amount: { type: Number, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('InvestmentHistory', investmentHistorySchema);
