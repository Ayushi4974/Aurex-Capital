import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { DollarSign, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminWithdrawals({ isLiveMode, onRefreshUser, refreshTrigger }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      const list = await api.adminGetWithdrawals(isLiveMode);
      setWithdrawals(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [isLiveMode, refreshTrigger]);

  const handleProcess = async (txId, status) => {
    setLoading(true);
    try {
      await api.adminProcessWithdrawal(txId, status, isLiveMode);
      alert(`Withdrawal request ${status === 'Completed' ? 'approved' : 'rejected'}.`);
      fetchWithdrawals();
      onRefreshUser();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Withdrawal <span className="gold-text-gradient">Approvals Audits</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Review pending reward release tickets and process payouts
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={20} style={{ color: 'var(--gold-primary)' }} />
          Pending Payout Tickets ({withdrawals.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>TX ID</th>
                <th style={{ padding: '12px 6px' }}>User ID</th>
                <th style={{ padding: '12px 6px' }}>Requested Amount</th>
                <th style={{ padding: '12px 6px' }}>Status</th>
                <th style={{ padding: '12px 6px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pending cashout tickets found.
                  </td>
                </tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 6px', fontWeight: 600 }}>{w.id}</td>
                    <td style={{ padding: '12px 6px', fontWeight: 600 }}>{w.userId}</td>
                    <td style={{ padding: '12px 6px', fontWeight: 700, color: '#f59e0b' }}>
                      ${w.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 6px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{w.status}</span>
                    </td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleProcess(w.id, 'Completed')}
                        disabled={loading}
                        style={{
                          background: '#10b981',
                          border: 'none',
                          color: 'black',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <Check size={14} />
                        Release Funds
                      </button>
                      <button
                        onClick={() => handleProcess(w.id, 'Rejected')}
                        disabled={loading}
                        style={{
                          background: '#ef4444',
                          border: 'none',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        <X size={14} />
                        Reject
                      </button>
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
