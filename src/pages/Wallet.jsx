import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark, AlertTriangle, ArrowUpRight, DollarSign, Lock, Clock,
  Calendar, CheckCircle, TrendingUp, Users, GitBranch, Zap,
  Trophy, Star, Heart, ArrowDownLeft, ArrowLeftRight, ChevronDown, ChevronUp, Wallet as WalletIcon
} from 'lucide-react';
import { api } from '../utils/api';

// Income card definition
const INCOME_CARDS = [
  { key: 'available',   label: 'Available Balance',  icon: WalletIcon,     color: '#d4af37', bg: 'rgba(212,175,55,0.08)',   border: 'rgba(212,175,55,0.25)' },
  { key: 'roi',         label: 'ROI Balance',         icon: TrendingUp,     color: '#34d399', bg: 'rgba(52,211,153,0.06)',   border: 'rgba(52,211,153,0.2)'  },
  { key: 'referral',    label: 'Referral Income',     icon: Users,          color: '#60a5fa', bg: 'rgba(96,165,250,0.06)',   border: 'rgba(96,165,250,0.2)'  },
  { key: 'level',       label: 'Level Income',        icon: GitBranch,      color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)' },
  { key: 'fasttrack',   label: 'FastTrack Bonus',     icon: Zap,            color: '#fb923c', bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.2)'  },
  { key: 'rank',        label: 'Rank Bonus',          icon: Trophy,         color: '#f472b6', bg: 'rgba(244,114,182,0.06)', border: 'rgba(244,114,182,0.2)' },
  { key: 'pool',        label: 'Pool Bonus',          icon: Star,           color: '#38bdf8', bg: 'rgba(56,189,248,0.06)',  border: 'rgba(56,189,248,0.2)'  },
  { key: 'loyalty',     label: 'Loyalty Bonus',       icon: Heart,          color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
];

export default function Wallet({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet]           = useState({ captok: { main: 0 }, protok: { profit: 0 } });
  const [amount, setAmount]           = useState('');
  const [address, setAddress]         = useState('');
  const [txPassword, setTxPassword]   = useState('');
  const [withdrawLogs, setWithdrawLogs] = useState([]);
  const [depositLogs, setDepositLogs]   = useState([]);
  const [transferLogs, setTransferLogs] = useState([]);
  const [cooldownHours, setCooldownHours] = useState(0);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [incomes, setIncomes]         = useState({
    available: 0, roi: 0, referral: 0, level: 0,
    fasttrack: 0, rank: 0, pool: 0, loyalty: 0,
  });
  const [historyTab, setHistoryTab]   = useState('withdraw'); // 'withdraw' | 'deposit' | 'transfer'
  
  // P2P Internal Transfers States
  const [activeFormTab, setActiveFormTab] = useState('withdraw'); // 'withdraw' | 'transfer'
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount]       = useState('');
  const [transferTxPassword, setTransferTxPassword] = useState('');
  const [transferError, setTransferError]         = useState('');
  const [transferSuccess, setTransferSuccess]     = useState('');
  const [transferLoading, setTransferLoading]     = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const w = await api.getBalance(user.userId, isLiveMode);
        if (w) setWallet(w);

        // Wallet address
        const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const dbUser = users.find(u => u.userId === user.userId);
        setAddress(dbUser?.walletAddress || '0x918F3aD343F818de4DB98c575Ee693C6Cf56bc8c');

        const txs = (await api.getTransactions(user.userId, isLiveMode)) || [];

        // Separate log categories
        const wLogs = txs.filter(t => t.type === 'Withdrawal');
        const dLogs = txs.filter(t => t.type === 'Deposit');
        const tLogs = txs.filter(t => t.type === 'Transfer');
        setWithdrawLogs(wLogs);
        setDepositLogs(dLogs);
        setTransferLogs(tLogs);

        // Compute income breakdowns from transactions
        const sum = (type) => txs.filter(t => t.type === type && t.status === 'Completed')
                                  .reduce((acc, t) => acc + (t.amount || 0), 0);

        const roiTotal       = sum('ROI');
        const referralTotal  = sum('DirectReward');
        const levelTotal     = sum('LevelReward');
        const fasttrackTotal = sum('BinaryReward');
        const rankTotal      = sum('RankBonus');
        const poolTotal      = sum('PoolBonus');
        const loyaltyTotal   = sum('LoyaltyBonus');
        const available      = w ? w.protok?.profit || 0 : 0;

        setIncomes({
          available,
          roi:       roiTotal,
          referral:  referralTotal,
          level:     levelTotal,
          fasttrack: fasttrackTotal,
          rank:      rankTotal,
          pool:      poolTotal,
          loyalty:   loyaltyTotal,
        });

        // Cooldown
        const nonRejected = wLogs.filter(t => t.status !== 'Rejected');
        if (nonRejected.length > 0) {
          const lastTime = new Date(nonRejected[0].createdAt).getTime();
          const virtualDate = new Date(localStorage.getItem('aurex_virtual_date') || new Date());
          const diffHours = (virtualDate.getTime() - lastTime) / (1000 * 60 * 60);
          setCooldownHours(diffHours < 24 ? 24 - diffHours : 0);
        } else {
          setCooldownHours(0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.userId, isLiveMode, refreshTrigger]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    if (wallet.protok?.profit < amt) { setError('Insufficient Withdrawable Profit balance.'); return; }
    if (amt < 20)   { setError('Minimum withdrawal limit is $20.'); return; }
    if (amt > 5000) { setError('Maximum daily withdrawal limit is $5000.'); return; }
    if (cooldownHours > 0) { setError(`Withdrawal cooldown active. Try again in ${cooldownHours.toFixed(1)} hours.`); return; }

    const users  = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const dbUser = users.find(u => u.userId === user.userId);
    if (txPassword !== (dbUser?.transactionPassword || 'tx123')) { setError('Incorrect transaction password.'); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      await api.withdraw(user.userId, amt, isLiveMode);
      setSuccess(`Withdrawal request of $${amt} (Net Payout: $${(amt * 0.95).toFixed(2)}) submitted successfully. Waiting for admin approval.`);
      setAmount(''); setTxPassword('');
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setError(err.message || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (!wallet.captok || wallet.captok.main < amt) {
      setTransferError('Insufficient Activation Wallet balance.');
      return;
    }

    const users  = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const dbUser = users.find(u => u.userId === user.userId);
    if (transferTxPassword !== (dbUser?.transactionPassword || 'tx123')) {
      setTransferError('Incorrect transaction password.');
      return;
    }

    setTransferLoading(true);
    setTransferError('');
    setTransferSuccess('');
    try {
      await api.transfer(user.userId, transferRecipient, amt, isLiveMode);
      setTransferSuccess(`Transferred $${amt} successfully to ${transferRecipient}.`);
      setTransferAmount('');
      setTransferRecipient('');
      setTransferTxPassword('');
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setTransferError(err.message || 'P2P Transfer failed.');
    } finally {
      setTransferLoading(false);
    }
  };

  const fee      = amount ? parseFloat(amount) * 0.05 : 0;
  const netPayout = amount ? parseFloat(amount) - fee : 0;

  const fmt = (v) => `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statusColor = (s) => s === 'Completed' ? '#34d399' : s === 'Pending' ? '#f59e0b' : '#ef4444';

  return (
    <div className="page-container">

      {/* ── Title ── */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px' }}>
          Withdraw <span className="gold-text-gradient">Profit &amp; Earnings</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Withdraw liquid commissions and daily ROI payouts directly to your crypto wallet under the compensation rules.
        </p>
      </div>

      {/* ── Income Summary Grid (8 cards) ── */}
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
          Income Breakdown
        </p>
        <div className="income-cards-grid">
          {INCOME_CARDS.map((card, i) => {
            const Icon = card.icon;
            const value = incomes[card.key] || 0;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.18 } }}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderRadius: '14px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  cursor: 'default',
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* glow blob */}
                <div style={{
                  position: 'absolute', top: '-18px', right: '-18px',
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: card.color, opacity: 0.08, filter: 'blur(18px)',
                  pointerEvents: 'none'
                }} />

                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: `rgba(${card.color === '#d4af37' ? '212,175,55' : card.color === '#34d399' ? '52,211,153' : card.color === '#60a5fa' ? '96,165,250' : card.color === '#a78bfa' ? '167,139,250' : card.color === '#fb923c' ? '251,146,60' : card.color === '#f472b6' ? '244,114,182' : card.color === '#38bdf8' ? '56,189,248' : '248,113,113'},0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={card.color} />
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: card.key === 'available' ? '18px' : '16px',
                    fontWeight: 800,
                    color: card.key === 'available' ? card.color : value > 0 ? card.color : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.3px',
                  }}>
                    {fmt(value)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── History Tabs ── */}
      <div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'withdraw', label: 'Withdrawal History', icon: ArrowUpRight },
            { id: 'deposit',  label: 'Deposit History',    icon: ArrowDownLeft },
            { id: 'transfer', label: 'Internal Transfers', icon: ArrowLeftRight },
          ].map(tab => {
            const active = historyTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setHistoryTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  background: active ? 'linear-gradient(135deg,#d4af37,#f3e5ab)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#0a0a0a' : 'var(--text-grey)',
                  border: active ? 'none' : '1px solid var(--border-grey)',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={historyTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-card"
          style={{ padding: '0', overflow: 'hidden' }}
        >
          {/* History Table */}
          {historyTab === 'withdraw' && <HistoryTable rows={withdrawLogs} cols={['TX ID','Amount','Fee (5%)','Status','Date']} type="withdraw" />}
          {historyTab === 'deposit'  && <HistoryTable rows={depositLogs}  cols={['TX ID','Amount','Description','Status','Date']} type="deposit"  />}
          {historyTab === 'transfer' && <HistoryTable rows={transferLogs} cols={['TX ID','Amount','Description','Status','Date']} type="transfer" />}
        </motion.div>
      </div>

      {/* ── Main 2-col section: Form + Payout Logs ── */}
      <div className="responsive-grid-1-12" style={{ gap: '28px', alignItems: 'start' }}>

        {/* Form panel */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{
            padding: '32px',
          }}
        >
          {/* Balance row (split for Withdrawable Profit & Activation Wallet) */}
          <div className="responsive-grid-2" style={{ gap: '12px', marginBottom: '24px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-grey)',
              padding: '14px 16px', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>WITHDRAWABLE PROFIT</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)' }}>
                {fmt(wallet.protok?.profit)}
              </span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-grey)',
              padding: '14px 16px', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVATION WALLET</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-display)' }}>
                {fmt(wallet.captok?.main)}
              </span>
            </div>
          </div>

          {/* Action Tabs switcher inside form */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-grey)', paddingBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setActiveFormTab('withdraw')}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                background: activeFormTab === 'withdraw' ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: activeFormTab === 'withdraw' ? 'var(--gold-primary)' : 'var(--text-grey)',
                border: activeFormTab === 'withdraw' ? '1px solid var(--border-gold)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              Withdraw to Crypto
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('transfer')}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                background: activeFormTab === 'transfer' ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: activeFormTab === 'transfer' ? 'var(--gold-primary)' : 'var(--text-grey)',
                border: activeFormTab === 'transfer' ? '1px solid var(--border-gold)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              P2P Fund Transfer
            </button>
          </div>

          {activeFormTab === 'withdraw' ? (
            <>
              {/* Cooldown / eligible banner */}
              {cooldownHours > 0 ? (
                <div style={{ background: 'rgba(245,158,11,0.02)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px' }}>24h Withdrawal Cooldown Active</strong>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>Eligible for new payout in {cooldownHours.toFixed(1)} hours.</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(16,185,129,0.02)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', padding: '14px 16px', marginBottom: '24px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={18} style={{ flexShrink: 0 }} className="status-pill-pulse" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', fontWeight: 600 }}>Withdrawals Eligible</strong>
                    <span style={{ fontSize: '11px', opacity: 0.8 }}>Payout triggers processed automatically within the hourly window.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleWithdraw}>
                {/* Amount */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    AMOUNT TO WITHDRAW (USDT)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="number"
                      placeholder="Enter payout amount (Min $20)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px', width: '100%' }}
                      required
                    />
                  </div>
                  {amount && !isNaN(amount) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <span>Transaction Fee (5%): <strong>${fee.toFixed(2)}</strong></span>
                      <span>Net Payout Amount: <strong>${netPayout.toFixed(2)}</strong></span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    RECEIVING CRYPTO ADDRESS (USDT BEP20)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                    placeholder="0x..."
                    required
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                    Note: Update your withdrawal address inside the "My Profile" tab if needed.
                  </span>
                </div>

                {/* TX Password */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                    TRANSACTION PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      placeholder="Enter transaction password (default: tx123)"
                      value={txPassword}
                      onChange={(e) => setTxPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px', width: '100%' }}
                      required
                    />
                  </div>
                </div>

                {/* Caution */}
                <div style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: '11px', marginBottom: '24px', alignItems: 'center' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>Ensure the address matches BEP-20 / ERC-20 networks. Lost tokens cannot be refunded.</span>
                </div>

                {error   && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
                {success && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

                <button
                  type="submit"
                  disabled={loading || cooldownHours > 0}
                  className="btn btn-primary"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '8px',
                    fontWeight: 700, fontSize: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: cooldownHours > 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#d4af37 0%,#f3e5ab 100%)',
                    color: cooldownHours > 0 ? 'var(--text-muted)' : 'var(--bg-black)',
                    border: cooldownHours > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    opacity: cooldownHours > 0 ? 0.5 : 1,
                    cursor: cooldownHours > 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? 'Submitting request...' : 'Confirm Withdrawal Request'}
                  <ArrowUpRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleTransfer}>
              {/* Recipient ID */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  RECIPIENT USER ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Enter recipient User ID (e.g. AC100003)"
                    value={transferRecipient}
                    onChange={(e) => setTransferRecipient(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%', textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  AMOUNT TO TRANSFER (USDT)
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="number"
                    placeholder="Enter transfer amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              {/* TX Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
                  TRANSACTION PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Enter transaction password (default: tx123)"
                    value={transferTxPassword}
                    onChange={(e) => setTransferTxPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              {/* Caution */}
              <div style={{ display: 'flex', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '11px', marginBottom: '24px', alignItems: 'center' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>P2P transfers are completed instantly and are non-refundable. Verify the recipient ID before confirming.</span>
              </div>

              {transferError   && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{transferError}</div>}
              {transferSuccess && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '16px' }}>{transferSuccess}</div>}

              <button
                type="submit"
                disabled={transferLoading}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '14px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'linear-gradient(135deg,#d4af37 0%,#f3e5ab 100%)',
                  color: 'var(--bg-black)',
                  border: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {transferLoading ? 'Processing transfer...' : 'Confirm P2P Fund Transfer'}
                <ArrowLeftRight size={16} />
              </button>
            </form>
          )}
        </motion.div>

        {/* Payout Logs Panel */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-card shifting-card"
          style={{ padding: '28px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--gold-primary)' }} />
            Payout Logs ({withdrawLogs.length})
          </h3>

          <div className="mobile-scrollable-table">
            <table className="responsive-table" style={{ fontSize: '13px' }}>
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
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600 }}>{tx.id}</td>
                      <td style={{ padding: '10px 4px', fontWeight: 700 }}>${tx.amount?.toLocaleString()}</td>
                      <td style={{ padding: '10px 4px', color: 'var(--text-grey)' }}>${(tx.amount * 0.05).toFixed(2)}</td>
                      <td style={{ padding: '10px 4px' }}>
                        <span style={{ color: statusColor(tx.status), fontWeight: 600 }}>{tx.status}</span>
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

/* ── Reusable history table sub-component ── */
function HistoryTable({ rows, cols, type }) {
  const statusColor = (s) => s === 'Completed' ? '#34d399' : s === 'Pending' ? '#f59e0b' : '#ef4444';

  return (
    <div className="mobile-scrollable-table">
      <table className="responsive-table" style={{ fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)' }}>
            {cols.map((c) => (
              <th key={c} style={{ padding: '12px 16px', fontWeight: 600, fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--gold-primary)' }}>{tx.id}</td>
                <td style={{ padding: '11px 16px', fontWeight: 700 }}>${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                {type === 'withdraw' ? (
                  <td style={{ padding: '11px 16px', color: 'var(--text-grey)' }}>${(tx.amount * 0.05).toFixed(2)}</td>
                ) : (
                  <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>
                )}
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ color: statusColor(tx.status), fontWeight: 600, fontSize: '12px' }}>{tx.status}</span>
                </td>
                <td style={{ padding: '11px 16px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
