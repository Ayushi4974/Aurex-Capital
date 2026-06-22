import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, ArrowRight, Award, UserPlus, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function BonusManagement({ isLiveMode, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [manualAdjustment, setManualAdjustment] = useState({
    userId: '',
    bonusType: 'RankReward',
    amount: '',
    description: ''
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const uList = await api.adminGetUsers(isLiveMode);
        setUsers(uList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [isLiveMode, refreshTrigger]);

  const handleManualBonus = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const targetUserId = manualAdjustment.userId.toUpperCase().trim();
    const amount = parseFloat(manualAdjustment.amount);

    if (!targetUserId || isNaN(amount) || amount <= 0) {
      setErrorMsg('Please specify a valid User ID and amount greater than 0.');
      return;
    }

    // Load users from storage
    const allUsers = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const targetUser = allUsers.find(u => u.userId === targetUserId);
    if (!targetUser) {
      setErrorMsg('User not found.');
      return;
    }

    // Add bonus to wallet protok profit
    targetUser.wallet.protok.profit += amount;
    localStorage.setItem('aurex_users', JSON.stringify(allUsers));

    // Log transaction
    const allTransactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
    allTransactions.push({
      id: `TX_${allTransactions.length + 201}`,
      userId: targetUserId,
      amount,
      type: manualAdjustment.bonusType,
      status: 'Completed',
      createdAt: new Date(localStorage.getItem('aurex_virtual_date') || new Date()).toISOString(),
      description: manualAdjustment.description || `Manual ${manualAdjustment.bonusType} adjustment by Admin`
    });
    localStorage.setItem('aurex_transactions', JSON.stringify(allTransactions));

    setSuccessMsg(`Successfully credited $${amount} as ${manualAdjustment.bonusType} to user ${targetUserId}!`);
    setManualAdjustment({
      userId: '',
      bonusType: 'RankReward',
      amount: '',
      description: ''
    });
  };

  // Helper to find ranks achievements candidates
  const getRankEligibility = () => {
    return users.filter(u => u.business.leftBusiness + u.business.rightBusiness >= 5000).map(u => {
      const volume = u.business.leftBusiness + u.business.rightBusiness;
      let calculatedRank = 'Member';
      let rewardValue = '';
      if (volume >= 1000000) {
        calculatedRank = 'Nexus Crown';
        rewardValue = '$50,000 Luxury Cruise & Asset';
      } else if (volume >= 500000) {
        calculatedRank = 'Galaxy';
        rewardValue = '$25,000 Luxury Sports Car Reward';
      } else if (volume >= 100000) {
        calculatedRank = 'Titan';
        rewardValue = '$5,000 Premium Rolex Watch';
      } else if (volume >= 50000) {
        calculatedRank = 'Visionary';
        rewardValue = '$2,500 Cash Reward';
      } else if (volume >= 15000) {
        calculatedRank = 'Pioneer';
        rewardValue = '$750 Travel Voucher';
      } else if (volume >= 10000) {
        calculatedRank = 'Navigator';
        rewardValue = '$500 Gold Voucher';
      } else if (volume >= 5000) {
        calculatedRank = 'Explorer';
        rewardValue = '$250 Cash Reward';
      }

      return {
        userId: u.userId,
        name: u.name,
        totalVolume: volume,
        currentRank: u.rank,
        projectedRank: calculatedRank,
        reward: rewardValue
      };
    }).filter(item => item.projectedRank !== 'Member');
  };

  const eligibleRanks = getRankEligibility();

  const handlePromoteUser = (userId, newRank, rewardAmountText) => {
    const allUsers = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = allUsers.findIndex(u => u.userId === userId);
    if (idx > -1) {
      allUsers[idx].rank = newRank;
      
      // Parse reward cash if applicable
      let rewardCash = 0;
      if (rewardAmountText.includes('$250')) rewardCash = 250;
      else if (rewardAmountText.includes('$500')) rewardCash = 500;
      else if (rewardAmountText.includes('$750')) rewardCash = 750;
      else if (rewardAmountText.includes('$2,500')) rewardCash = 2500;
      else if (rewardAmountText.includes('$5,000')) rewardCash = 5000;
      else if (rewardAmountText.includes('$25,000')) rewardCash = 25000;
      else if (rewardAmountText.includes('$50,000')) rewardCash = 50000;

      if (rewardCash > 0) {
        allUsers[idx].wallet.protok.profit += rewardCash;
      }

      localStorage.setItem('aurex_users', JSON.stringify(allUsers));

      // Log transaction
      const allTransactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
      allTransactions.push({
        id: `TX_${allTransactions.length + 201}`,
        userId,
        amount: rewardCash || 0,
        type: 'RankReward',
        status: 'Completed',
        createdAt: new Date(localStorage.getItem('aurex_virtual_date') || new Date()).toISOString(),
        description: `Rank reward release for achievement of ${newRank} rank. Reward: ${rewardAmountText}`
      });
      localStorage.setItem('aurex_transactions', JSON.stringify(allTransactions));

      alert(`User ${userId} successfully promoted to ${newRank}!`);
      // Reload users list
      const updated = allUsers;
      setUsers(updated);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Bonus & Rank <span className="gold-text-gradient">Management</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Admin panel to trigger milestone promotions and manage manual bonus balance adjustments
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Manual Adjustments */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -6, scale: 1.012, boxShadow: '0 16px 36px rgba(212,175,55,0.13)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '32px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--gold-primary)' }} />
            Manual Adjustment Form
          </h3>

          <form onSubmit={handleManualBonus}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TARGET USER ID
              </label>
              <input
                type="text"
                placeholder="e.g. AC100002"
                value={manualAdjustment.userId}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, userId: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                BONUS CATEGORY
              </label>
              <select
                value={manualAdjustment.bonusType}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, bonusType: e.target.value })}
                className="form-input"
                style={{ background: '#000', color: '#fff' }}
              >
                <option value="RankReward">Rank Reward</option>
                <option value="DirectReward">Direct Referral Reward</option>
                <option value="BinaryReward">Binary Match Reward</option>
                <option value="LevelReward">Level Income Reward</option>
                <option value="FastTrackReward">FastTrack Reward</option>
                <option value="PoolReward">Pool Reward</option>
                <option value="LoyaltyReward">Loyalty Reward</option>
              </select>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                BONUS AMOUNT ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={manualAdjustment.amount}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, amount: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                DESCRIPTION
              </label>
              <input
                type="text"
                placeholder="Bonus adjustment reason..."
                value={manualAdjustment.description}
                onChange={(e) => setManualAdjustment({ ...manualAdjustment, description: e.target.value })}
                className="form-input"
              />
            </div>

            {errorMsg && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '14px' }}>{successMsg}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Submit Adjustment
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Milestone Achievements Process */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          whileHover={{ y: -6, scale: 1.012, boxShadow: '0 16px 36px rgba(212,175,55,0.13)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '28px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} style={{ color: 'var(--gold-primary)' }} />
            Rank Qualification Pipeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {eligibleRanks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No active users have reached milestone qualification thresholds.
              </div>
            ) : (
              eligibleRanks.map((r, i) => {
                const alreadyAchieved = r.currentRank === r.projectedRank;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 6, background: 'rgba(212,175,55,0.04)', transition: { duration: 0.15 } }}
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{r.name} ({r.userId})</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '2px' }}>
                        Business Volume: <strong>${r.totalVolume.toLocaleString()}</strong>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Rank: {r.currentRank} {!alreadyAchieved && `-> Projected: ${r.projectedRank}`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 600, marginTop: '2px' }}>
                        Reward: {r.reward}
                      </div>
                    </div>

                    <div>
                      {alreadyAchieved ? (
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Processed</span>
                      ) : (
                        <button
                          onClick={() => handlePromoteUser(r.userId, r.projectedRank, r.reward)}
                          style={{
                            background: 'rgba(212,175,55,0.1)',
                            border: '1px solid var(--border-gold)',
                            color: 'var(--gold-primary)',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          Promote & Reward
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
