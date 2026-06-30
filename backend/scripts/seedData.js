/**
 * AURAX Database Seed Script
 * Seeds: admin user, 5 packages, 9 rank rewards, SystemConfig
 * Run: node scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Wallet = require('../models/Wallet');
const BinaryTree = require('../models/BinaryTree');
const TeamBusiness = require('../models/TeamBusiness');
const LevelUnlock = require('../models/LevelUnlock');
const Package = require('../models/Package');
const RankRewardCatalog = require('../models/RankRewardCatalog');
const SystemConfig = require('../models/SystemConfig');
const SystemSettings = require('../models/SystemSettings');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ─── Admin User ───────────────────────────────────────
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 12);
      const admin = new User({
        userId: 'AC100001',
        name: 'Aurex Capital Admin',
        email: 'admin@aurexcapital.com',
        mobile: '9876543210',
        password: hashed,
        plainPassword: 'admin123',
        role: 'admin',
        sponsorId: '',
        status: 'active',
        rank: 'Quantum Legend',
        directCount: 0,
        teamCount: 0
      });
      await admin.save();

      await UserProfile.create({ userId: 'AC100001', fullName: 'Aurex Capital Admin' });
      await Wallet.create({ userId: 'AC100001', depositBalance: 100000, earningBalance: 25000, bonusBalance: 0 });
      await BinaryTree.create({ userId: 'AC100001', parentId: '', position: '', depth: 0, path: '/AC100001' });
      await TeamBusiness.create({ userId: 'AC100001' });
      await LevelUnlock.create({ userId: 'AC100001', directCount: 0, levelsUnlocked: 30, maxLevel: 30 });
      console.log('✅ Admin user AC100001 created (password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // ─── Packages ────────────────────────────────────────
    const packages = [
      { packageId: 'PKG_001', name: 'Nexus Start',    amount: 100,   dailyROI: { min: 0.0025, max: 0.02 }, maximumReturn: 250 },
      { packageId: 'PKG_002', name: 'Nexus Pro',      amount: 500,   dailyROI: { min: 0.0040, max: 0.02 }, maximumReturn: 1250 },
      { packageId: 'PKG_003', name: 'Nexus Elite',    amount: 1000,  dailyROI: { min: 0.0050, max: 0.02 }, maximumReturn: 2500 },
      { packageId: 'PKG_004', name: 'Nexus Titan',    amount: 5000,  dailyROI: { min: 0.0070, max: 0.02 }, maximumReturn: 12500 },
      { packageId: 'PKG_005', name: 'Nexus Infinity', amount: 10000, dailyROI: { min: 0.0100, max: 0.02 }, maximumReturn: 25000 },
    ];
    for (const pkg of packages) {
      await Package.findOneAndUpdate({ packageId: pkg.packageId }, pkg, { upsert: true });
    }
    console.log('✅ 5 packages seeded');

    // ─── Rank Reward Catalog ─────────────────────────────
    const ranks = [
      { rankName: 'Member',        requiredBusiness: 0,        rewardType: 'cash',   bonusAmount: 0,    rewardValueUSD: 0 },
      { rankName: 'Explorer',      requiredBusiness: 10000,    rewardType: 'cash',   bonusAmount: 100,  rewardValueUSD: 100,    rewardDescription: '$100 Cash Bonus' },
      { rankName: 'Navigator',     requiredBusiness: 50000,    rewardType: 'cash',   bonusAmount: 500,  rewardValueUSD: 500,    rewardDescription: '$500 Cash Bonus' },
      { rankName: 'Pioneer',       requiredBusiness: 100000,   rewardType: 'gadget', bonusAmount: 0,    rewardValueUSD: 1200,   rewardDescription: 'MacBook' },
      { rankName: 'Visionary',     requiredBusiness: 500000,   rewardType: 'tour',   bonusAmount: 0,    rewardValueUSD: 5000,   rewardDescription: 'Dubai Trip' },
      { rankName: 'Titan',         requiredBusiness: 1000000,  rewardType: 'fund',   bonusAmount: 0,    rewardValueUSD: 25000,  rewardDescription: 'Car Fund' },
      { rankName: 'Galaxy',        requiredBusiness: 5000000,  rewardType: 'car',    bonusAmount: 0,    rewardValueUSD: 60000,  rewardDescription: 'Luxury Car' },
      { rankName: 'Nexus Crown',   requiredBusiness: 10000000, rewardType: 'villa',  bonusAmount: 0,    rewardValueUSD: 200000, rewardDescription: 'Villa Fund' },
    ];
    for (const r of ranks) {
      await RankRewardCatalog.findOneAndUpdate({ rankName: r.rankName }, r, { upsert: true });
    }
    console.log('✅ 8 rank reward catalog entries seeded');

    // ─── System Config ────────────────────────────────────
    const configExists = await SystemConfig.findOne();
    if (!configExists) {
      await SystemConfig.create({
        roiMin: 0.0025, roiMax: 0.02, earningCap: 250,
        directBonus: 8, withdrawalFee: 5, minWithdrawal: 20,
        maxDailyWithdrawal: 5000, poolPercentage: 2,
        stakingDays: 45, boosterHours: 48, compoundEnabled: true, compoundMinBalance: 10
      });
      console.log('✅ SystemConfig seeded');
    } else {
      console.log('ℹ️  SystemConfig already exists');
    }

    // ─── System Settings ─────────────────────────────────
    const settings = [
      { settingKey: 'platform_name', settingValue: 'AURAX', category: 'general', description: 'Platform display name' },
      { settingKey: 'platform_currency', settingValue: 'USDT', category: 'general', description: 'Primary currency' },
      { settingKey: 'maintenance_mode', settingValue: false, category: 'system', description: 'Maintenance mode toggle' },
      { settingKey: 'registration_enabled', settingValue: true, category: 'system', description: 'Allow new registrations' },
    ];
    for (const s of settings) {
      await SystemSettings.findOneAndUpdate({ settingKey: s.settingKey }, s, { upsert: true });
    }
    console.log('✅ System settings seeded');

    console.log('\n🎉 Seed complete! Admin login: AC100001 / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
