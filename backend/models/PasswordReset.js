const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
