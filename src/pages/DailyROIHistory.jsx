import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Wallet, ListFilter, ArrowDownLeft, Clock, Coins, TrendingUp, Sparkles, Activity, Award } from 'lucide-react';
import { api } from '../utils/api';

const iconBox = (Icon, color, bg) => (
  <div style={{
    width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 12px ${color}22`, flexShrink: 0
  }}>
    <Icon size={20} style={{ color }} />
  </div>
);

export default function DailyROIHistory({ user, isLiveMode, refreshTrigger }) {
  const [roiLogs, setRoiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Filters
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, today, weekly, monthly, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchRoiLogs = async () => {
      try {
        setLoading(true);
        const txs = await api.getTransactions(user.userId, isLiveMode) || [];
        // Filter transactions to show ROI payouts
        const filtered = txs.filter(t => t.type === 'ROI');
        setRoiLogs(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoiLogs();
  }, [user.userId, isLiveMode, refreshTrigger]);

  // Sort chronologically (oldest first) to calculate running totals
  const sortedRoiLogs = [...roiLogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  let accumulator = 0;
  
  const logsWithRunningTotal = sortedRoiLogs.map(log => {
    accumulator += log.amount;
    
    // Extract ROI % if possible from description (e.g., "Daily ROI payout (0.75%)")
    const matchPercent = log.description.match(/(\d+\.?\d*)%/);
    const roiPercentage = matchPercent ? `${matchPercent[1]}%` : '0.75%';
    
    // Deduce package name based on ROI rate
    const rate = parseFloat(roiPercentage);
    let packageName = 'Nexus Elite';
    if (rate === 0.25) packageName = 'Nexus Start';
    else if (rate === 0.50) packageName = 'Nexus Pro';
    else if (rate === 0.75) packageName = 'Nexus Elite';
    else if (rate === 1.00) packageName = 'Nexus Titan';
    else if (rate === 2.00) packageName = 'Nexus Infinity';

    return {
      ...log,
      roiPercentage,
      packageName,
      runningTotal: accumulator
    };
  }).reverse(); // Display newest first in UI

  const filteredLogs = logsWithRunningTotal.filter(log => {
    const virtualDateStr = localStorage.getItem('aurex_virtual_date');
    const today = virtualDateStr ? new Date(virtualDateStr) : new Date();
    const logDate = new Date(log.createdAt);

    if (dateFilter === 'today') {
      return logDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'weekly') {
      const diffTime = Math.abs(today - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } else if (dateFilter === 'monthly') {
      const diffTime = Math.abs(today - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    } else if (dateFilter === 'custom') {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return logDate >= start && logDate <= end;
    }
    return true;
  });

  const totalROI = roiLogs.reduce((sum, log) => sum + log.amount, 0);

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Daily ROI <span className="gold-text-gradient">History Logs</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Monitor daily reward releases from your active investment stakes slabs with chronological running balance calculations.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <motion.div 
          whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid var(--gold-primary)' }}
        >
          {iconBox(Coins, 'var(--gold-primary)', 'rgba(212,175,55,0.08)')}
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 750, letterSpacing: '0.5px' }}>TODAY'S ROI REWARD</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--gold-primary)', fontFamily: 'var(--font-display)' }} className="gold-sheen-text">
              ${roiLogs.length > 0 ? roiLogs[roiLogs.length - 1].amount.toFixed(2) : '0.00'}
            </h3>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid #34d399' }}
        >
          {iconBox(TrendingUp, '#34d399', 'rgba(52,211,153,0.08)')}
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 755, letterSpacing: '0.5px' }}>CUMULATIVE ROI COLLECTED</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#34d399', fontFamily: 'var(--font-display)' }}>
              ${totalROI.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* ROI List Table & Filters */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '24px' }}
      >
        
        {/* Filters and Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--gold-primary)' }} />
            ROI Payouts Log ({filteredLogs.length})
          </h3>

          {/* Quick Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px', gap: '4px' }}>
              {[
                { id: 'ALL', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'custom', label: 'Custom Range' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setDateFilter(filter.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: dateFilter === filter.id ? 'var(--gold-primary)' : 'transparent',
                    color: dateFilter === filter.id ? 'var(--bg-black)' : 'var(--text-grey)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Date Picker Fields */}
        <AnimatePresence>
          {dateFilter === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-grey)',
                borderRadius: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>START DATE</label>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => setCustomStart(e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: '12px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>END DATE</label>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.value)} 
                  className="form-input" 
                  style={{ fontSize: '12px' }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>Date</th>
                <th style={{ padding: '12px 6px' }}>Package</th>
                <th style={{ padding: '12px 6px' }}>ROI Rate</th>
                <th style={{ padding: '12px 6px' }}>Amount</th>
                <th style={{ padding: '12px 6px' }}>Status</th>
                <th style={{ padding: '12px 6px', textAlign: 'right' }}>Running Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading ROI logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No ROI rewards payouts logged matching filters. Start a stake to earn daily returns!
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr 
                    key={log.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 10px', color: 'var(--text-grey)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 600 }}>{log.packageName}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 650, color: 'var(--gold-primary)' }}>{log.roiPercentage}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#34d399' }}>
                      +${log.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '2.5px 7px',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.08)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.15)'
                      }} className="status-pill-pulse">
                        COMPLETED
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--gold-primary)' }}>
                      ${log.runningTotal.toFixed(2)}
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
