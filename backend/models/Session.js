const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true },
  refreshToken: { type: String },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  deviceId: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
