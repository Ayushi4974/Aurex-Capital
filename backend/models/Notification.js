const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, unique: true, default: () => `NTF_${uuidv4().split('-')[0].toUpperCase()}` },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['roi', 'bonus', 'staking', 'withdrawal', 'rank', 'system', 'deposit', 'level', 'booster', 'compound', 'momentum'], default: 'system' },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
