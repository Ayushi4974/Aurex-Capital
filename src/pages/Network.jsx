import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Users, Calendar, Award, Copy, Check, QrCode, Layers, UserCheck, UserX, ChevronRight } from 'lucide-react';

export default function Network({ user, isLiveMode, refreshTrigger }) {
  const [team, setTeam] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeLevelTab, setActiveLevelTab] = useState(1);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchDirectTeam = async () => {
      try {
        const t = await api.getDirectTeam(user.userId, isLiveMode);
        setTeam(t);

        // Fetch all users to construct levels 1-5 unilevel tree
        const allUsers = await api.adminGetUsers(isLiveMode);
        setUsersList(allUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDirectTeam();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const sponsorLink = `${window.location.origin}/register?sponsor=${user.userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sponsorLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build levels 1 to 5 dynamically
  const level1 = usersList.filter(u => u.sponsorId === user.userId);
  const level2 = usersList.filter(u => level1.some(l1 => l1.userId === u.sponsorId));
  const level3 = usersList.filter(u => level2.some(l2 => l2.userId === u.sponsorId));
  const level4 = usersList.filter(u => level3.some(l3 => l3.userId === u.sponsorId));
  const level5 = usersList.filter(u => level4.some(l4 => l4.userId === u.sponsorId));

  const getLevelData = (lvl) => {
    switch (lvl) {
      case 1: return level1;
      case 2: return level2;
      case 3: return level3;
      case 4: return level4;
      case 5: return level5;
      default: return [];
    }
  };

  const activeLevelUsers = getLevelData(activeLevelTab);

  // Statistics
  const totalDirects = level1.length;
  const activeDirects = level1.filter(u => u.isActive).length;
  const inactiveDirects = totalDirects - activeDirects;

  const totalNetworkCount = level1.length + level2.length + level3.length + level4.length + level5.length;
  const totalActiveNetwork = [...level1, ...level2, ...level3, ...level4, ...level5].filter(u => u.isActive).length;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Team & <span className="gold-text-gradient">Referral Network</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Distribute your personal invitation codes, scan QR codes, and trace downlines across 5 generations.
        </p>
      </div>

      {/* Referral Link & QR Code Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Copy Invite Link */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)' }}>Share Sponsor Code</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '2px' }}>Recruit direct nodes under your Left or Right extreme binary legs.</p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-grey)',
            borderRadius: '8px',
            padding: '12px 16px',
            gap: '12px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SPONSOR LINK:</span>
            <input 
              type="text" 
              readOnly 
              value={sponsorLink} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-white)',
                fontSize: '12.5px',
                flex: 1,
                outline: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            />
            <button 
              onClick={handleCopy} 
              style={{
                background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                border: 'none',
                color: copied ? '#34d399' : 'var(--gold-primary)',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-grey)' }}>TOTAL DIRECTS</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>{totalDirects}</h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-grey)' }}>ACTIVE DIRECTS</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{activeDirects}</h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-grey)' }}>INACTIVE DIRECTS</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>{inactiveDirects}</h3>
            </div>
          </div>
        </motion.div>

        {/* QR Code Card */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '20px' }}
        >
          {/* Simulated QR Code matrix block */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '10px',
            border: '2px solid var(--border-gold)',
            background: '#ffffff',
            padding: '10px',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(8, 1fr)',
            gap: '2px',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
          }}>
            {/* Custom stylized QR layout pattern */}
            {[
              1,1,1,1,0,1,1,1,
              1,0,0,1,0,1,0,1,
              1,0,0,1,1,0,0,1,
              1,1,1,1,0,1,1,1,
              0,0,1,0,1,0,1,0,
              1,0,1,1,0,0,0,1,
              1,0,0,0,1,1,0,1,
              1,1,1,1,0,1,1,1
            ].map((cell, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: cell === 1 ? 'var(--bg-black)' : 'transparent',
                  borderRadius: cell === 1 ? '1.5px' : '0'
                }}
              />
            ))}
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <QrCode size={18} style={{ color: 'var(--gold-primary)' }} />
              Quick QR Portal
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-grey)', marginTop: '4px', lineHeight: '1.4' }}>
              Let new users scan this code to redirect to the register portal with sponsor ID <strong>{user.userId}</strong> pre-filled.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Visual Level Unlock Map */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--gold-primary)' }} />
          5-Generation Levels Map
        </h3>

        {/* Horizontal Progress Map */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {[
            { lvl: 1, label: 'L1: Directs', count: level1.length, rate: '10%' },
            { lvl: 2, label: 'L2: Indirects', count: level2.length, rate: '5%' },
            { lvl: 3, label: 'L3: Level 3', count: level3.length, rate: '2%' },
            { lvl: 4, label: 'L4: Level 4', count: level4.length, rate: '1%' },
            { lvl: 5, label: 'L5: Level 5', count: level5.length, rate: '1%' }
          ].map((level) => {
            const isActive = activeLevelTab === level.lvl;
            return (
              <button
                key={level.lvl}
                onClick={() => setActiveLevelTab(level.lvl)}
                style={{
                  background: isActive ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
                  border: isActive ? '1.5px solid var(--border-gold)' : '1px solid var(--border-grey)',
                  borderRadius: '10px',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', textTransform: 'uppercase', fontWeight: 600 }}>{level.label}</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: isActive ? 'var(--gold-primary)' : 'var(--text-white)' }}>{level.count}</h3>
                <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 700 }}>Yield: {level.rate}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Detail List */}
        <div>
          <h4 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '16px', color: 'var(--text-white)' }}>
            Downlines at Level {activeLevelTab} ({activeLevelUsers.length})
          </h4>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>User ID</th>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>Direct Sponsor</th>
                  <th style={{ padding: '10px' }}>Rank</th>
                  <th style={{ padding: '10px' }}>Self Investment</th>
                  <th style={{ padding: '10px' }}>Joined Date</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeLevelUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No downline members registered at unilevel level {activeLevelTab}.
                    </td>
                  </tr>
                ) : (
                  activeLevelUsers.map(member => (
                    <tr key={member.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{member.userId}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{member.name}</td>
                      <td style={{ padding: '10px', color: 'var(--text-grey)' }}>{member.sponsorId}</td>
                      <td style={{ padding: '10px', color: 'var(--gold-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={12} />
                          {member.rank}
                        </div>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 700 }}>${member.business.self.toLocaleString()}</td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(member.doj).toLocaleDateString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <span style={{
                          color: member.isActive ? '#34d399' : '#f87171',
                          fontWeight: 600
                        }}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>

    </div>
  );
}
