const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roiHistorySchema = new mongoose.Schema({
  roiId: { type: String, unique: true, default: () => `ROI_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  investmentId: { type: String, required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  dayNumber: { type: Number, default: 1 },
  credited: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ROIHistory', roiHistorySchema);
