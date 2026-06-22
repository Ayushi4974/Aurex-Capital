import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Users, ListFilter, ArrowDownLeft } from 'lucide-react';
import { api } from '../utils/api';

export default function LevelIncome({ user, isLiveMode, refreshTrigger }) {
  const [levelLogs, setLevelLogs] = useState([]);
  const [activeLevelTab, setActiveLevelTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevelLogs = async () => {
      try {
        setLoading(true);
        const txs = await api.getTransactions(user.userId, isLiveMode) || [];
        // Filter transactions to show direct commissions
        const filtered = txs.filter(t => t.type === 'DirectReward').reverse();
        setLevelLogs(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLevelLogs();
  }, [user.userId, isLiveMode, refreshTrigger]);

  // Extract level number from transaction description (e.g. "Level 1" -> Level 1)
  const getLevel = (desc) => {
    if (desc.includes('Level 1')) return 1;
    if (desc.includes('Level 2')) return 2;
    if (desc.includes('Level 3')) return 3;
    if (desc.includes('Level 4')) return 4;
    if (desc.includes('Level 5')) return 5;
    return 1;
  };

  const filteredLogs = levelLogs.filter(log => {
    if (activeLevelTab === 'All') return true;
    return getLevel(log.description) === parseInt(activeLevelTab);
  });

  const totalCommissions = filteredLogs.reduce((sum, log) => sum + log.amount, 0);

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Level Generation <span className="gold-text-gradient">Commissions</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Audit unilevel commissions earned from stakers up to 5 sponsor generations deep
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '10px',
        border: '1px solid var(--border-grey)', gap: '8px', maxWidth: '600px', flexWrap: 'wrap'
      }}>
        {['All', '1', '2', '3', '4', '5'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setActiveLevelTab(lvl)}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600,
              background: activeLevelTab === lvl ? 'linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))' : 'transparent',
              color: activeLevelTab === lvl ? 'var(--bg-black)' : 'var(--text-grey)', cursor: 'pointer'
            }}
          >
            {lvl === 'All' ? 'Show All' : `Lvl ${lvl}`}
          </button>
        ))}
      </div>

      {/* Level list */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--gold-primary)' }} />
          Level Commissions Log ({filteredLogs.length})
          <span style={{ fontSize: '12px', color: 'var(--gold-primary)', marginLeft: 'auto' }}>
            Filtered Total: ${totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>TX ID</th>
                <th style={{ padding: '12px 6px' }}>Level</th>
                <th style={{ padding: '12px 6px' }}>Commission Yield</th>
                <th style={{ padding: '12px 6px' }}>Commission Status</th>
                <th style={{ padding: '12px 6px' }}>Narrative</th>
                <th style={{ padding: '12px 6px', textAlign: 'right' }}>Credited Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading Level details...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No unilevel team commissions recorded under selected level yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const lvl = getLevel(log.description);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px 6px', fontWeight: 600 }}>{log.id}</td>
                      <td style={{ padding: '12px 6px' }}>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700,
                          background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)'
                        }}>
                          Level {lvl}
                        </span>
                      </td>
                      <td style={{ padding: '12px 6px', fontWeight: 700, color: '#34d399' }}>
                        +${log.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 6px' }}>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>Completed</span>
                      </td>
                      <td style={{ padding: '12px 6px', color: 'var(--text-grey)' }}>{log.description}</td>
                      <td style={{ padding: '12px 6px', textAlign: 'right', color: 'var(--text-muted)' }}>
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
