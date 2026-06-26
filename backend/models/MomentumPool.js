const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const momentumPoolSchema = new mongoose.Schema({
  poolId: { type: String, unique: true, default: () => `POOL_${uuidv4().split('-')[0].toUpperCase()}` },
  week: { type: Number, required: true },
  year: { type: Number, required: true },
  totalCollection: { type: Number, default: 0 },
  distribution: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'distributed', 'closed'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MomentumPool', momentumPoolSchema);
