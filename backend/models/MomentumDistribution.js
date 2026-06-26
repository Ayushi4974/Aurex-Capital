const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const momentumDistributionSchema = new mongoose.Schema({
  distributionId: { type: String, unique: true, default: () => `DIST_${uuidv4().split('-')[0].toUpperCase()}` },
  poolId: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  rank: { type: String },
  percentage: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'credited'], default: 'credited' }
}, { timestamps: true });

module.exports = mongoose.model('MomentumDistribution', momentumDistributionSchema);
