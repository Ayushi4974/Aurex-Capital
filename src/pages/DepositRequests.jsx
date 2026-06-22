import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Landmark, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DepositRequests({ isLiveMode, onRefreshUser, refreshTrigger }) {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = async () => {
    try {
      const list = await api.adminGetDeposits(isLiveMode);
      setDeposits(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [isLiveMode, refreshTrigger]);

  const handleApprove = async (txId) => {
    setLoading(true);
    try {
      await api.adminApproveDeposit(txId, isLiveMode);
      alert('Deposit approved! CapTok Main updated.');
      fetchDeposits();
      onRefreshUser();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (txId) => {
    const comment = window.prompt('Enter rejection comment (optional):');
    if (comment === null) return; // user cancelled prompt

    setLoading(true);
    try {
      await api.adminRejectDeposit(txId, isLiveMode);
      alert('Deposit request rejected.');
      fetchDeposits();
    } catch (err) {
      alert(err.message || 'Rejection failed');
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
          Deposit <span className="gold-text-gradient">Requests Review</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Audit manual balance uploads, review bank slips, and credit CapTok Main values
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
          <Landmark size={20} style={{ color: 'var(--gold-primary)' }} />
          Pending Deposits Tickets ({deposits.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>TX ID</th>
                <th style={{ padding: '12px 6px' }}>User ID</th>
                <th style={{ padding: '12px 6px' }}>Deposit Amount</th>
                <th style={{ padding: '12px 6px' }}>Narrative</th>
                <th style={{ padding: '12px 6px' }}>Status</th>
                <th style={{ padding: '12px 6px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No deposit requests are currently pending review.
                  </td>
                </tr>
              ) : (
                deposits.map(dep => (
                  <tr key={dep.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px 6px', fontWeight: 600 }}>{dep.id}</td>
                    <td style={{ padding: '12px 6px', fontWeight: 600 }}>{dep.userId}</td>
                    <td style={{ padding: '12px 6px', fontWeight: 700, color: '#34d399' }}>
                      ${dep.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 6px', color: 'var(--text-grey)' }}>{dep.description}</td>
                    <td style={{ padding: '12px 6px' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{dep.status}</span>
                    </td>
                    <td style={{ padding: '12px 6px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleApprove(dep.id)}
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
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(dep.id)}
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
