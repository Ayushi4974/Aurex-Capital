import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, AlertTriangle, ArrowUpRight, DollarSign, Lock, Clock, Calendar, CheckCircle, Ban } from 'lucide-react';
import { api } from '../utils/api';

export default function Withdraw({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet] = useState({ protok: { profit: 0 } });
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [txPassword, setTxPassword] = useState('');
  
  const [withdrawLogs, setWithdrawLogs] = useState([]);
  const [cooldownHours, setCooldownHours] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWithdrawalData = async () => {
      try {
        const w = await api.getBalance(user.userId, isLiveMode);
        if (w) setWallet(w);

        // Fetch staker's withdrawal address from local DB
        const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const dbUser = users.find(u => u.userId === user.userId);
        if (dbUser && dbUser.walletAddress) {
          setAddress(dbUser.walletAddress);
        } else {
          setAddress('0x918F3aD343F818dE4DB98c575Ee693C6Cf56bc8c'); // Fallback
        }

        const txs = await api.getTransactions(user.userId, isLiveMode) || [];
        const logs = txs.filter(t => t.type === 'Withdrawal');
        setWithdrawLogs(logs);

        // Cooldown calculations
        const nonRejected = logs.filter(t => t.status !== 'Rejected');
        if (nonRejected.length > 0) {
          const newestWithdrawal = nonRejected[0]; // already reversed, so index 0 is newest
          const lastTime = new Date(newestWithdrawal.createdAt).getTime();
          const virtualDate = new Date(localStorage.getItem('aurex_virtual_date') || new Date());
          const diffHours = (virtualDate.getTime() - lastTime) / (1000 * 60 * 60);
          if (diffHours < 24) {
            setCooldownHours(24 - diffHours);
          } else {
            setCooldownHours(0);
          }
        } else {
          setCooldownHours(0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWithdrawalData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    if (wallet.protok.profit < amt) {
      setError('Insufficient ProTok Profit balance.');
      return;
    }

    if (amt < 20) {
      setError('Minimum withdrawal limit is $20.');
      return;
    }

    if (amt > 5000) {
      setError('Maximum daily withdrawal limit is $5000.');
      return;
    }

    if (cooldownHours > 0) {
      setError(`Withdrawal cooldown active. Try again in ${cooldownHours.toFixed(1)} hours.`);
      return;
    }

    // Verify Transaction Password
    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const dbUser = users.find(u => u.userId === user.userId);
    const correctTxPass = dbUser?.transactionPassword || 'tx123';

    if (txPassword !== correctTxPass) {
      setError('Incorrect transaction password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.withdraw(user.userId, amt, isLiveMode);
      setSuccess(`Withdrawal request of $${amt} (Net Payout: $${(amt * 0.95).toFixed(2)}) submitted successfully. Waiting for admin approval.`);
      setAmount('');
      setTxPassword('');
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setError(err.message || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  const fee = amount ? parseFloat(amount) * 0.05 : 0;
  const netPayout = amount ? parseFloat(amount) - fee : 0;

  return (
    <div style={{ padding: '28px', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Withdraw <span className="gold-text-gradient">Profit & Earnings</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Withdraw liquid commissions and daily ROI payouts directly to your crypto wallet under the compensation rules.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Form panel */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '32px' }}
        >
          {/* Wallet Balance Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-grey)',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-grey)' }}>Available ProTok Profit:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              ${wallet.protok?.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {cooldownHours > 0 ? (
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Clock size={20} />
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>24h Withdrawal Cooldown Active</strong>
                <span style={{ fontSize: '11px' }}>You will be eligible for a new payout request in {cooldownHours.toFixed(1)} hours.</span>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={20} />
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>Withdrawals Eligible</strong>
                <span style={{ fontSize: '11px' }}>Payout triggers will be processed automatically within the hourly window check.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdraw}>
            {/* Amount input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                AMOUNT TO WITHDRAW (USDT)
              </label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  placeholder="Enter payout amount (Min $20)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  required
                />
              </div>
              {amount && !isNaN(amount) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>Transaction Fee (5%): <strong>${fee.toFixed(2)}</strong></span>
                  <span>Net Payout Amount: <strong>${netPayout.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            {/* Crypto address input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                RECEIVING CRYPTO ADDRESS (USDT BEP20)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'var(--text-muted)', width: '100%' }}
                placeholder="0x..."
                required
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Note: Update your withdrawal address inside the "My Profile" tab if needed.
              </span>
            </div>

            {/* Transaction Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TRANSACTION PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Enter transaction password (default: tx123)"
                  value={txPassword}
                  onChange={(e) => setTxPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  required
                />
              </div>
            </div>

            {/* Caution Info */}
            <div style={{
              display: 'flex',
              gap: '8px',
              padding: '10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: '11px',
              marginBottom: '24px',
              alignItems: 'center'
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>Ensure the address matches BEP-20 / ERC-20 networks. Lost tokens cannot be refunded.</span>
            </div>

            {/* Messages */}
            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

            <button
              type="submit"
              disabled={loading || cooldownHours > 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: cooldownHours > 0 ? 0.5 : 1,
                cursor: cooldownHours > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting request...' : 'Confirm Withdrawal Request'}
              <ArrowUpRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Withdrawal Logs Panel */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '28px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--gold-primary)' }} />
            Payout Payout Logs ({withdrawLogs.length})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 4px' }}>TX ID</th>
                  <th style={{ padding: '10px 4px' }}>Requested</th>
                  <th style={{ padding: '10px 4px' }}>Fee (5%)</th>
                  <th style={{ padding: '10px 4px' }}>Status</th>
                  <th style={{ padding: '10px 4px', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No payouts requested yet.
                    </td>
                  </tr>
                ) : (
                  withdrawLogs.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{tx.id}</td>
                      <td style={{ padding: '10px 4px', fontWeight: 700 }}>${tx.amount.toLocaleString()}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-grey)' }}>${(tx.amount * 0.05).toFixed(2)}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{
                          color: tx.status === 'Completed' ? '#34d399' : tx.status === 'Pending' ? '#f59e0b' : '#ef4444',
                          fontWeight: 600
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
