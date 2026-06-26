const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const walletLedgerSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, default: () => `TXN_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  walletType: { type: String, enum: ['deposit', 'earning', 'withdraw', 'staking', 'compound', 'bonus'], required: true },
  credit: { type: Number, default: 0 },
  debit: { type: Number, default: 0 },
  balanceBefore: { type: Number, default: 0 },
  balanceAfter: { type: Number, default: 0 },
  remark: { type: String, default: '' },
  referenceId: { type: String, default: '' },
  type: { type: String, enum: ['roi', 'bonus', 'withdrawal', 'staking', 'compound', 'investment', 'direct', 'level', 'deposit', 'transfer', 'refund', 'booster', 'momentum', 'fasttrack'], required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('WalletLedger', walletLedgerSchema);
