const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  fullName: { type: String, default: '' },
  dob: { type: Date },
  gender: { type: String, default: '' },
  country: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  photo: { type: String, default: '' },
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  pan: { type: String, default: '' },
  aadhaar: { type: String, default: '' },
  passport: { type: String, default: '' },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolder: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
