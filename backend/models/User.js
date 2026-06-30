const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  mobile: { type: String },
  password: { type: String, required: true },
  plainPassword: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  sponsorId: { type: String, default: '' },
  placementId: { type: String, default: '' },
  position: { type: String, enum: ['left', 'right', ''], default: '' },
  walletAddress: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  activePackage: { type: String, default: '' },
  packageAmount: { type: Number, default: 0 },
  packageName: { type: String, default: '' },
  investmentDate: { type: Date },
  roiEndDate: { type: Date },
  earningCap: { type: Number, default: 0 },
  totalBusiness: { type: Number, default: 0 },
  rank: { type: String, default: 'Member' },
  directCount: { type: Number, default: 0 },
  teamCount: { type: Number, default: 0 },
  levelUnlocked: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  lastLogin: { type: Date },
  dailyWithdrawalAmount: { type: Number, default: 0 },
  lastWithdrawalDate: { type: Date },
  name: { type: String },
}, { timestamps: true });

// Auto-generate userId before save
userSchema.pre('save', async function (next) {
  if (!this.userId) {
    const highestUser = await mongoose.model('User')
      .findOne({ userId: /^AC\d+$/ })
      .sort({ userId: -1 });
    let newNumber = 100001;
    if (highestUser && highestUser.userId) {
      const match = highestUser.userId.match(/^AC(\d+)$/);
      if (match) {
        newNumber = parseInt(match[1], 10) + 1;
      }
    }
    this.userId = `AC${newNumber}`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
