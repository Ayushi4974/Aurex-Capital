import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar, DollarSign, Activity, Percent, Users, Coins, Trophy, Gem, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';

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
    { id: 'ALL', label: 'All Rewards' },
    { id: 'ROI', label: 'Daily ROI' },
    { id: 'DirectReward', label: 'Direct Referral' },
    { id: 'LevelReward', label: 'Level Income' },
    { id: 'FastTrackReward', label: 'FastTrack' },
    { id: 'PoolReward', label: 'Pool Reward' },
    { id: 'RankReward', label: 'Rank Reward' },
    { id: 'LoyaltyReward', label: 'Loyalty Dividend' },
    { id: 'BinaryReward', label: 'Binary Matching' }
  ];

  // Helper to get total sum by transaction type
  const getSumByType = (types) => {
    return transactions
      .filter(tx => types.includes(tx.type) && tx.status === 'Completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

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
      return [
        'ROI', 'DirectReward', 'LevelReward', 'FastTrackReward', 
        'PoolReward', 'RankReward', 'LoyaltyReward', 'BinaryReward'
      ].includes(t.type);
    }
    return t.type === activeTab;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Earnings & <span className="gold-text-gradient">Rewards Ledger</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Audit all daily ROI disbursements, affiliate direct & level commissions, and leadership bonus milestones.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <motion.div 
          whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', borderLeft: '3px solid var(--gold-primary)' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>TOTAL ACCUMULATED EARNINGS</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--text-white)' }}>
            ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>
        <motion.div 
          whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', borderLeft: '3px solid #ef4444' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>TOTAL SUCCESSFUL WITHDRAWN</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            ${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>
        <motion.div 
          whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', borderLeft: '3px solid #10b981' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>REMAINING WITHDRAWABLE REWARDS</span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            ${remainingWithdrawable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </motion.div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', 
        background: 'rgba(0,0,0,0.3)', 
        padding: '6px', 
        borderRadius: '10px',
        border: '1px solid var(--border-grey)', 
        gap: '6px', 
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              fontSize: '12px', 
              fontWeight: 600,
              background: activeTab === tab.id ? 'var(--gold-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--bg-black)' : 'var(--text-grey)', 
              cursor: 'pointer', 
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Earnings logs */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gift size={20} style={{ color: 'var(--gold-primary)' }} />
          Commission Ledger ({filteredLogs.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>TX ID</th>
                <th style={{ padding: '12px 6px' }}>Income Category</th>
                <th style={{ padding: '12px 6px' }}>Credited Amount</th>
                <th style={{ padding: '12px 6px' }}>Status</th>
                <th style={{ padding: '12px 6px' }}>Description / Narrative</th>
                <th style={{ padding: '12px 6px', textAlign: 'right' }}>Credited Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading commission history ledger...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching reward logs recorded under this category yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 6px', fontWeight: 600 }}>{log.id}</td>
                    <td style={{ padding: '12px 6px' }}>
                      <span style={{
                        fontSize: '11px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontWeight: 700,
                        background: log.type === 'ROI' ? 'rgba(212,175,55,0.1)' : 'rgba(59,130,246,0.1)',
                        color: log.type === 'ROI' ? 'var(--gold-primary)' : '#60a5fa'
                      }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 6px', fontWeight: 700, color: '#34d399' }}>
                      +${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 6px' }}>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>{log.status}</span>
                    </td>
                    <td style={{ padding: '12px 6px', color: 'var(--text-grey)' }}>{log.description}</td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
