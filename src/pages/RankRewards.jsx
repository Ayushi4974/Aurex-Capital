import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Target, Award, CheckCircle, Lock,
  TrendingUp, Users, Info, Crown, Calendar,
  User, Compass, Navigation, Zap, Globe, Eye,
  Sparkles, Briefcase, ArrowLeft, ArrowRight,
  Clock, RefreshCw, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

/* ── Reusable Premium Icon Container Component ── */
function IconContainer({ icon: Icon, color, size = 20 }) {
  return (
    <div style={{
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      background: `${color}14`, // ~8% opacity
      border: `1px solid ${color}2e`, // ~18% opacity
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      flexShrink: 0
    }}>
      <Icon size={size} />
    </div>
  );
}

/* ── Rank ladder (10 Ranks: Member + 9 leadership levels) ── */
const RANKS = [
  { name: 'Member',         target: 0,       reward: 'Account Activated',              icon: User },
  { name: 'Scout',          target: 2500,    reward: 'Thailand Tour',                  icon: Compass },
  { name: 'Ranger',         target: 5000,    reward: 'Malaysia Tour',                  icon: Navigation },
  { name: 'Explorer',       target: 1000,    reward: 'MacBook Reward',                 icon: Zap },
  { name: 'Navigator',      target: 25000,   reward: 'iPhone Reward',                  icon: Globe },
  { name: 'Visionary',      target: 50000,   reward: 'Dubai Trip + Luxury Watch',      icon: Eye },
  { name: 'Titan',          target: 100000,  reward: 'Car Fund',                       icon: Trophy },
  { name: 'Galaxy',         target: 250000,  reward: 'SUV / Premium Car Reward',       icon: Sparkles },
  { name: 'Nexus Crown',    target: 500000,  reward: 'Luxury Car Reward',              icon: Crown },
  { name: 'Quantum Legend', target: 1000000, reward: 'Villa Fund',                     icon: Award }
];

const RANK_COLORS = {
  'Member':         '#6b7280',
  'Scout':          '#f59e0b',
  'Ranger':         '#10b981',
  'Explorer':       '#3b82f6',
  'Navigator':      '#8b5cf6',
  'Visionary':      '#ec4899',
  'Titan':          '#ef4444',
  'Galaxy':         '#06b6d4',
  'Nexus Crown':    '#d4af37',
  'Quantum Legend': '#f43f5e'
};

const MOCK_MONTHLY = [
  { month: 'Jan', business: 4200  },
  { month: 'Feb', business: 7800  },
  { month: 'Mar', business: 9500  },
  { month: 'Apr', business: 11200 },
  { month: 'May', business: 15000 },
  { month: 'Jun', business: 18500 },
];

const fmtFull = (v) =>
  `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

const fmt = (v) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
  : `$${v}`;

export default function RankRewards({ user }) {
  const [activeTab, setActiveTab] = useState('journey');

  const currentRank  = user?.rank || 'Member';
  const selfBiz      = user?.business?.self           || 0;
  const leftBiz      = user?.business?.leftBusiness   || 0;
  const rightBiz     = user?.business?.rightBusiness  || 0;
  const totalTeamBiz = leftBiz + rightBiz;
  const doj          = user?.doj
    ? new Date(user.doj).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const ranksWithStatus = useMemo(() =>
    RANKS.map((r) => ({
      ...r,
      achieved:
        RANKS.findIndex(x => x.name === currentRank) >=
        RANKS.findIndex(x => x.name === r.name),
    })),
  [currentRank]);

  const currentRankObj = ranksWithStatus.find(r => r.name === currentRank) || ranksWithStatus[0];
  const nextRankObj    = ranksWithStatus.find(r => !r.achieved && r.target > 0);
  const prevRankObj    = [...ranksWithStatus].reverse().find(r => r.achieved) || ranksWithStatus[0];

  const progressPct = nextRankObj
    ? Math.min(100, Math.max(0,
        ((totalTeamBiz - prevRankObj.target) / (nextRankObj.target - prevRankObj.target)) * 100
      ))
    : 100;

  const remaining   = nextRankObj ? Math.max(0, nextRankObj.target - totalTeamBiz) : 0;
  const accentColor = RANK_COLORS[currentRank] || '#d4af37';

  const rewardHistory = ranksWithStatus
    .filter(r => r.name !== 'Member')
    .map(r => ({
      rank:   r.name,
      reward: r.reward,
      status: r.achieved ? 'Received' : nextRankObj?.name === r.name ? 'Pending' : 'Locked',
      date:   r.achieved ? doj : '—',
      icon:   r.icon
    }));

  const checklist = [
    { label: 'Team Business reached minimum target', done: totalTeamBiz >= (currentRankObj?.target || 0) },
    { label: 'Account Active',                       done: user?.isActive !== false },
    { label: 'Minimum package purchased',            done: selfBiz >= 100 },
    { label: 'Required referrals completed',         done: (user?.business?.directTeam || 0) >= 1 },
    { label: 'Verification pending',                 done: false },
  ];

  const hoverAnim = { y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } };

  return (
    <div className="page-container">

      {/* ── TITLE ── */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Rank &amp; <span className="gold-text-gradient">Milestone Rewards</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Build your team business to unlock premium ranks and leadership rewards.
        </p>
      </div>

      {/* ── ROW 1: Current Rank Card + Next Rank Progress ── */}
      <div className="responsive-grid-1-15" style={{ gap: '24px', alignItems: 'stretch' }}>

        {/* Current Rank Card */}
        <motion.div
          whileHover={hoverAnim}
          className="glass-card shifting-card"
          style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: accentColor, opacity: 0.07, filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
            <IconContainer icon={currentRankObj.icon || User} color={accentColor} size={24} />
            <div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.8px', marginBottom: '2px' }}>CURRENT RANK</p>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: accentColor, fontFamily: 'var(--font-display)' }} className="pulse-glow-gold">
                {currentRank}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'User ID',            value: user?.userId || '—', icon: User },
              { label: 'Member Since',        value: doj, icon: Calendar },
              { label: 'Team Business',       value: fmtFull(totalTeamBiz), icon: TrendingUp },
              { label: 'Current Reward',      value: currentRankObj?.reward || '—', icon: Award },
            ].map(({ label, value, icon: LabelIcon }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-grey)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LabelIcon size={12} style={{ color: 'var(--text-muted)' }} />
                  {label}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-white)' }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                <span>Progress to next rank</span>
                <span style={{ color: accentColor, fontWeight: 700 }}>{progressPct.toFixed(0)}%</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${accentColor}66, ${accentColor})`, borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Rank Progress */}
        <motion.div
          whileHover={hoverAnim}
          className="glass-card shifting-card"
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IconContainer icon={Target} color="var(--gold-primary)" size={18} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>Next Rank Progress</h3>
          </div>

          {nextRankObj ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: `${RANK_COLORS[nextRankObj.name]}0e`, border: `1px solid ${RANK_COLORS[nextRankObj.name]}33` }}>
                <IconContainer icon={nextRankObj.icon} color={RANK_COLORS[nextRankObj.name]} size={28} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>NEXT TARGET</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: RANK_COLORS[nextRankObj.name], fontFamily: 'var(--font-display)' }}>{nextRankObj.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>Reward: <strong style={{ color: '#34d399' }}>{nextRankObj.reward}</strong></p>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: '12px' }}>
                {[
                  { label: 'Current Team Business',  value: fmtFull(totalTeamBiz), color: '#34d399' },
                  { label: 'Required Team Business', value: fmtFull(nextRankObj.target), color: 'var(--gold-primary)' },
                  { label: 'Remaining Needed',       value: fmtFull(remaining), color: '#f87171' },
                  { label: 'Percentage Completed',   value: `${progressPct.toFixed(1)}%`, color: '#60a5fa' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
                    <p style={{ fontSize: '17px', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px' }}>
                  <span>{fmtFull(totalTeamBiz)}</span>
                  <span>{fmtFull(nextRankObj.target)}</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.3, ease: 'easeOut' }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${RANK_COLORS[nextRankObj.name]}77, ${RANK_COLORS[nextRankObj.name]})`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' }}
                  >
                    {progressPct > 10 && <span style={{ fontSize: '9px', fontWeight: 800, color: '#000' }}>{progressPct.toFixed(0)}%</span>}
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gold-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <IconContainer icon={Crown} color="var(--gold-primary)" size={32} />
              <p style={{ fontWeight: 700, fontSize: '16px' }}>Maximum Rank Achieved! 🎉</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Team Business Summary ── */}
      <motion.div
        whileHover={hoverAnim}
        className="glass-card shifting-card"
        style={{ padding: '28px' }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconContainer icon={Users} color="var(--gold-primary)" size={16} />
          Team Business Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Personal Business',   value: selfBiz,      color: '#d4af37', icon: Briefcase },
            { label: 'Left Team Business',  value: leftBiz,      color: '#60a5fa', icon: ArrowLeft },
            { label: 'Right Team Business', value: rightBiz,     color: '#a78bfa', icon: ArrowRight },
            { label: 'Total Team Business', value: totalTeamBiz, color: '#34d399', icon: Globe },
          ].map(({ label, value, color, icon: IconComponent }) => (
            <motion.div
              key={label}
              whileHover={{ y: -4, scale: 1.04, transition: { duration: 0.15 } }}
              style={{ padding: '18px 14px', borderRadius: '14px', background: `${color}0c`, border: `1px solid ${color}2e`, textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '46px', height: '46px', borderRadius: '50%', background: color, opacity: 0.09, filter: 'blur(12px)', pointerEvents: 'none' }} />
              <div style={{ marginBottom: '12px' }}>
                <IconContainer icon={IconComponent} color={color} size={18} />
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color, fontFamily: 'var(--font-display)' }}>{fmtFull(value)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Tabbed: Journey | History | Checklist ── */}
      <motion.div
        whileHover={hoverAnim}
        className="glass-card shifting-card"
        style={{ padding: '28px' }}
      >
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'journey',   label: 'Rank Journey'        },
            { id: 'history',   label: 'Reward History'      },
            { id: 'checklist', label: 'Qualification Check' },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                  background: active ? 'linear-gradient(135deg,#d4af37,#f3e5ab)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#0a0a0a' : 'var(--text-grey)',
                  border: active ? 'none' : '1px solid var(--border-grey)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Journey Table */}
            {activeTab === 'journey' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '580px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-grey)', color: 'var(--text-muted)' }}>
                      {['Rank', 'Team Business Required', 'Reward', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ranksWithStatus.filter(r => r.name !== 'Member').map((r, i) => {
                      const isCurrent = r.name === currentRank;
                      const isNext    = nextRankObj?.name === r.name;
                      const color     = RANK_COLORS[r.name];
                      return (
                        <motion.tr
                          key={r.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: isCurrent ? `${color}0d` : 'transparent', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.background = `${color}0f`}
                          onMouseLeave={e => e.currentTarget.style.background = isCurrent ? `${color}0d` : 'transparent'}
                        >
                          <td style={{ padding: '13px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                background: r.achieved ? `${color}14` : 'rgba(255,255,255,0.03)',
                                border: r.achieved ? `1px solid ${color}33` : '1px solid var(--border-grey)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: r.achieved ? color : 'var(--text-muted)'
                              }}>
                                <r.icon size={18} />
                              </div>
                              <div>
                                <span style={{ fontWeight: 700, color: r.achieved ? color : 'var(--text-muted)' }}>{r.name}</span>
                                {isCurrent && <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: `${color}22`, color, fontWeight: 700 }}>YOU</span>}
                                {isNext && <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', fontWeight: 700 }}>NEXT</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 14px', fontWeight: 700, color: r.achieved ? 'var(--text-white)' : 'var(--text-muted)' }}>{fmtFull(r.target)}</td>
                          <td style={{ padding: '13px 14px', color: r.achieved ? '#34d399' : 'var(--text-muted)' }}>{r.reward}</td>
                          <td style={{ padding: '13px 14px' }}>
                            {r.achieved ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                                <CheckCircle size={12} /> Achieved
                              </span>
                            ) : isNext ? (
                              <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                               ⏳ In Progress
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                                <Lock size={12} /> Locked
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reward History */}
            {activeTab === 'history' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '520px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-grey)', color: 'var(--text-muted)' }}>
                      {['Rank', 'Reward', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rewardHistory.map(r => (
                      <tr key={r.rank}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: RANK_COLORS[r.rank] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '6px',
                              background: `${RANK_COLORS[r.rank]}14`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: RANK_COLORS[r.rank]
                            }}>
                              <r.icon size={14} />
                            </div>
                            {r.rank}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-white)' }}>{r.reward}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                            background: r.status === 'Received' ? 'rgba(52,211,153,0.1)' : r.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                            color: r.status === 'Received' ? '#34d399' : r.status === 'Pending' ? '#f59e0b' : 'var(--text-muted)'
                          }}>
                            {r.status === 'Received' ? 'Received' : r.status === 'Pending' ? 'Pending' : 'Locked'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '12px' }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Checklist */}
            {activeTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {checklist.map(({ label, done }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '10px', background: done ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)', border: done ? '1px solid rgba(52,211,153,0.18)' : '1px solid var(--border-grey)' }}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', border: done ? '1.5px solid #34d399' : '1.5px solid var(--border-grey)' }}>
                      {done ? <CheckCircle size={14} color="#34d399" /> : <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-muted)' }} />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: done ? 'var(--text-white)' : 'var(--text-muted)', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: done ? '#34d399' : '#f87171' }}>{done ? 'Pass' : 'Pending'}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Chart + Motivation ── */}
      <div className="responsive-grid-16-1" style={{ gap: '24px', alignItems: 'stretch' }}>

        {/* Business Growth Chart */}
        <motion.div
          whileHover={hoverAnim}
          className="glass-card shifting-card"
          style={{ padding: '28px' }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={17} style={{ color: 'var(--gold-primary)' }} />
            Monthly Team Business Growth
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bizGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                labelStyle={{ color: '#d4af37', fontWeight: 700 }}
                formatter={(v) => [fmtFull(v), 'Team Business']}
              />
              <Area type="monotone" dataKey="business" stroke="#d4af37" strokeWidth={2.5} fill="url(#bizGrad)" dot={{ fill: '#d4af37', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Motivation Widget */}
        <motion.div
          whileHover={hoverAnim}
          className="glass-card shifting-card"
          style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', borderColor: 'var(--border-gold)' }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-primary)'
          }}>
            <Target size={32} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>You need only</p>
            <p style={{ fontSize: '26px', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-display)' }} className="pulse-glow-gold">
              {nextRankObj ? fmtFull(remaining) : '—'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '6px' }}>more Team Business to unlock</p>
          </div>

          {nextRankObj ? (
            <div style={{ padding: '14px 18px', borderRadius: '12px', background: `${RANK_COLORS[nextRankObj.name]}10`, border: `1px solid ${RANK_COLORS[nextRankObj.name]}30`, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${RANK_COLORS[nextRankObj.name]}14`, border: `1px solid ${RANK_COLORS[nextRankObj.name]}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: RANK_COLORS[nextRankObj.name]
              }}>
                <nextRankObj.icon size={20} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: RANK_COLORS[nextRankObj.name], fontFamily: 'var(--font-display)' }}>
                {nextRankObj.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-grey)' }}>and receive</p>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#34d399' }}>{nextRankObj.reward}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>👑 Maximum Rank Achieved!</p>
          )}
        </motion.div>
      </div>

      {/* ── Achievement Badges ── */}
      <motion.div
        whileHover={hoverAnim}
        className="glass-card shifting-card"
        style={{ padding: '28px' }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={17} style={{ color: 'var(--gold-primary)' }} />
          Achievement Badges
        </h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {ranksWithStatus.filter(r => r.name !== 'Member').map((r, i) => {
            const unlocked = r.achieved;
            const isCur    = r.name === currentRank;
            const color    = RANK_COLORS[r.name];
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 220 }}
                whileHover={{ y: -8, scale: 1.12, transition: { duration: 0.15 } }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'default' }}
                title={unlocked ? `${r.name} — ${r.reward}` : 'Locked'}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: unlocked ? `radial-gradient(circle, ${color}2e, ${color}0d)` : 'rgba(255,255,255,0.03)',
                  border: unlocked ? `2px solid ${color}88` : '2px solid var(--border-grey)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: unlocked ? color : 'var(--text-muted)',
                  boxShadow: isCur ? `0 0 18px ${color}55` : unlocked ? `0 0 8px ${color}22` : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}>
                  <r.icon size={26} />
                  {isCur && (
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)' }}>
                      <Crown size={10} color="#000" />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: unlocked ? color : 'var(--text-muted)', textAlign: 'center', maxWidth: '68px' }}>{r.name}</span>
                {!unlocked && <Lock size={10} color="var(--text-muted)" />}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Rank Rules ── */}
      <motion.div
        whileHover={hoverAnim}
        className="glass-card shifting-card"
        style={{ padding: '28px' }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={17} style={{ color: 'var(--gold-primary)' }} />
          Rank Rules &amp; Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {[
            { icon: BarChart2, title: 'How Ranks are Calculated', text: 'Ranks are determined by your total Team Business — the sum of all business generated by your left and right team members combined.', color: '#3b82f6' },
            { icon: Target, title: 'Metric Used', text: 'Team Business = Left Leg Volume + Right Leg Volume. Personal investments also contribute to your self-business score.', color: '#10b981' },
            { icon: Calendar, title: 'When Rewards are Credited', text: 'Rank rewards are credited to your Profit Wallet within 7 working days of qualification verification by the admin team.', color: '#f59e0b' },
            { icon: RefreshCw, title: 'One-Time or Recurring?', text: 'Rank rewards are one-time milestone awards. Once you achieve a rank, the reward is yours permanently — ranks do not reset.', color: '#ec4899' },
          ].map(({ icon: RuleIcon, title, text, color }) => (
            <div key={title} style={{ padding: '20px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${color}14`, border: `1px solid ${color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color
              }}>
                <RuleIcon size={20} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-white)', marginBottom: '6px' }}>{title}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', lineHeight: 1.6 }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
