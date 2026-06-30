/**
 * AURAX MLM E2E Flow Verification Script
 * Validates: Registration, Binary Placement, Direct Bonus (8%),
 * Level Unlock rules, Level Income distribution (30 levels),
 * Binary business volume updates, and Rank progression triggers.
 *
 * Run: npm run test-mlm
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Wallet = require('../models/Wallet');
const WalletLedger = require('../models/WalletLedger');
const BinaryTree = require('../models/BinaryTree');
const TeamBusiness = require('../models/TeamBusiness');
const LevelUnlock = require('../models/LevelUnlock');
const Investment = require('../models/Investment');
const DirectBonus = require('../models/DirectBonus');
const LevelIncome = require('../models/LevelIncome');
const RankHistory = require('../models/RankHistory');

const { processRegistration, processInvestment } = require('../services/mlmService');
const rankService = require('../services/rankService');

const runTest = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    // Ensure Admin User (AC100001) exists
    const adminUser = await User.findOne({ userId: 'AC100001' });
    if (!adminUser) {
      console.log('ℹ️ Admin user AC100001 not found. Creating for test...');
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
      console.log('✅ Admin user AC100001 created.');
    }

    // 1. Clean up old test data (emails matching test_mlm_*)
    console.log('🧹 Cleaning up prior test data...');
    const oldUsers = await User.find({ email: /test_mlm_/ });
    const oldUserIds = oldUsers.map(u => u.userId);
    
    if (oldUserIds.length > 0) {
      await User.deleteMany({ userId: { $in: oldUserIds } });
      await UserProfile.deleteMany({ userId: { $in: oldUserIds } });
      await Wallet.deleteMany({ userId: { $in: oldUserIds } });
      await WalletLedger.deleteMany({ userId: { $in: oldUserIds } });
      await BinaryTree.deleteMany({ userId: { $in: oldUserIds } });
      await TeamBusiness.deleteMany({ userId: { $in: oldUserIds } });
      await LevelUnlock.deleteMany({ userId: { $in: oldUserIds } });
      await Investment.deleteMany({ userId: { $in: oldUserIds } });
      await DirectBonus.deleteMany({ fromUser: { $in: oldUserIds } });
      await LevelIncome.deleteMany({ fromUser: { $in: oldUserIds } });
      await RankHistory.deleteMany({ userId: { $in: oldUserIds } });
      await require('../models/FastTrackBonus').deleteMany({ userId: { $in: oldUserIds } });
      await require('../models/RankReward').deleteMany({ userId: { $in: oldUserIds } });
      console.log(`🧹 Deleted ${oldUserIds.length} prior test users and related records.`);
    }

    const testPassword = await bcrypt.hash('testpassword', 12);
    
    // Helper function to register a test user
    const registerTestUser = async (name, email, sponsorId, position) => {
      const username = email.split('@')[0];
      const u = new User({
        name,
        email,
        username,
        password: testPassword,
        plainPassword: 'testpassword',
        mobile: '1234567890',
        sponsorId,
        position,
        role: 'user',
        status: 'active'
      });
      await u.save();
      await UserProfile.create({ userId: u.userId, fullName: name });
      await processRegistration(u);
      
      // Seed deposit balance so they can purchase packages
      const wallet = await Wallet.findOne({ userId: u.userId });
      wallet.depositBalance = 200000; // Give plenty of funds for testing
      await wallet.save();
      
      return await User.findOne({ userId: u.userId });
    };

    console.log('\n🧬 [Step 1] Building Sponsor/Binary Tree Structure...');
    
    // Upline chain: AC100001 -> userA -> userB -> userC -> userD -> userE -> userF
    // In order for level income to unlock up to Level 5, sponsors A, B, C, D, E must have >= 2 directs.
    // So we will register:
    // - userA sponsored by AC100001 (A direct 1)
    // - userA_d2 sponsored by userA (A direct 2) - now userA has L1-5 unlocked!
    //
    // - userB sponsored by userA (B direct 1)
    // - userB_d2 sponsored by userB (B direct 2) - now userB has L1-5 unlocked!
    //
    // - userC sponsored by userB (C direct 1)
    // - userC_d2 sponsored by userC (C direct 2) - now userC has L1-5 unlocked!
    //
    // - userD sponsored by userC (D direct 1)
    // - userD_d2 sponsored by userD (D direct 2) - now userD has L1-5 unlocked!
    //
    // - userE sponsored by userD (E direct 1)
    // - userE_d2 sponsored by userE (E direct 2) - now userE has L1-5 unlocked!
    //
    // - userF sponsored by userE (F direct 1)

    console.log('Registering userA...');
    const userA = await registerTestUser('Test User A', 'test_mlm_a@aurex.com', 'AC100001', 'left');
    console.log(`Registered userA: ${userA.userId}`);

    console.log('Registering userA_d2...');
    const userA_d2 = await registerTestUser('Test User A Direct 2', 'test_mlm_a_d2@aurex.com', userA.userId, 'right');

    console.log('Registering userB...');
    const userB = await registerTestUser('Test User B', 'test_mlm_b@aurex.com', userA.userId, 'left');

    console.log('Registering userB_d2...');
    const userB_d2 = await registerTestUser('Test User B Direct 2', 'test_mlm_b_d2@aurex.com', userB.userId, 'right');

    console.log('Registering userC...');
    const userC = await registerTestUser('Test User C', 'test_mlm_c@aurex.com', userB.userId, 'left');

    console.log('Registering userC_d2...');
    const userC_d2 = await registerTestUser('Test User C Direct 2', 'test_mlm_c_d2@aurex.com', userC.userId, 'right');

    console.log('Registering userD...');
    const userD = await registerTestUser('Test User D', 'test_mlm_d@aurex.com', userC.userId, 'left');

    console.log('Registering userD_d2...');
    const userD_d2 = await registerTestUser('Test User D Direct 2', 'test_mlm_d_d2@aurex.com', userD.userId, 'right');

    console.log('Registering userE...');
    const userE = await registerTestUser('Test User E', 'test_mlm_e@aurex.com', userD.userId, 'left');

    console.log('Registering userE_d2...');
    const userE_d2 = await registerTestUser('Test User E Direct 2', 'test_mlm_e_d2@aurex.com', userE.userId, 'right');

    console.log('Registering userF...');
    const userF = await registerTestUser('Test User F', 'test_mlm_f@aurex.com', userE.userId, 'left');

    console.log('\n📊 Verifying Binary Placement Positions...');
    
    // Check Binary Nodes
    const checkNode = async (userId, expectedParentId, expectedPos) => {
      const node = await BinaryTree.findOne({ userId });
      if (!node) throw new Error(`Binary node not found for ${userId}`);
      console.log(`User ${userId}: parentId=${node.parentId}, position=${node.position}, path=${node.path}`);
      if (node.parentId !== expectedParentId) {
        throw new Error(`Expected parent ${expectedParentId} for ${userId}, got ${node.parentId}`);
      }
      if (node.position !== expectedPos) {
        throw new Error(`Expected position ${expectedPos} for ${userId}, got ${node.position}`);
      }
    };

    await checkNode(userA.userId, 'AC100001', 'left');
    await checkNode(userA_d2.userId, userA.userId, 'right');
    await checkNode(userB.userId, userA.userId, 'left');
    await checkNode(userB_d2.userId, userB.userId, 'right');
    await checkNode(userC.userId, userB.userId, 'left');
    await checkNode(userC_d2.userId, userC.userId, 'right');
    await checkNode(userD.userId, userC.userId, 'left');
    await checkNode(userD_d2.userId, userD.userId, 'right');
    await checkNode(userE.userId, userD.userId, 'left');
    await checkNode(userE_d2.userId, userE.userId, 'right');
    await checkNode(userF.userId, userE.userId, 'left');

    console.log('✅ Binary placements verified successfully!');

    // Let's verify direct count and levels unlocked on LevelUnlock
    console.log('\n📊 Checking Sponsor Direct counts & Level Unlocks...');
    const checkDirectsAndUnlock = async (userId, expectedDirects, expectedLevels) => {
      const u = await User.findOne({ userId });
      const unlock = await LevelUnlock.findOne({ userId });
      console.log(`User ${userId}: directs=${u.directCount}, unlockedLevels=${unlock.levelsUnlocked}`);
      if (u.directCount !== expectedDirects) {
        throw new Error(`Expected direct count ${expectedDirects} for ${userId}, got ${u.directCount}`);
      }
      if (unlock.levelsUnlocked !== expectedLevels) {
        throw new Error(`Expected level unlock ${expectedLevels} for ${userId}, got ${unlock.levelsUnlocked}`);
      }
    };

    await checkDirectsAndUnlock(userE.userId, 2, 5);
    await checkDirectsAndUnlock(userD.userId, 2, 5);
    await checkDirectsAndUnlock(userC.userId, 2, 5);
    await checkDirectsAndUnlock(userB.userId, 2, 5);
    await checkDirectsAndUnlock(userA.userId, 2, 5);
    console.log('✅ Direct counts and levels unlocked verified successfully!');

    console.log('\n💼 [Step 2] Triggering Investment of $10,000 for userF...');
    
    // Purchase package: Nexus Infinity ($10,000) for userF
    const investAmount = 10000;
    const inv = await Investment.create({
      userId: userF.userId,
      package: 'Nexus Infinity',
      amount: investAmount,
      earningCap: investAmount * 2.5,
      planType: 'package',
      purchaseDate: new Date()
    });

    // Debit userF's wallet
    const walletF = await Wallet.findOne({ userId: userF.userId });
    walletF.depositBalance -= investAmount;
    await walletF.save();

    // Process investment payouts/volume updates
    await processInvestment(userF.userId, inv.investmentId, investAmount, 'Nexus Infinity');
    console.log(`✅ Investment processed. ID: ${inv.investmentId}`);

    console.log('\n📈 [Step 3] Verifying Direct and Level Commission Credits...');

    // 1. Direct commission: userE is sponsor, gets 8% of 10000 = $800.
    const walletE = await Wallet.findOne({ userId: userE.userId });
    console.log(`Sponsor userE bonusBalance = $${walletE.bonusBalance}`);
    
    // Let's verify direct bonus record
    const dbRecord = await DirectBonus.findOne({ fromUser: userF.userId, toUser: userE.userId });
    if (!dbRecord || dbRecord.amount !== 800) {
      throw new Error(`Expected direct bonus of $800 to userE, got: ${dbRecord ? dbRecord.amount : 'none'}`);
    }
    console.log(`✅ Direct bonus verified: $${dbRecord.amount} credited to userE.`);

    // 2. Level income payout verification:
    // - Level 1: userE (Sponsor). Payout: 10% of 10,000 = $1000.
    // - Level 2: userD. Payout: 5% of 10,000 = $500.
    // - Level 3: userC. Payout: 3% of 10,000 = $300.
    // - Level 4: userB. Payout: 2% of 10,000 = $200.
    // - Level 5: userA. Payout: 2% of 10,000 = $200.
    // - Level 6: AC100001 (Admin, level 30 unlocked). Payout: 1% of 10,000 = $100.
    const checkLevelIncome = async (receiverId, expectedLevel, expectedAmt) => {
      const records = await LevelIncome.find({ fromUser: userF.userId, receiver: receiverId, level: expectedLevel });
      if (records.length === 0) {
        throw new Error(`No level income record found for ${receiverId} at Level ${expectedLevel}`);
      }
      const sum = records.reduce((acc, r) => acc + r.amount, 0);
      console.log(`Level ${expectedLevel} (receiver: ${receiverId}): Earned $${sum}`);
      if (sum !== expectedAmt) {
        throw new Error(`Expected $${expectedAmt} level income for ${receiverId}, got $${sum}`);
      }
    };

    await checkLevelIncome(userE.userId, 1, 1000);
    await checkLevelIncome(userD.userId, 2, 500);
    await checkLevelIncome(userC.userId, 3, 300);
    await checkLevelIncome(userB.userId, 4, 200);
    await checkLevelIncome(userA.userId, 5, 200);
    await checkLevelIncome('AC100001', 6, 100);
    console.log('✅ All Level Income commissions verified successfully!');

    console.log('\n📊 [Step 4] Verifying Binary Business Volume Propagation...');
    
    // Check TeamBusiness left/right volumes:
    // userF is left of userE, who is left of userD, who is left of userC, who is left of userB, who is left of userA, who is left of AC100001.
    // So all of them should receive $10,000 on their leftBusiness!
    const checkTeamBusiness = async (userId, expectedLeftVolume, expectedRightVolume) => {
      const tb = await TeamBusiness.findOne({ userId });
      if (!tb) throw new Error(`TeamBusiness record not found for ${userId}`);
      console.log(`User ${userId}: leftBusiness=$${tb.leftBusiness}, rightBusiness=$${tb.rightBusiness}`);
      if (tb.leftBusiness !== expectedLeftVolume) {
        throw new Error(`Expected leftBusiness of ${expectedLeftVolume} for ${userId}, got ${tb.leftBusiness}`);
      }
      if (tb.rightBusiness !== expectedRightVolume) {
        throw new Error(`Expected rightBusiness of ${expectedRightVolume} for ${userId}, got ${tb.rightBusiness}`);
      }
    };

    await checkTeamBusiness(userE.userId, 10000, 0);
    await checkTeamBusiness(userD.userId, 10000, 0); // userE is left child of userD
    await checkTeamBusiness(userC.userId, 10000, 0); // userD is left child of userC
    await checkTeamBusiness(userB.userId, 10000, 0); // userC is left child of userB
    await checkTeamBusiness(userA.userId, 10000, 0); // userB is left child of userA
    
    console.log('✅ Binary Business Volume propagation verified successfully!');

    console.log('\n🏆 [Step 5] Verifying Rank Progression Trigger...');
    
    // Ranks are based on team business + user investment
    // Let's verify if userE rank has been promoted.
    // userE's team business is $10,000 (from userF's investment).
    // Explorer needs $10,000.
    // Let's check what rank userE has achieved.
    const finalUserE = await User.findOne({ userId: userE.userId });
    console.log(`User E rank: ${finalUserE.rank}`);
    if (finalUserE.rank !== 'Explorer') {
      throw new Error(`Expected userE to be promoted to Explorer (total business: 10,000), got: ${finalUserE.rank}`);
    }
    
    // Verify FastTrack bonus is credited
    // Explorer bonus: $100
    // Total FastTrack bonus = $100
    // Let's check userE's bonus balance or fasttrack reward records.
    const rewards = await RankHistory.find({ userId: userE.userId });
    console.log(`Rank achievements for userE:`, rewards.map(r => r.newRank));
    if (rewards.length !== 1) {
      throw new Error(`Expected 1 rank achievement (Explorer) for userE, got: ${rewards.length}`);
    }
    
    // Manually process pending FastTrack bonuses for the test since cron isn't running
    const FastTrackBonus = require('../models/FastTrackBonus');
    const { creditWallet } = require('../services/mlmService');
    const pendingFT = await FastTrackBonus.find({ userId: userE.userId, status: 'pending' });
    for (const ft of pendingFT) {
      await creditWallet(ft.userId, 'bonusBalance', ft.cashBonus, 'fasttrack',
        `FastTrack bonus for ${ft.rank}`, ft.bonusId);
      ft.status = 'credited';
      await ft.save();
    }

    // Check wallet bonus balance for userE.
    // Direct bonus ($800) + Level 1 Income ($1000) + Explorer FastTrack ($100) + Velocity FastTrack ($100) = $2000.
    const refreshedWalletE = await Wallet.findOne({ userId: userE.userId });
    console.log(`User E refreshed wallet balance: deposit=${refreshedWalletE.depositBalance}, bonus=${refreshedWalletE.bonusBalance}`);
    if (refreshedWalletE.bonusBalance !== 2000) {
      throw new Error(`Expected bonusBalance to be 2000 for userE, got: ${refreshedWalletE.bonusBalance}`);
    }
    console.log('✅ Rank progression and FastTrack bonuses verified successfully!');

    console.log('\n🎉 ALL MLM ENGINE TESTS PASSED SUCCESSFULLY! E2E VERIFIED.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err);
    process.exit(1);
  }
};

runTest();
