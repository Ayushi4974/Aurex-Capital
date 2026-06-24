import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Calendar, Ban, Sparkles, Layers } from 'lucide-react';
import { api } from '../utils/api';

export default function StakingPackages({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet] = useState({ captok: { main: 0 } });
  const [stakes, setStakes] = useState([]);

  useEffect(() => {
    const fetchStakingData = async () => {
      try {
        const w = await api.getBalance(user.userId, isLiveMode);
        if (w) setWallet(w);

        const activeStakes = await api.getMyStakes(user.userId, isLiveMode);
        setStakes(activeStakes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStakingData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const handleUnstake = async (stakeId, stakeAmount) => {
    if (!window.confirm(`Are you sure you want to unstake $${stakeAmount}? Capital will be returned to Fund Wallet.`)) {
      return;
    }

    try {
      await api.unstake(stakeId, isLiveMode);
      alert('Capital unstaked successfully!');
      onRefreshUser();
      
      // Reload wallet and stakes list
      const w = await api.getBalance(user.userId, isLiveMode);
      if (w) setWallet(w);
      const activeStakes = await api.getMyStakes(user.userId, isLiveMode);
      setStakes(activeStakes);
    } catch (err) {
      alert(err.message || 'Unstake failed');
    }
  };

  return (
    <div className="page-container">
      
      {/* Title */}
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers style={{ color: 'var(--gold-primary)' }} />
            My Staking <span className="gold-text-gradient">Packages Hub</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            View your purchased packages, track earnings progress, and manage active slots.
          </p>
        </div>
        <div className="page-header-card">
          <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600, letterSpacing: '0.5px' }}>AVAILABLE FUND WALLET</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--gold-primary)', fontFamily: 'var(--font-display)' }}>
            ${wallet.captok.main.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Section: My Staking Packages */}
      <div>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Sparkles size={18} style={{ color: 'var(--gold-primary)' }} />
          Purchased Packages ({stakes.length})
        </h2>
        
        {stakes.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Zap size={32} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-grey)', fontSize: '15px' }}>You haven't purchased or staked any packages yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Go to the "Investment / Stake" section in the sidebar to buy packages!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}>
            {stakes.map((stake) => {
              const isFTP = stake.planType === 'FTP';
              const startDate = new Date(stake.roiStartDate);
              const isMature = new Date(localStorage.getItem('aurex_virtual_date') || new Date()) >= startDate;
              
              // Calculate capping progress
              const totalProfit = stake.totalProfit || 0;
              const maxCap = stake.amount * 2.50;
              const progressPct = Math.min((totalProfit / maxCap) * 100, 100);
              
              // Colors based on package value
              const tierAccent = stake.amount >= 10000 ? '#f472b6' : stake.amount >= 5000 ? '#fb923c' : stake.amount >= 1000 ? '#d4af37' : stake.amount >= 500 ? '#60a5fa' : '#a78bfa';

              return (
                <motion.div
                  key={stake.id}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass-card"
                  style={{
                    position: 'relative',
                    padding: '24px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: `1px solid ${tierAccent}44`,
                    background: `linear-gradient(135deg, ${tierAccent}15 0%, var(--bg-card) 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3)`
                  }}
                >
                  {/* Corner Glow */}
                  <div style={{
                    position: 'absolute', top: '-20px', right: '-20px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: tierAccent, opacity: 0.15,
                    filter: 'blur(20px)', pointerEvents: 'none'
                  }} />

                  {/* Top row: Name & ID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: `${tierAccent}22`,
                        color: tierAccent,
                        border: `1px solid ${tierAccent}33`,
                        marginBottom: '6px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}>
                        {stake.packageName}
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-white)' }}>
                        ${stake.amount.toLocaleString()}
                      </h3>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ID: {stake.id}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        marginTop: '4px',
                        display: 'inline-block',
                        background: stake.status === 'Completed' ? 'rgba(239, 68, 68, 0.1)' : isFTP && !isMature ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: stake.status === 'Completed' ? '#f87171' : isFTP && !isMature ? '#fbbf24' : '#34d399',
                        border: stake.status === 'Completed' ? '1px solid rgba(239, 68, 68, 0.2)' : isFTP && !isMature ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        {stake.status === 'Completed' ? 'CAPPED' : isFTP && !isMature ? 'WAIT PERIOD' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>

                  {/* ROI / Earning Details */}
                  <div className="responsive-grid-2" style={{ gap: '12px', background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-grey)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-grey)', display: 'block' }}>Daily ROI</span>
                      <strong style={{ fontSize: '13px', color: '#34d399' }}>⚡ {isFTP ? `${stake.roiPercentage}%` : 'Weekly Share'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-grey)', display: 'block' }}>ROI Start Date</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        {startDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Caps */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-grey)' }}>250% Earning Cap Progress</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-white)' }}>
                        ${totalProfit.toFixed(2)} / ${maxCap.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-grey)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${tierAccent}88, ${tierAccent})`, borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>Progress: {progressPct.toFixed(1)}%</span>
                      <span>Cap Max: 2.5x</span>
                    </div>
                  </div>

                  {/* Footer: Action button */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-grey)', paddingTop: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Type</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-white)' }}>{stake.planType} Plan</span>
                    </div>
                    
                    {stake.status === 'Active' ? (
                      <button
                        onClick={() => handleUnstake(stake.id, stake.amount)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#f87171',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.15)' }}
                        onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.08)' }}
                      >
                        Unstake Capital
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Ban size={13} /> Settled
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
