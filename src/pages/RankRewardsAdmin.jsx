import React, { useState } from 'react';
import { Trophy, CheckCircle, Search, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RankRewardsAdmin() {
  const [achievements, setAchievements] = useState([
    { id: 'ACH_301', userId: 'IVA100002', rank: 'Executive', reward: '$250 Gold Cash Reward', status: 'Pending', date: '2026-06-18' },
    { id: 'ACH_302', userId: 'IVA100003', rank: 'Executive', reward: '$250 Gold Cash Reward', status: 'Approved', date: '2026-06-15' }
  ]);

  const handleApproveReward = (achId) => {
    const list = achievements.map(ach => {
      if (ach.id === achId) {
        return { ...ach, status: 'Approved' };
      }
      return ach;
    });
    setAchievements(list);
    alert(`Rank reward for ${achId} approved and cash bonuses credited to staker!`);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Rank & Rewards <span className="gold-text-gradient">Management</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Verify qualifications criteria, monitor achievements, and process manual leadership rewards release
        </p>
      </motion.div>

      {/* Grid criteria configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        whileHover={{ y: -5, boxShadow: '0 12px 28px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} style={{ color: 'var(--gold-primary)' }} />
          Qualify Milestones Setup
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '12px', color: 'var(--text-grey)' }}>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px' }}>
            <strong>Executive Target:</strong>
            <p style={{ marginTop: '2px', color: 'white' }}>$5,000 Team Business Volume</p>
            <p style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Reward: $250 Cash</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px' }}>
            <strong>Manager Target:</strong>
            <p style={{ marginTop: '2px', color: 'white' }}>$15,000 Team Business Volume</p>
            <p style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Reward: $750 Travel Voucher</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px' }}>
            <strong>Director Target:</strong>
            <p style={{ marginTop: '2px', color: 'white' }}>$50,000 Team Business Volume</p>
            <p style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Reward: Luxury Watch</p>
          </div>
        </div>
      </div>

      {/* Actionable approvals */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gift size={18} style={{ color: 'var(--gold-primary)' }} />
          Pending Achievements Rewards Approvals ({achievements.filter(a => a.status === 'Pending').length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: ach.status === 'Pending' ? '1px solid var(--border-gold)' : '1px solid var(--border-grey)',
                padding: '16px', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ach.id} (User: {ach.userId})</span>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>Promoted to: {ach.rank}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>Reward Mapped: {ach.reward}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700,
                  background: ach.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: ach.status === 'Approved' ? '#34d399' : '#f59e0b'
                }}>
                  {ach.status}
                </span>
                {ach.status === 'Pending' && (
                  <button 
                    onClick={() => handleApproveReward(ach.id)}
                    style={{ padding: '6px 14px', background: 'var(--gold-primary)', border: 'none', color: 'var(--bg-black)', borderRadius: '4px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Release Reward
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
