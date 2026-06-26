const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const withdrawRequestSchema = new mongoose.Schema({
  withdrawId: { type: String, unique: true, default: () => `WTH_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  walletAddress: { type: String, default: '' },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed', 'failed'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  completedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
