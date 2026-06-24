import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, DollarSign, Activity, Percent, Users, Coins, Trophy, TrendingUp, TrendingDown, Wallet, Zap, Star, BarChart2 } from 'lucide-react';
import { api } from '../utils/api';

const TYPE_META = {
  ROI:           { color: '#d4af37', bg: 'rgba(212,175,55,0.08)',  icon: Percent,     label: 'Daily ROI' },
  DirectReward:  { color: '#34d399', bg: 'rgba(52,211,153,0.08)', icon: Users,        label: 'Direct Referral' },
  LevelReward:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', icon: Activity,     label: 'Level Income' },
  FastTrackReward:{ color: '#f472b6', bg: 'rgba(244,114,182,0.08)', icon: Zap,        label: 'FastTrack' },
  PoolReward:    { color: '#818cf8', bg: 'rgba(129,140,248,0.08)', icon: Coins,        label: 'Pool Reward' },
  RankReward:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', icon: Trophy,        label: 'Rank Reward' },
  LoyaltyReward: { color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', icon: Star,         label: 'Loyalty Dividend' },
  BinaryReward:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', icon: TrendingUp,  label: 'Binary Matching' },
};

export default function EarningsHistory({ user, isLiveMode, refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const txs = await api.getTransactions(user.userId, isLiveMode) || [];
        setTransactions(txs.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const tabs = [
    { id: 'ALL',            label: 'All Rewards',      icon: BarChart2 },
    { id: 'ROI',            label: 'Daily ROI',        icon: Percent },
    { id: 'DirectReward',   label: 'Direct Referral',  icon: Users },
    { id: 'LevelReward',    label: 'Level Income',     icon: Activity },
    { id: 'FastTrackReward',label: 'FastTrack',        icon: Zap },
    { id: 'PoolReward',     label: 'Pool Reward',      icon: Coins },
    { id: 'RankReward',     label: 'Rank Reward',      icon: Trophy },
    { id: 'LoyaltyReward',  label: 'Loyalty',          icon: Star },
    { id: 'BinaryReward',   label: 'Binary Matching',  icon: TrendingUp }
  ];

  const getSumByType = (types) => transactions
    .filter(tx => types.includes(tx.type) && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalEarnings = getSumByType([
    'ROI', 'DirectReward', 'LevelReward', 'FastTrackReward',
    'PoolReward', 'RankReward', 'LoyaltyReward', 'BinaryReward'
  ]);

  const totalWithdrawn = transactions
    .filter(tx => tx.type === 'Withdrawal' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingWithdrawable = user.wallet?.protok?.profit || 0;

  const filteredLogs = transactions.filter(t => {
    if (activeTab === 'ALL') {
      return ['ROI', 'DirectReward', 'LevelReward', 'FastTrackReward',
        'PoolReward', 'RankReward', 'LoyaltyReward', 'BinaryReward'].includes(t.type);
    }
    return t.type === activeTab;
  });

  const iconBox = (Icon, color, bg, size = 18) => (
    <div style={{
      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 10px ${color}22`, flexShrink: 0
    }}>
      <Icon size={size} style={{ color }} />
    </div>
  );

  const getMeta = (type) => TYPE_META[type] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', icon: Gift, label: type };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(212,175,55,0.15)'
        }}>
          <Gift size={26} style={{ color: 'var(--gold-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            Earnings &amp; <span className="gold-text-gradient">Rewards Ledger</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Audit all daily ROI disbursements, affiliate direct &amp; level commissions, and leadership bonus milestones.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[
          { label: 'TOTAL ACCUMULATED EARNINGS', value: totalEarnings, icon: TrendingUp, color: 'var(--gold-primary)', bg: 'rgba(212,175,55,0.08)', textColor: 'var(--gold-primary)' },
          { label: 'TOTAL SUCCESSFUL WITHDRAWN', value: totalWithdrawn, icon: TrendingDown, color: '#f87171', bg: 'rgba(248,113,113,0.08)', textColor: '#f87171' },
          { label: 'REMAINING WITHDRAWABLE', value: remainingWithdrawable, icon: Wallet, color: '#34d399', bg: 'rgba(52,211,153,0.08)', textColor: '#34d399' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '20px', borderLeft: `3px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            {iconBox(s.icon, s.color, s.bg)}
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-grey)', fontWeight: 700 }}>{s.label}</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: s.textColor }}>
                ${s.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'var(--input-bg)', padding: '6px', borderRadius: '12px',
        border: '1px solid var(--border-grey)', gap: '4px', flexWrap: 'wrap'
      }}>
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600,
                background: isActive ? 'var(--gold-primary)' : 'transparent',
                color: isActive ? 'var(--bg-black)' : 'var(--text-grey)',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              <TabIcon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Earnings logs */}
      <motion.div
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {iconBox(Gift, 'var(--gold-primary)', 'rgba(212,175,55,0.08)')}
          Commission Ledger ({filteredLogs.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>TX ID</th>
                <th style={{ padding: '12px 8px' }}>Income Category</th>
                <th style={{ padding: '12px 8px' }}>Credited Amount</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Description / Narrative</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Credited Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading commission history ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching reward logs recorded under this category yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const meta = getMeta(log.type);
                  const MetaIcon = meta.icon;
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, fontSize: '12px', color: 'var(--text-muted)' }}>{log.id}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '11px', padding: '3px 9px', borderRadius: '20px', fontWeight: 700,
                          background: meta.bg, color: meta.color,
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          border: `1px solid ${meta.color}33`
                        }}>
                          <MetaIcon size={11} />
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#34d399' }}>
                        +${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: '12px' }}>{log.status}</span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-grey)' }}>{log.description}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
