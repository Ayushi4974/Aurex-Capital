const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const levelIncomeSchema = new mongoose.Schema({
  incomeId: { type: String, unique: true, default: () => `LI_${uuidv4().split('-')[0].toUpperCase()}` },
  fromUser: { type: String, required: true },
  receiver: { type: String, required: true, index: true },
  level: { type: Number, required: true, min: 1, max: 30 },
  percentage: { type: Number, required: true },
  investmentId: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'credited', 'failed'], default: 'credited' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LevelIncome', levelIncomeSchema);
