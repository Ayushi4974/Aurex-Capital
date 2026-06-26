const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  settingKey: { type: String, unique: true, required: true },
  settingValue: { type: mongoose.Schema.Types.Mixed },
  category: { type: String, default: 'general' },
  description: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
