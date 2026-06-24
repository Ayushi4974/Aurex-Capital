import React, { useState } from 'react';
import { Play, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { dbRunDailyROICron, dbRunDailyBinaryCron } from '../utils/simDb';
import { motion } from 'framer-motion';

export default function RoiManagement() {
  const [logs, setLogs] = useState([
    { event: 'Daily ROI Scheduler completed', info: 'Distributed $1,250.00 to 4 staker accounts', status: 'Success', time: '2026-06-20 01:00 AM' },
    { event: 'Binary Leg matching executed', info: 'Offsets matched: 2, total paid out: $500.00', status: 'Success', time: '2026-06-20 01:15 AM' }
  ]);

  const handleRunROI = () => {
    try {
      const res = dbRunDailyROICron();
      const newLog = {
        event: 'Daily ROI Manual trigger executed',
        info: `Paid out: $${res.totalDistributed} to ${res.paidCount} stakes.`,
        status: 'Success',
        time: new Date().toLocaleTimeString()
      };
      setLogs([newLog, ...logs]);
      alert(`Cron Executed! Paid out: $${res.totalDistributed} to ${res.paidCount} stakers.`);
    } catch (err) {
      alert(`ROI distribution failed: ${err.message}`);
    }
  };

  const handleRunBinary = () => {
    try {
      const res = dbRunDailyBinaryCron();
      const newLog = {
        event: 'Binary Matching Manual trigger executed',
        info: `Matches found: ${res.matchesCount}, Matching payout: $${res.totalPaid}`,
        status: 'Success',
        time: new Date().toLocaleTimeString()
      };
      setLogs([newLog, ...logs]);
      alert(`Cron Executed! Matches: ${res.matchesCount}. Total Paid: $${res.totalPaid}`);
    } catch (err) {
      alert(`Binary matching failed: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          ROI & Commissions <span className="gold-text-gradient">Management</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Trigger cron jobs for Slab ROI daily calculations and Binary leg offset checks
        </p>
      </motion.div>

      {/* Control Triggers */}
      <div className="responsive-grid-2" style={{ gap: '24px' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: '0 16px 36px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Cpu size={24} style={{ color: 'var(--gold-primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Daily ROI Plan Cron</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.5 }}>
            Calculates daily ROI percentages according to active investment slab ranges ($100-$100k) and deposits rewards into stakers ProTok Profit pools.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunROI}
            className="btn btn-primary"
            style={{ padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
          >
            <Play size={14} />
            Execute Daily ROI
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: '0 16px 36px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Cpu size={24} style={{ color: 'var(--gold-primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Binary Leg Match Cron</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.5 }}>
            Matches accumulative Left Leg Business and Right Leg Business volumes, pays 10% matched rewards, and carries forward left-over balances.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(212,175,55,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunBinary}
            className="btn btn-primary"
            style={{ padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}
          >
            <Play size={14} />
            Execute Binary Matching
          </motion.button>
        </motion.div>
      </div>

      {/* Logs registry */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} style={{ color: 'var(--gold-primary)' }} />
          Calculations Cron Execution Audit Logs
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 5, borderColor: 'rgba(212,175,55,0.2)', transition: { duration: 0.15 } }}
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
            >
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.time}</span>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>{log.event}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>{log.info}</p>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                {log.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
