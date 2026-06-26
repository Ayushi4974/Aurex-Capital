const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  login: { type: Date },
  logout: { type: Date },
  ip: { type: String, default: '' },
  browser: { type: String, default: '' },
  device: { type: String, default: '' },
  location: { type: String, default: '' },
  sessionId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
