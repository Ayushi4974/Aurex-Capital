import React from 'react';
import { ShieldAlert, List } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuditLogsAdmin() {
  const logs = [
    { id: 'AUD_701', action: 'Admin Payout Approved', desc: 'Approved withdrawal request of $100.00 for user IVA100002', user: 'Admin (IVA100001)', date: '2026-06-20 02:40 PM' },
    { id: 'AUD_702', action: 'Daily ROI Cron Trigger', desc: 'Executed manually by admin', user: 'Admin (IVA100001)', date: '2026-06-20 01:10 PM' },
    { id: 'AUD_703', action: 'Staker Account Locked', desc: 'Locked node accounts status for user IVA100006', user: 'Admin (IVA100001)', date: '2026-06-19 11:30 AM' },
    { id: 'AUD_704', action: 'Deposit Approved', desc: 'Approved $5,000.00 manual deposit request for user IVA100002', user: 'Admin (IVA100001)', date: '2026-06-18 04:00 PM' }
  ];

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Audit & Activity <span className="gold-text-gradient">Logs</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Trace administrative overrides, cron calculator details, and account configuration logs
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
          <List size={18} style={{ color: 'var(--gold-primary)' }} />
          Admin Activity Ledger ({logs.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ x: 6, borderColor: 'rgba(212,175,55,0.2)', transition: { duration: 0.15 } }}
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
            >
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.date}</span>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>{log.action}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>{log.desc}</p>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 600 }}>
                {log.user}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
