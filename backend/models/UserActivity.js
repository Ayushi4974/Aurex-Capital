const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, enum: ['login', 'investment', 'referral', 'daily_checkin', 'withdrawal'], required: true },
  points: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
