const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  email: { type: String },
  mobile: { type: String },
  otp: { type: String, required: true },
  type: { type: String, enum: ['login', 'withdrawal', 'kyc', 'register', 'reset'], required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
