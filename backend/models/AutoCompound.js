const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const autoCompoundSchema = new mongoose.Schema({
  compoundId: { type: String, unique: true, default: () => `CMP_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  walletBalance: { type: Number, default: 0 },
  newInvestment: {
    investmentId: { type: String },
    amount: { type: Number, default: 0 },
    date: { type: Date }
  },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AutoCompound', autoCompoundSchema);
