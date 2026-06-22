import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  DollarSign, 
  Send, 
  Landmark, 
  ShoppingBag, 
  ListFilter,
  TrendingUp,
  Award,
  Users,
  Percent,
  Coins,
  Gem,
  Gift,
  Sparkles,
  Trophy
} from 'lucide-react';
import { api } from '../utils/api';

export default function Wallet({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet] = useState({
    captok: { main: 0, used: 0, free: 0 },
    protok: { profit: 0, requested: 0, released: 0 }
  });
  const [transactions, setTransactions] = useState([]);
  const [activeForm, setActiveForm] = useState('deposit'); // deposit, buy, P2P, withdraw

  // Form Inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const w = await api.getBalance(user.userId, isLiveMode);
        if (w) setWallet(w);

        const txs = await api.getTransactions(user.userId, isLiveMode);
        setTransactions(txs.reverse()); // show newest first
      } catch (err) {
        console.error('Error fetching wallet transactions:', err);
      }
    };
    fetchWalletData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const getBalanceByType = (type) => {
    return transactions
      .filter(tx => tx.type === type && tx.status === 'Completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // 8 Balance Metrics definitions
  const balanceMetrics = [
    {
      title: 'Available Balance (Main)',
      amount: wallet.captok?.main || 0,
      icon: WalletIcon,
      color: 'var(--gold-primary)',
      desc: 'CapTok deposit funds for staking or transfers.'
    },
    {
      title: 'Daily ROI Earned',
      amount: getBalanceByType('ROI'),
      icon: Percent,
      color: '#34d399',
      desc: 'Accumulated daily slab ROI from active stakes.'
    },
    {
      title: 'Referral Income',
      amount: getBalanceByType('DirectReward'),
      icon: Users,
      color: '#60a5fa',
      desc: '10% unilevel direct sponsor rewards.'
    },
    {
      title: 'Level Income',
      amount: getBalanceByType('LevelReward') || getBalanceByType('LevelIncome'),
      icon: TrendingUp,
      color: '#a78bfa',
      desc: '5-generation level matching bonuses.'
    },
    {
      title: 'FastTrack Rewards',
      amount: getBalanceByType('FastTrackReward') || getBalanceByType('FastTrack'),
      icon: Sparkles,
      color: '#f472b6',
      desc: 'Maturity acceleration bonuses.'
    },
    {
      title: 'Rank Milestone Rewards',
      amount: getBalanceByType('RankReward'),
      icon: Trophy,
      color: '#fbbf24',
      desc: 'Cash milestones & luxury items payouts.'
    },
    {
      title: 'Global Pool Profit',
      amount: getBalanceByType('PoolReward'),
      icon: Coins,
      color: '#2dd4bf',
      desc: 'Corporate shares distribution.'
    },
    {
      title: 'Loyalty Bonus',
      amount: getBalanceByType('LoyaltyReward'),
      icon: Gem,
      color: '#f87171',
      desc: 'Node loyalty reward dividends.'
    }
  ];

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    resetMessages();
    try {
      await api.depositRequest(user.userId, amt, isLiveMode);
      setSuccess(`Deposit request for $${amt} submitted! Waiting for Admin approval.`);
      setDepositAmount('');
      onRefreshUser();
    } catch (err) {
      setError(err.message || 'Deposit request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(buyAmount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    resetMessages();
    try {
      await api.buyImx(user.userId, amt, isLiveMode);
      setSuccess(`Successfully purchased IMX tokens! Credited $${amt} directly to CapTok.`);
      setBuyAmount('');
      onRefreshUser();
    } catch (err) {
      setError(err.message || 'Token purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || !transferTarget) return;
    setLoading(true);
    resetMessages();
    try {
      await api.transfer(user.userId, transferTarget, amt, isLiveMode);
      setSuccess(`Successfully transferred $${amt} CapTok to ${transferTarget}.`);
      setTransferAmount('');
      setTransferTarget('');
      onRefreshUser();
    } catch (err) {
      setError(err.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    resetMessages();
    try {
      await api.withdraw(user.userId, amt, isLiveMode);
      setSuccess(`Withdrawal request for $${amt} logged. Transferred to requested pool.`);
      setWithdrawAmount('');
      onRefreshUser();
    } catch (err) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type.toUpperCase() === filterType;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1250px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Wallet & <span className="gold-text-gradient">Financial Manager</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Overview of your 8 wallet balance categories, direct unilevel payments, and transactions logging.
        </p>
      </div>

      {/* 8 Balance metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {balanceMetrics.map((met, idx) => {
          const Icon = met.icon;
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
              className="glass-card shifting-card" 
              style={{ padding: '20px', borderLeft: `3px solid ${met.color}`, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {met.title}
                </span>
                <Icon size={18} style={{ color: met.color }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: 'var(--text-white)' }}>
                ${met.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                {met.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Layout Grid: Transactions Actions & Logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.6fr',
        gap: '28px',
        alignItems: 'start'
      }}>
        {/* Actions Cards */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px' }}
        >
          {/* Tab selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            marginBottom: '24px',
            background: 'rgba(0,0,0,0.3)',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {[
              { id: 'deposit', label: 'Deposit', icon: Landmark },
              { id: 'buy', label: 'Buy IMX', icon: ShoppingBag },
              { id: 'transfer', label: 'P2P', icon: Send },
              { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveForm(tab.id); resetMessages(); }}
                style={{
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: activeForm === tab.id ? 'var(--gold-primary)' : 'transparent',
                  color: activeForm === tab.id ? 'var(--bg-black)' : 'var(--text-grey)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

          {/* Form Content */}
          <div>
            {/* Deposit Request Form */}
            {activeForm === 'deposit' && (
              <form onSubmit={handleDepositSubmit}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>
                  Request Manual Deposit
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                    DEPOSIT AMOUNT (USD)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 500)"
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                  {loading ? 'Submitting...' : 'Submit Deposit Request'}
                </button>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Deposits require approval by the admin dashboard.
                </span>
              </form>
            )}

            {/* Buy IMX Lot Form */}
            {activeForm === 'buy' && (
              <form onSubmit={handleBuySubmit}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>
                  Purchase IMX Tokens Lot
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                    PURCHASE AMOUNT (USD)
                  </label>
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    placeholder="Enter purchase size"
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                  {loading ? 'Processing...' : 'Purchase IMX and Activate'}
                </button>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Auto-approves lot purchase & sets activation flag.
                </span>
              </form>
            )}

            {/* P2P Transfer Form */}
            {activeForm === 'transfer' && (
              <form onSubmit={handleTransferSubmit}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>
                  P2P Balance Transfer
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                    RECIPIENT USER ID (CapTok)
                  </label>
                  <input
                    type="text"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    placeholder="e.g. AC100003"
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                    AMOUNT TO TRANSFER (USD)
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder={`Available: $${(wallet.captok?.main || 0).toLocaleString()}`}
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                  {loading ? 'Sending...' : 'Confirm P2P Transfer'}
                </button>
              </form>
            )}

            {/* Withdrawal Form */}
            {activeForm === 'withdraw' && (
              <form onSubmit={handleWithdrawSubmit}>
                <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', fontWeight: 600 }}>
                  Withdraw Rewards
                </h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                    WITHDRAWAL AMOUNT (USD)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter reward payout amount"
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
                  {loading ? 'Requesting...' : 'Request Payout'}
                </button>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block', textAlign: 'center' }}>
                  Deducts ProTok Profit and puts in Pending.
                </span>
              </form>
            )}
          </div>
        </motion.div>

        {/* Transactions Logs List */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px' }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Audit Log / Transactions
            </h3>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-grey)' }}>
              <ListFilter size={12} style={{ color: 'var(--text-muted)', marginLeft: '4px' }} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-white)',
                  fontSize: '12px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Events</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="WITHDRAWAL">Withdrawals</option>
                <option value="STAKING">Stakes</option>
                <option value="UNSTAKE">Unstakes</option>
                <option value="ROI">ROI payouts</option>
                <option value="DIRECTREWARD">Direct referral</option>
                <option value="BINARYREWARD">Binary matching</option>
                <option value="TRANSFER">Transfers</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 4px' }}>TX ID</th>
                  <th style={{ padding: '10px 4px' }}>Type</th>
                  <th style={{ padding: '10px 4px' }}>Amount</th>
                  <th style={{ padding: '10px 4px' }}>Status</th>
                  <th style={{ padding: '10px 4px' }}>Description</th>
                  <th style={{ padding: '10px 4px', textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No transactions recorded matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = ['ROI', 'DirectReward', 'BinaryReward', 'Deposit', 'Transfer'].includes(tx.type) && tx.status !== 'Rejected';
                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '10px 4px', fontWeight: 600 }}>{tx.id}</td>
                        <td style={{ padding: '10px 4px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background: isCredit ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: isCredit ? '#34d399' : '#f87171'
                          }}>
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 4px', fontWeight: 700, color: isCredit ? '#34d399' : '#f87171' }}>
                          {isCredit ? '+' : '-'}${tx.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 4px' }}>
                          <span style={{
                            color: tx.status === 'Completed' ? '#34d399' : tx.status === 'Pending' ? '#f59e0b' : '#ef4444',
                            fontWeight: 600
                          }}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 4px', color: 'var(--text-grey)' }}>{tx.description}</td>
                        <td style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
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
    </div>
  );
}
