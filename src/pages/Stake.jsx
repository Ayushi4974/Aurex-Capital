import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ShieldAlert, Award, ArrowRight, Zap, Calendar, Ban } from 'lucide-react';
import { api } from '../utils/api';
import { getFTPSlab, getNexusPackageName } from '../utils/simDb';
import confetti from 'canvas-confetti';

export default function Stake({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet] = useState({ captok: { main: 0 } });
  const [stakes, setStakes] = useState([]);
  const [planType, setPlanType] = useState('FTP');
  const [amount, setAmount] = useState('');
  const [calculatedRoi, setCalculatedRoi] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || planType === 'UTP') {
      setCalculatedRoi(0);
      return;
    }
    setCalculatedRoi(getFTPSlab(amt));
  }, [amount, planType]);

  const handleStakeSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.invest(user.userId, planType, amt, isLiveMode);
      setSuccess(`Staking transaction processed! Invested $${amt} in ${planType}.`);
      setAmount('');
      
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });

      onRefreshUser();
      // Reload stakes list
      const activeStakes = await api.getMyStakes(user.userId, isLiveMode);
      setStakes(activeStakes);
    } catch (err) {
      setError(err.message || 'Staking failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (stakeId, stakeAmount) => {
    if (!window.confirm(`Are you sure you want to unstake $${stakeAmount}? Capital will be returned to CapTok Main.`)) {
      return;
    }

    try {
      await api.unstake(stakeId, isLiveMode);
      alert('Capital unstaked successfully!');
      onRefreshUser();
      // Reload stakes list
      const activeStakes = await api.getMyStakes(user.userId, isLiveMode);
      setStakes(activeStakes);
    } catch (err) {
      alert(err.message || 'Unstake failed');
    }
  };

  const nexusTiers = [
    { name: 'Nexus Start', price: 100, roi: '0.25%', desc: 'Ideal for basic node activation.' },
    { name: 'Nexus Pro', price: 500, roi: '0.50%', desc: 'Accelerate unilevel tree overrides.' },
    { name: 'Nexus Elite', price: 1000, roi: '0.75%', desc: 'Premium yields, standard unilevel multipliers.' },
    { name: 'Nexus Titan', price: 5000, roi: '1.00%', desc: 'High ROI limits, extra global pool weights.' },
    { name: 'Nexus Infinity', price: 10000, roi: '2.00%', desc: 'Ultimate yields & direct leadership rankings.' }
  ];

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Investment & <span className="gold-text-gradient">Nexus Staking</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Select from our premium Nexus tiers, deploy CapTok funds, and track your 250% earnings capping progress.
        </p>
      </div>

      {/* Nexus Tiers Show Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {nexusTiers.map((tier, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{
              padding: '24px',
              border: amount >= tier.price ? '1.5px solid var(--border-gold)' : '1px solid var(--border-grey)',
              background: amount >= tier.price ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <Zap size={14} style={{ color: amount >= tier.price ? 'var(--gold-primary)' : 'var(--text-muted)' }} />
            </div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold-primary)' }}>{tier.name}</h4>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>${tier.price.toLocaleString()}</h2>
            <p style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, marginTop: '4px' }}>Daily ROI: {tier.roi}</p>
            <p style={{ fontSize: '10.5px', color: 'var(--text-grey)', marginTop: '8px', lineHeight: '1.4' }}>{tier.desc}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Stake form */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '32px' }}
        >
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '20px', color: 'var(--gold-primary)' }}>
            Stake New Capital
          </h2>
          <form onSubmit={handleStakeSubmit}>
            
            {/* Balance */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-grey)',
              padding: '12px 18px',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-grey)' }}>Available CapTok Main:</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                ${wallet.captok.main.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Plan selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600 }}>
                SELECT INVESTMENT SYSTEM
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{
                  flex: 1, padding: '16px', borderRadius: '10px', cursor: 'pointer',
                  border: planType === 'FTP' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: planType === 'FTP' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="planType" value="FTP" checked={planType === 'FTP'} onChange={() => setPlanType('FTP')} style={{ display: 'none' }} />
                  <div style={{ fontWeight: 700, color: planType === 'FTP' ? 'var(--gold-primary)' : 'var(--text-white)' }}>FTP (Daily ROI)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '4px' }}>Daily slab payouts commencing after 7 days maturity check.</div>
                </label>
                <label style={{
                  flex: 1, padding: '16px', borderRadius: '10px', cursor: 'pointer',
                  border: planType === 'UTP' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: planType === 'UTP' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="planType" value="UTP" checked={planType === 'UTP'} onChange={() => setPlanType('UTP')} style={{ display: 'none' }} />
                  <div style={{ fontWeight: 700, color: planType === 'UTP' ? 'var(--gold-primary)' : 'var(--text-white)' }}>UTP (Unit Plan)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '4px' }}>Weekly profit sharing declared manually by Admin. Multiples of $50.</div>
                </label>
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600 }}>
                STAKE AMOUNT (USD)
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  placeholder={planType === 'FTP' ? 'Min: 100' : 'Multiples of 50'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '48px', fontSize: '18px', fontWeight: 700 }}
                  required
                />
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--gold-primary)', marginTop: '6.5px', display: 'block' }}>
                Package Name: <strong>{amount ? getNexusPackageName(parseFloat(amount)) : 'None'}</strong>
              </span>
            </div>

            {/* Calculation details */}
            <AnimatePresence>
              {calculatedRoi > 0 && planType === 'FTP' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '12px', fontSize: '13px', marginBottom: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Daily Slab Rate:</span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{calculatedRoi}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Estimated Payout:</span>
                    <strong>${(parseFloat(amount) * calculatedRoi / 100).toFixed(3)} / day</strong>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              display: 'flex', gap: '8px', padding: '10px', borderRadius: '6px', fontSize: '11px', marginBottom: '24px',
              background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: '#fbbf24'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>Staking distributes unilevel referral bonuses across 5 levels, and earns up to a 250% cap.</span>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}>
              Confirm Stake
              <ArrowRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* FTP slabs reference */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={18} style={{ color: 'var(--gold-primary)' }} />
            DRP/FTP ROI Slab Scale
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '6px' }}>Investment range</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Daily return %</th>
              </tr>
            </thead>
            <tbody>
              {[
                { range: '$100 - $499', roi: '0.25%' },
                { range: '$500 - $999', roi: '0.50%' },
                { range: '$1,000 - $4,999', roi: '0.75%' },
                { range: '$5,000 - $9,999', roi: '1.00%' },
                { range: '$10,000+', roi: '2.00%' }
              ].map((s, idx) => {
                const amt = parseFloat(amount);
                const isCurrent = planType === 'FTP' && amt && idx === [
                  amt >= 100 && amt < 500,
                  amt >= 500 && amt < 1000,
                  amt >= 1000 && amt < 5000,
                  amt >= 5000 && amt < 10000,
                  amt >= 10000
                ].indexOf(true);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: isCurrent ? 'rgba(212,175,55,0.1)' : 'transparent', color: isCurrent ? 'var(--gold-primary)' : 'var(--text-white)' }}>
                    <td style={{ padding: '6px' }}>{s.range}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{s.roi}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>

      </div>

      {/* Active Stakes List with 250% progress bar cap */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '28px' }}
      >
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
          My Active Stakes ({stakes.length})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-grey)' }}>
                <th style={{ padding: '12px' }}>Stake ID</th>
                <th style={{ padding: '12px' }}>Plan / Package</th>
                <th style={{ padding: '12px' }}>Staked Amount</th>
                <th style={{ padding: '12px' }}>ROI Percentage</th>
                <th style={{ padding: '12px' }}>Earning Cap (250%)</th>
                <th style={{ padding: '12px' }}>Accumulated Profit</th>
                <th style={{ padding: '12px' }}>Capping Progress</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No stakes active. Invest using the form above to begin.
                  </td>
                </tr>
              ) : (
                stakes.map((stake) => {
                  const isFTP = stake.planType === 'FTP';
                  const startDate = new Date(stake.roiStartDate);
                  const isMature = new Date(localStorage.getItem('aurex_virtual_date') || new Date()) >= startDate;
                  
                  // Calculate cap progress
                  const totalProfit = stake.totalProfit || 0;
                  const maxCap = stake.amount * 2.50;
                  const progressPct = Math.min((totalProfit / maxCap) * 100, 100);

                  return (
                    <tr key={stake.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{stake.id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isFTP ? 'rgba(212, 175, 55, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: isFTP ? 'var(--gold-primary)' : '#34d399',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {stake.planType} ({stake.packageName})
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>${stake.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        {isFTP ? `${stake.roiPercentage}%` : 'Weekly Share'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>${maxCap.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>
                        +${totalProfit.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', minWidth: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-primary))' }}></div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-grey)' }}>{progressPct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: stake.status === 'Completed' ? 'rgba(239, 68, 68, 0.1)' : isFTP && !isMature ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: stake.status === 'Completed' ? '#f87171' : isFTP && !isMature ? '#fbbf24' : '#34d399',
                          border: stake.status === 'Completed' ? '1px solid rgba(239, 68, 68, 0.2)' : isFTP && !isMature ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          {stake.status === 'Completed' ? 'CAPPED / ENDED' : isFTP && !isMature ? 'WAIT PERIOD' : 'PAYOUT ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {stake.status === 'Active' ? (
                          <button
                            onClick={() => handleUnstake(stake.id, stake.amount)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Unstake
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <Ban size={12} /> Capped
                          </span>
                        )}
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
