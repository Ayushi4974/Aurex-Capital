const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const depositHistorySchema = new mongoose.Schema({
  depositId: { type: String, unique: true, default: () => `DEP_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'failed', 'rejected'], default: 'pending' },
  date: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('DepositHistory', depositHistorySchema);
