const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  packageId: { type: String, unique: true },
  name: { type: String, enum: ['Nexus Start', 'Nexus Pro', 'Nexus Elite', 'Nexus Titan', 'Nexus Infinity'], required: true },
  amount: { type: Number, required: true },
  dailyROI: {
    min: { type: Number, default: 0.0025 },
    max: { type: Number, default: 0.02 }
  },
  maximumReturn: { type: Number },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  stakingEligible: { type: Boolean, default: true },
  stakingMin: { type: Number, default: 100 },
  stakingMax: { type: Number, default: 10000 },
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
