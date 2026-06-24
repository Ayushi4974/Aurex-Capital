import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TrendingUp, RefreshCw, Layers, ArrowLeftRight, BarChart2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Business({ user, isLiveMode, refreshTrigger }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
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
  const totalVolume = left + right;

  const iconBox = (Icon, color, bg) => (
    <div style={{
      width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 12px ${color}22`, flexShrink: 0
    }}>
      <Icon size={20} style={{ color }} />
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(212,175,55,0.15)'
        }}>
          <ArrowLeftRight size={26} style={{ color: 'var(--gold-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            Business &amp; <span className="gold-text-gradient">Leg Matching Stats</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Track active volumes on Left/Right leg channels, carries, and matching distributions
          </p>
        </div>
      </div>

      {/* Matching telemetry grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

        {[
          {
            icon: BarChart2, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',
            label: 'LEFT LEG VOLUME', value: `$${left.toLocaleString()}`,
            sub: 'Carried forward to next matching', subColor: 'var(--text-muted)',
            borderColor: '#60a5fa'
          },
          {
            icon: BarChart2, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)',
            label: 'RIGHT LEG VOLUME', value: `$${right.toLocaleString()}`,
            sub: 'Carried forward to next matching', subColor: 'var(--text-muted)',
            borderColor: '#a78bfa'
          },
          {
            icon: RefreshCw, color: 'var(--gold-primary)', bg: 'rgba(212,175,55,0.08)',
            label: 'PENDING MATCH PROJECTED', value: `$${matched.toLocaleString()}`,
            sub: `Estimated Reward: $${potentialMatchingReward.toLocaleString()} (10%)`, subColor: '#34d399',
            borderColor: 'var(--gold-primary)'
          },
          {
            icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.08)',
            label: 'COMBINED TEAM VOLUME', value: `$${totalVolume.toLocaleString()}`,
            sub: 'Total of both legs', subColor: 'var(--text-muted)',
            borderColor: '#34d399'
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -8, scale: 1.03, boxShadow: `0 16px 36px ${s.color}22`, transition: { duration: 0.2 } }}
            className="glass-card shifting-card"
            style={{ padding: '22px', borderLeft: `3px solid ${s.borderColor}`, display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {iconBox(s.icon, s.color, s.bg)}
              <span style={{ fontSize: '10px', color: 'var(--text-grey)', fontWeight: 700 }}>{s.label}</span>
            </div>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: s.color }}>{s.value}</h2>
              <p style={{ fontSize: '11px', color: s.subColor, marginTop: '4px', fontWeight: s.subColor !== 'var(--text-muted)' ? 600 : 400 }}>{s.sub}</p>
            </div>
          </motion.div>
        ))}
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
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', flexShrink: 0
          }}>
            <Layers size={16} style={{ color: 'var(--gold-primary)' }} />
          </div>
          Binary Matching History Logs ({history.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px' }}>Log ID</th>
                <th style={{ padding: '10px 8px' }}>Earning Amount</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px' }}>Matching Description</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Calculated At</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No binary match transactions recorded. Payout runs nightly at 1:00 AM.
                  </td>
                </tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, fontSize: '12px', color: 'var(--text-muted)' }}>{h.id}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#34d399' }}>
                      +${h.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.08)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(52,211,153,0.2)' }}>
                        <CheckCircle size={10} />
                        {h.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-grey)' }}>{h.description}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-muted)' }}>
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
