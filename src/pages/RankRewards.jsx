import React from 'react';
import { Award, Target, Trophy, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RankRewards({ user }) {
  const currentRank = user.rank || 'Member';
  const teamBusiness = (user.business?.leftBusiness || 0) + (user.business?.rightBusiness || 0);

  const ranks = [
    { name: 'Member', target: 0, reward: 'Account Activated', active: true },
    { name: 'Explorer', target: 5000, reward: '$250 Cash Reward', active: teamBusiness >= 5000 || currentRank === 'Explorer' || currentRank === 'Navigator' || currentRank === 'Pioneer' || currentRank === 'Visionary' || currentRank === 'Titan' || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Navigator', target: 10000, reward: '$500 Gold Voucher', active: teamBusiness >= 10000 || currentRank === 'Navigator' || currentRank === 'Pioneer' || currentRank === 'Visionary' || currentRank === 'Titan' || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Pioneer', target: 15000, reward: '$750 Travel Voucher', active: teamBusiness >= 15000 || currentRank === 'Pioneer' || currentRank === 'Visionary' || currentRank === 'Titan' || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Visionary', target: 5000, reward: '$2,500 Cash Reward', active: teamBusiness >= 50000 || currentRank === 'Visionary' || currentRank === 'Titan' || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Titan', target: 100000, reward: '$5,000 Premium Rolex Watch', active: teamBusiness >= 100000 || currentRank === 'Titan' || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Galaxy', target: 500000, reward: '$25,000 Luxury Sports Car Reward', active: teamBusiness >= 500000 || currentRank === 'Galaxy' || currentRank === 'Nexus Crown' },
    { name: 'Nexus Crown', target: 1000000, reward: '$50,000 Luxury Cruise & Asset', active: teamBusiness >= 1000000 || currentRank === 'Nexus Crown' }
  ];

  // Adjust vision target manually to avoid duplicate indices
  ranks[4].target = 50000;

  // Find next rank progress
  const nextRank = ranks.find(r => !r.active) || { name: 'Max Rank Achieved', target: teamBusiness };
  const prevRank = [...ranks].reverse().find(r => r.active) || ranks[0];

  const progressPercent = nextRank.target > 0 
    ? Math.min(100, Math.max(0, ((teamBusiness - prevRank.target) / (nextRank.target - prevRank.target)) * 100))
    : 100;

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Rank & <span className="gold-text-gradient">Milestone Rewards</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Qualify for premium leadership awards milestones by building active unilevel downline volumes.
        </p>
      </div>

      {/* Progress Card */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justify: 'center', color: 'var(--gold-primary)' }}>
              <Trophy size={24} />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CURRENT LEADERSHIP RANK</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-white)' }}>{currentRank}</h2>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL NETWORK VOLUME BUSINESS</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              ${teamBusiness.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Progress Bar */}
        {nextRank.name !== 'Max Rank Achieved' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px' }}>
              <span>Progress to next rank: <strong>{nextRank.name}</strong></span>
              <span>${teamBusiness.toLocaleString()} / ${nextRank.target.toLocaleString()}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-primary))', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Ranks Milestones */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} style={{ color: 'var(--gold-primary)' }} />
          Qualification Milestones Pathways
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ranks.slice(1).map((r, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: r.active ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-grey)',
                padding: '16px', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={18} style={{ color: r.active ? 'var(--gold-primary)' : 'var(--text-muted)' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: r.active ? 'var(--text-white)' : 'var(--text-muted)' }}>
                    {r.name} Rank
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-grey)' }}>Reward milestone: {r.reward}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-grey)' }}>
                  Target Volume: ${r.target.toLocaleString()}
                </span>
                <span style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700,
                  background: r.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  color: r.active ? '#34d399' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {r.active ? <CheckCircle size={10} /> : <Lock size={10} />}
                  {r.active ? 'Achieved' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
