import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReferralTeamReports() {
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    { userId: 'IVA100002', name: 'Alex Mercer', sponsors: 2, totalTeam: 2, leftBusiness: 1000, rightBusiness: 1500, selfStaked: 2000 },
    { userId: 'IVA100003', name: 'Sarah Connor', sponsors: 2, totalTeam: 2, leftBusiness: 800, rightBusiness: 1200, selfStaked: 1500 },
    { userId: 'IVA100004', name: 'John Doe', sponsors: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0, selfStaked: 1000 },
    { userId: 'IVA100007', name: 'Diana Prince', sponsors: 0, totalTeam: 0, leftBusiness: 0, rightBusiness: 0, selfStaked: 1200 }
  ];

  const filteredReports = reports.filter(r =>
    r.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Referral & Team <span className="gold-text-gradient">Reports</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Audit team business volumes, personal active stakings, and direct referrals connections across the MLM tree
        </p>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
        style={{ display: 'flex', gap: '12px' }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search reports by User ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,175,55,0.1)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--gold-primary)' }} />
          Network Volumes Directory ({filteredReports.length})
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 6px' }}>USER ID</th>
                <th style={{ padding: '12px 6px' }}>FULL NAME</th>
                <th style={{ padding: '12px 6px' }}>DIRECT SPONSORS</th>
                <th style={{ padding: '12px 6px' }}>TOTAL TEAM SIZE</th>
                <th style={{ padding: '12px 6px' }}>SELF STAKED</th>
                <th style={{ padding: '12px 6px' }}>LEFT LEG VOL</th>
                <th style={{ padding: '12px 6px' }}>RIGHT LEG VOL</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, i) => (
                <motion.tr
                  key={r.userId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ background: 'rgba(212,175,55,0.03)' }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  <td style={{ padding: '12px 6px', fontWeight: 600, color: 'var(--gold-primary)' }}>{r.userId}</td>
                  <td style={{ padding: '12px 6px', fontWeight: 600 }}>{r.name}</td>
                  <td style={{ padding: '12px 6px' }}>{r.sponsors} Users</td>
                  <td style={{ padding: '12px 6px' }}>{r.totalTeam} Members</td>
                  <td style={{ padding: '12px 6px', fontWeight: 700 }}>${r.selfStaked.toLocaleString()}</td>
                  <td style={{ padding: '12px 6px', color: 'var(--text-grey)' }}>${r.leftBusiness.toLocaleString()}</td>
                  <td style={{ padding: '12px 6px', color: 'var(--text-grey)' }}>${r.rightBusiness.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
