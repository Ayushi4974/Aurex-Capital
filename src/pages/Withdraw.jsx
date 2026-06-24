import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark, AlertTriangle, ArrowUpRight, DollarSign, Lock, Clock,
  Calendar, CheckCircle, TrendingUp, Users, GitBranch, Zap,
  Trophy, Star, Heart, ArrowDownLeft, ArrowLeftRight, Wallet
} from 'lucide-react';
import { api } from '../utils/api';

const INCOME_CARDS = [
  { key: 'available',  label: 'Available Balance', icon: Wallet,     color: '#d4af37', bg: 'rgba(212,175,55,0.08)',   border: 'rgba(212,175,55,0.25)' },
  { key: 'roi',        label: 'ROI Balance',        icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.06)',   border: 'rgba(52,211,153,0.2)'  },
  { key: 'referral',   label: 'Referral Income',    icon: Users,      color: '#60a5fa', bg: 'rgba(96,165,250,0.06)',   border: 'rgba(96,165,250,0.2)'  },
  { key: 'level',      label: 'Level Income',       icon: GitBranch,  color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)' },
  { key: 'fasttrack',  label: 'FastTrack Bonus',    icon: Zap,        color: '#fb923c', bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.2)'  },
  { key: 'rank',       label: 'Rank Bonus',         icon: Trophy,     color: '#f472b6', bg: 'rgba(244,114,182,0.06)', border: 'rgba(244,114,182,0.2)' },
  { key: 'pool',       label: 'Pool Bonus',         icon: Star,       color: '#38bdf8', bg: 'rgba(56,189,248,0.06)',  border: 'rgba(56,189,248,0.2)'  },
  { key: 'loyalty',    label: 'Loyalty Bonus',      icon: Heart,      color: '#f87171', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)' },
];

export default function Withdraw({ user, isLiveMode, onRefreshUser, refreshTrigger }) {
  const [wallet, setWallet]             = useState({ protok: { profit: 0 } });
  const [amount, setAmount]             = useState('');
  const [address, setAddress]           = useState('');
  const [txPassword, setTxPassword]     = useState('');
  const [withdrawLogs, setWithdrawLogs] = useState([]);
  const [depositLogs, setDepositLogs]   = useState([]);
  const [transferLogs, setTransferLogs] = useState([]);
  const [cooldownHours, setCooldownHours] = useState(0);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [incomes, setIncomes]           = useState({
    available: 0, roi: 0, referral: 0, level: 0,
    fasttrack: 0, rank: 0, pool: 0, loyalty: 0,
  });
  const [historyTab, setHistoryTab]     = useState('withdraw');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const w = await api.getBalance(user.userId, isLiveMode);
        if (w) setWallet(w);

        const users  = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const dbUser = users.find(u => u.userId === user.userId);
        setAddress(dbUser?.walletAddress || '0x918F3aD343F818de4DB98c575Ee693C6Cf56bc8c');

        const txs = (await api.getTransactions(user.userId, isLiveMode)) || [];

        const wLogs = txs.filter(t => t.type === 'Withdrawal');
        const dLogs = txs.filter(t => t.type === 'Deposit');
        const tLogs = txs.filter(t => t.type === 'Transfer');
        setWithdrawLogs(wLogs);
        setDepositLogs(dLogs);
        setTransferLogs(tLogs);

        const sum = (type) => txs
          .filter(t => t.type === type && t.status === 'Completed')
          .reduce((acc, t) => acc + (t.amount || 0), 0);

        const available = w ? w.protok?.profit || 0 : 0;
        setIncomes({
          available,
          roi:       sum('ROI'),
          referral:  sum('DirectReward'),
          level:     sum('LevelReward'),
          fasttrack: sum('BinaryReward'),
          rank:      sum('RankBonus'),
          pool:      sum('PoolBonus'),
          loyalty:   sum('LoyaltyBonus'),
        });

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
    if (wallet.protok.profit < amt) { setError('Insufficient ProTok Profit balance.'); return; }
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

  const fee       = amount ? parseFloat(amount) * 0.05 : 0;
  const netPayout = amount ? parseFloat(amount) - fee : 0;
  const fmt = (v) => `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const statusColor = (s) => s === 'Completed' ? '#34d399' : s === 'Pending' ? '#f59e0b' : '#ef4444';

  return (
    <div className="page-container">

      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Withdraw <span className="gold-text-gradient">Profit &amp; Earnings</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Withdraw liquid commissions and daily ROI payouts directly to your crypto wallet under the compensation rules.
        </p>
      </div>

      {/* ── Income Summary Grid ── */}
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
          Income Breakdown
        </p>
        <div className="income-cards-grid">
          {INCOME_CARDS.map((card, i) => {
            const Icon  = card.icon;
            const value = incomes[card.key] || 0;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.18 } }}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  borderRadius: '14px',
                  padding: '16px 14px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  backdropFilter: 'blur(8px)',
                  position: 'relative', overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                <div style={{
                  position: 'absolute', top: '-16px', right: '-16px',
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: card.color, opacity: 0.08, filter: 'blur(16px)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: `${card.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={card.color} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{card.label}</div>
                  <div style={{
                    fontSize: card.key === 'available' ? '17px' : '15px',
                    fontWeight: 800,
                    color: card.key === 'available' ? card.color : value > 0 ? card.color : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
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
            { id: 'withdraw', label: 'Withdrawal History', icon: ArrowUpRight  },
            { id: 'deposit',  label: 'Deposit History',    icon: ArrowDownLeft },
            { id: 'transfer', label: 'Internal Transfers', icon: ArrowLeftRight },
          ].map(tab => {
            const active = historyTab === tab.id;
            const Icon   = tab.icon;
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
          {historyTab === 'withdraw' && <HistoryTable rows={withdrawLogs} cols={['TX ID','Amount','Fee (5%)','Status','Date']} type="withdraw" />}
          {historyTab === 'deposit'  && <HistoryTable rows={depositLogs}  cols={['TX ID','Amount','Description','Status','Date']} type="deposit"  />}
          {historyTab === 'transfer' && <HistoryTable rows={transferLogs} cols={['TX ID','Amount','Description','Status','Date']} type="transfer" />}
        </motion.div>
      </div>

      {/* ── 2-col: Form + Payout Logs ── */}
      <div className="responsive-grid-1-12" style={{ gap: '28px', alignItems: 'start' }}>

        {/* Form */}
        <motion.div
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="glass-card shifting-card"
          style={{ padding: '32px' }}
        >
          {/* Balance */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)',
            padding: '16px', borderRadius: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-grey)' }}>Available ProTok Profit:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)' }}>
              {fmt(wallet.protok?.profit)}
            </span>
          </div>

          {cooldownHours > 0 ? (
            <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} />
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>24h Withdrawal Cooldown Active</strong>
                <span style={{ fontSize: '11px' }}>You will be eligible for a new payout request in {cooldownHours.toFixed(1)} hours.</span>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} />
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>Withdrawals Eligible</strong>
                <span style={{ fontSize: '11px' }}>Payout triggers will be processed automatically within the hourly window check.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdraw}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>AMOUNT TO WITHDRAW (USDT)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="number" placeholder="Enter payout amount (Min $20)" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" style={{ paddingLeft: '40px', width: '100%' }} required />
              </div>
              {amount && !isNaN(amount) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>Transaction Fee (5%): <strong>${fee.toFixed(2)}</strong></span>
                  <span>Net Payout Amount: <strong>${netPayout.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>RECEIVING CRYPTO ADDRESS (USDT BEP20)</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="form-input" style={{ width: '100%' }} placeholder="0x..." required />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Note: Update your withdrawal address inside the "My Profile" tab if needed.</span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>TRANSACTION PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" placeholder="Enter transaction password (default: tx123)" value={txPassword} onChange={(e) => setTxPassword(e.target.value)} className="form-input" style={{ paddingLeft: '40px', width: '100%' }} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: '6px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', fontSize: '11px', marginBottom: '24px', alignItems: 'center' }}>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                opacity: cooldownHours > 0 ? 0.5 : 1,
                cursor: cooldownHours > 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting request...' : 'Confirm Withdrawal Request'}
              <ArrowUpRight size={16} />
            </button>
          </form>
        </motion.div>

        {/* Payout Logs */}
        <motion.div
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
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

/* Reusable history table */
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
              <td colSpan={cols.length} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No records found.</td>
            </tr>
          ) : (
            rows.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--gold-primary)' }}>{tx.id}</td>
                <td style={{ padding: '11px 16px', fontWeight: 700 }}>${tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                {type === 'withdraw'
                  ? <td style={{ padding: '11px 16px', color: 'var(--text-grey)' }}>${(tx.amount * 0.05).toFixed(2)}</td>
                  : <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontSize: '12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>
                }
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
