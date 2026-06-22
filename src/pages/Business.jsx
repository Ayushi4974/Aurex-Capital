import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Business({ user, isLiveMode, refreshTrigger }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch user matching binary logs from transactions
    const fetchHistory = async () => {
      try {
        const txs = await api.getTransactions(user.userId, isLiveMode);
        setHistory(txs.filter(t => t.type === 'BinaryReward'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const left = user.business.leftBusiness;
  const right = user.business.rightBusiness;
  const matched = Math.min(left, right);
  const potentialMatchingReward = matched * 0.10;

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Business & <span className="gold-text-gradient">Leg Matching Stats</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Track active volumes on Left/Right leg channels, carries, and matching distributions
        </p>
      </motion.div>

      {/* Matching telemetry grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.03, boxShadow: '0 16px 36px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '24px', borderLeft: '3px solid var(--gold-primary)' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>LEFT LEG UNMATCHED VOLUME</span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>${left.toLocaleString()}</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Carried forward to next matching</p>
        </motion.div>

        {/* Right volume */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.03, boxShadow: '0 16px 36px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '24px', borderLeft: '3px solid var(--gold-primary)' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>RIGHT LEG UNMATCHED VOLUME</span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>${right.toLocaleString()}</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Carried forward to next matching</p>
        </motion.div>

        {/* Match projection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.03, boxShadow: '0 16px 36px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '24px', borderLeft: '3px solid var(--gold-primary)' }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>PENDING MATCH PROJECTED</span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--gold-primary)' }}>${matched.toLocaleString()}</h2>
          <p style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Estimated Reward: ${potentialMatchingReward.toLocaleString()} (10%)</p>
        </motion.div>

      </div>

      {/* Matching History */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35 }}
        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--gold-primary)' }} />
          Binary Matching History Logs ({history.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 4px' }}>Log ID</th>
                <th style={{ padding: '10px 4px' }}>Earning Amount</th>
                <th style={{ padding: '10px 4px' }}>Status</th>
                <th style={{ padding: '10px 4px' }}>Matching Description</th>
                <th style={{ padding: '10px 4px', textAlign: 'right' }}>Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No binary match transactions recorded. Payout runs nightly at 1:00 AM.
                  </td>
                </tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px 4px', fontWeight: 600 }}>{h.id}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700, color: '#34d399' }}>
                      +${h.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 4px', color: '#34d399', fontWeight: 600 }}>{h.status}</td>
                    <td style={{ padding: '10px 4px', color: 'var(--text-grey)' }}>{h.description}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {new Date(h.createdAt).toLocaleDateString()}
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
