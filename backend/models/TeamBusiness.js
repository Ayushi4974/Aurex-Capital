const mongoose = require('mongoose');

const teamBusinessSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  leftBusiness: { type: Number, default: 0 },
  rightBusiness: { type: Number, default: 0 },
  totalBusiness: { type: Number, default: 0 },
  activeBusiness: { type: Number, default: 0 },
  todayBusiness: { type: Number, default: 0 },
  weeklyBusiness: { type: Number, default: 0 },
  monthlyBusiness: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

teamBusinessSchema.pre('save', function (next) {
  this.totalBusiness = this.leftBusiness + this.rightBusiness;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TeamBusiness', teamBusinessSchema);
