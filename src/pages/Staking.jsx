import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ShieldAlert, Award, Calendar, RefreshCcw, ArrowRight, Zap } from 'lucide-react';
import { api } from '../utils/api';
import { getFTPSlab } from '../utils/simDb';
import confetti from 'canvas-confetti';

export default function Staking({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet] = useState({ captok: { main: 0 } });
  const [stakes, setStakes] = useState([]);
  
  // Staking Form State
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
        console.error('Error fetching staking data:', err);
      }
    };
    fetchStakingData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  // Update calculated ROI whenever amount or plan changes
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
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid investment amount.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.invest(user.userId, planType, amt, isLiveMode);
      setSuccess(`Successfully staked $${amt} in ${planType === 'FTP' ? 'FTP (Daily ROI)' : 'UTP'}.`);
      setAmount('');
      
      // Fire celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffffff', '#aa7c11']
      });

      onRefreshUser(); // Updates user's self business and active state on header
    } catch (err) {
      setError(err.message || 'Staking failed. Please try again.');
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
    } catch (err) {
      alert(err.message || 'Unstake failed');
    }
  };

  // Slabs metadata for display
  const slabs = [
    { range: '$50 - $249', roi: '0.100%' },
    { range: '$250 - $499', roi: '0.125%' },
    { range: '$500 - $999', roi: '0.150%' },
    { range: '$1,000 - $2,499', roi: '0.175%' },
    { range: '$2,500 - $4,999', roi: '0.200%' },
    { range: '$5,000 - $9,999', roi: '0.225%' },
    { range: '$10,000 - $24,999', roi: '0.250%' },
    { range: '$25,000 - $49,999', roi: '0.275%' },
    { range: '$50,000 - $74,999', roi: '0.300%' },
    { range: '$75,000 - $99,999', roi: '0.325%' },
    { range: '$100,000+', roi: '0.350%' },
  ];

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Staking & <span className="gold-text-gradient">ROI Plans Hub</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Power your IMX capital and distribute MLM unilevel rewards down the tree
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '28px',
        alignItems: 'start',
        marginBottom: '40px'
      }}>
        {/* Left Side: Staking Action */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '20px', color: 'var(--gold-primary)' }}>
            Stake New Capital
          </h2>

          <form onSubmit={handleStakeSubmit}>
            {/* Wallet Balance Display */}
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
              <span style={{ fontSize: '13px', color: 'var(--text-grey)' }}>Available CapTok Balance:</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-primary)' }}>
                ${wallet.captok?.main.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Plan Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600 }}>
                SELECT PLAN PACKAGE
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* FTP Plan */}
                <label style={{
                  flex: 1,
                  padding: '18px',
                  borderRadius: '12px',
                  background: planType === 'FTP' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.3)',
                  border: planType === 'FTP' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <input 
                    type="radio" 
                    name="planType" 
                    value="FTP" 
                    checked={planType === 'FTP'}
                    onChange={() => setPlanType('FTP')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 700, color: planType === 'FTP' ? 'var(--gold-primary)' : 'var(--text-white)' }}>
                    Fixed Token Plan (FTP)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '4px' }}>
                    Daily ROI slabs matching stake amount. Begins after 7 days delay.
                  </div>
                </label>

                {/* UTP Plan */}
                <label style={{
                  flex: 1,
                  padding: '18px',
                  borderRadius: '12px',
                  background: planType === 'UTP' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.3)',
                  border: planType === 'UTP' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <input 
                    type="radio" 
                    name="planType" 
                    value="UTP" 
                    checked={planType === 'UTP'}
                    onChange={() => setPlanType('UTP')}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontWeight: 700, color: planType === 'UTP' ? 'var(--gold-primary)' : 'var(--text-white)' }}>
                    Unit Token Plan (UTP)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '4px' }}>
                    Weekly Profit Sharing (PSP). Eligible if staked before Monday (00:00).
                  </div>
                </label>
              </div>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600 }}>
                STAKE AMOUNT (USD / IMX LOTS)
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number" 
                  placeholder={planType === 'FTP' ? 'Min: 50' : 'Multiples of 50'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '48px', fontSize: '18px', fontWeight: 700 }}
                  required
                />
              </div>
              {planType === 'UTP' && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  UTP requires buying in lots of $50 (e.g. $50, $100, $150, etc.).
                </span>
              )}
            </div>

            {/* Live Calculation Feedback */}
            <AnimatePresence>
              {calculatedRoi > 0 && planType === 'FTP' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(212, 175, 55, 0.05)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    marginBottom: '24px',
                    color: 'var(--text-white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Earning Slab:</span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{calculatedRoi}% Daily</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-grey)' }}>
                    <span>Expected Daily Return:</span>
                    <strong>${(parseFloat(amount) * calculatedRoi / 100).toFixed(3)} / day</strong>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Level Reward Notification Banner */}
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              color: '#fbbf24',
              fontSize: '12px',
              marginBottom: '24px'
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Level Commissions Distribution Warning:</strong> Direct sponsor gets 10%, upline sponsors get 5% (L2), 2% (L3), 1% (L4), 1% (L5) immediately distributed!
              </div>
            </div>

            {/* Feedback messages */}
            {error && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', fontSize: '14px', marginBottom: '16px' }}>{success}</div>}

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Processing...' : 'Confirm and Stake Capital'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: Slab Scales metadata */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--gold-primary)' }} />
            DRP/FTP ROI Slab Scale
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 4px' }}>Investment slab</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Daily Return</th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((s, idx) => {
                // highlight matching slab if user typed amount
                const amt = parseFloat(amount);
                const isCurrent = planType === 'FTP' && amt && idx === slabs.findIndex(sl => {
                  if (sl.range.includes('+')) return amt >= 100000;
                  const [min, max] = sl.range.replace(/\$/g, '').replace(/,/g, '').split(' - ').map(Number);
                  return amt >= min && amt <= max;
                });

                return (
                  <tr key={idx} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: isCurrent ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    color: isCurrent ? 'var(--gold-primary)' : 'var(--text-white)'
                  }}>
                    <td style={{ padding: '8px 4px', fontWeight: isCurrent ? 'bold' : 'normal' }}>{s.range}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: isCurrent ? 'bold' : 'normal' }}>{s.roi}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Stakes List */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
          My Active Stakes ({stakes.length})
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-grey)' }}>
                <th style={{ padding: '12px' }}>Stake ID</th>
                <th style={{ padding: '12px' }}>Plan Type</th>
                <th style={{ padding: '12px' }}>Staked Amount</th>
                <th style={{ padding: '12px' }}>ROI Percentage</th>
                <th style={{ padding: '12px' }}>ROI Start Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Total Profit</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No stakes active. Invest using the form above to begin.
                  </td>
                </tr>
              ) : (
                stakes.map((stake) => {
                  const isFTP = stake.planType === 'FTP';
                  const startDate = new Date(stake.roiStartDate);
                  const isMature = new Date(localStorage.getItem('aurex_virtual_date') || new Date()) >= startDate;

                  return (
                    <tr key={stake.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{stake.id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isFTP ? 'rgba(212, 175, 55, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: isFTP ? 'var(--gold-primary)' : '#34d399',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {stake.planType}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>${stake.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        {isFTP ? `${stake.roiPercentage}%` : 'Weekly Share'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-grey)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          {startDate.toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: stake.status === 'Completed' ? 'rgba(255,255,255,0.05)' : isFTP && !isMature ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: stake.status === 'Completed' ? 'var(--text-muted)' : isFTP && !isMature ? '#fbbf24' : '#34d399',
                          border: stake.status === 'Completed' ? '1px solid rgba(255,255,255,0.1)' : isFTP && !isMature ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          {stake.status === 'Completed' ? 'Completed' : isFTP && !isMature ? 'Wait Period' : 'Payout Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#34d399' }}>
                        +${stake.totalProfit.toFixed(2)}
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
                              fontSize: '12px'
                            }}
                          >
                            Unstake
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
