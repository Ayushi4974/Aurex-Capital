const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const walletSchema = new mongoose.Schema({
  walletId: { type: String, unique: true, default: () => `WAL_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, unique: true, index: true },
  depositBalance: { type: Number, default: 0 },
  earningBalance: { type: Number, default: 0 },
  withdrawBalance: { type: Number, default: 0 },
  stakingBalance: { type: Number, default: 0 },
  compoundBalance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  lockedBalance: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate totalBalance before save
walletSchema.pre('save', function (next) {
  this.totalBalance = this.depositBalance + this.earningBalance + this.bonusBalance + this.compoundBalance;
  next();
});

module.exports = mongoose.model('Wallet', walletSchema);
