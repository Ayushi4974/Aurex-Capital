import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, Calendar, RefreshCw, Send, DollarSign, Award, Users, Play, Clock, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import { dbAdvanceDate, dbReset, dbGetVirtualDate, dbRunDailyROICron, dbRunDailyBinaryCron } from '../utils/simDb';

export default function Admin({ isLiveMode, onRefreshUser, refreshTrigger }) {
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  
  // Weekly PSP declaration form
  const [pspRate, setPspRate] = useState('');
  
  // Virtual clock stats
  const [vDate, setVDate] = useState(new Date());

  // Loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAdminData = async () => {
    try {
      const uList = await api.adminGetUsers(isLiveMode);
      setUsers(uList);

      const dList = await api.adminGetDeposits(isLiveMode);
      setDeposits(dList);

      const wList = await api.adminGetWithdrawals(isLiveMode);
      setWithdrawals(wList);

      // Fetch simulated virtual clock date
      if (!isLiveMode) {
        setVDate(dbGetVirtualDate());
      } else {
        setVDate(new Date());
      }
    } catch (err) {
      console.error('Error fetching admin panels:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isLiveMode, refreshTrigger]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  // Actions: Approve Deposit
  const handleApproveDeposit = async (txId) => {
    setActionLoading(true);
    try {
      await api.adminApproveDeposit(txId, isLiveMode);
      showMsg('success', 'Deposit request approved successfully. Funds credited to CapTok Main.');
      fetchAdminData();
      onRefreshUser();
    } catch (err) {
      showMsg('error', err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions: Reject Deposit
  const handleRejectDeposit = async (txId) => {
    setActionLoading(true);
    try {
      await api.adminRejectDeposit(txId, isLiveMode);
      showMsg('success', 'Deposit request rejected.');
      fetchAdminData();
    } catch (err) {
      showMsg('error', err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions: Approve/Reject Withdrawal
  const handleProcessWithdrawal = async (txId, status) => {
    setActionLoading(true);
    try {
      await api.adminProcessWithdrawal(txId, status, isLiveMode);
      showMsg('success', `Withdrawal request ${status === 'Completed' ? 'approved' : 'rejected'}.`);
      fetchAdminData();
      onRefreshUser();
    } catch (err) {
      showMsg('error', err.message || 'Withdrawal processing failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions: Declare UTP PSP
  const handleDeclarePSP = async (e) => {
    e.preventDefault();
    const rate = parseFloat(pspRate);
    if (isNaN(rate) || rate <= 0) return;

    setActionLoading(true);
    try {
      const res = await api.adminDeclarePSP(rate, isLiveMode);
      showMsg('success', `Successfully distributed ${rate}% UTP PSP to eligible stakes! Paid out $${res.totalDistributed || 0} to ${res.paidCount || 0} stakes.`);
      setPspRate('');
      fetchAdminData();
      onRefreshUser();
    } catch (err) {
      showMsg('error', err.message || 'PSP declaration failed');
    } finally {
      setActionLoading(false);
    }
  };

  // SIMULATOR CONTROLS (Only available in local simulated mode)
  const handleAdvanceDay = () => {
    const nextDate = dbAdvanceDate();
    setVDate(nextDate);
    showMsg('success', `System Clock advanced by 1 Day. Virtual Date is now: ${nextDate.toDateString()}`);
    fetchAdminData();
    onRefreshUser();
  };

  const handleRunROICron = () => {
    const res = dbRunDailyROICron();
    showMsg('success', `Daily DRP/FTP ROI Cron Ran successfully! Distributed daily slab returns to ${res.paidCount} stakes. Paid out: $${res.totalDistributed}`);
    fetchAdminData();
    onRefreshUser();
  };

  const handleRunBinaryCron = () => {
    const res = dbRunDailyBinaryCron();
    showMsg('success', `Daily Binary Matching Cron Ran successfully! Processed matching legs for all active nodes. Matches found: ${res.matchesCount}. Total matching bonuses credited: $${res.totalPaid}`);
    fetchAdminData();
    onRefreshUser();
  };

  const handleResetDatabase = () => {
    if (window.confirm('Resetting the simulation will wipe out all temporary user stakes, registrations, and transactions. Continue?')) {
      dbReset();
      showMsg('success', 'Simulation database reset back to initial preloaded layout.');
      fetchAdminData();
      onRefreshUser();
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Admin & <span className="gold-text-gradient">Control Center</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Approve transactions, declare weekly profit shares, and manage node registrations
        </p>
      </div>

      {/* Msg banner */}
      {msg.text && (
        <div style={{
          background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: msg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          padding: '14px',
          borderRadius: '8px',
          color: msg.type === 'success' ? '#34d399' : '#f87171',
          marginBottom: '28px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {msg.text}
        </div>
      )}

      {/* Simulator Control Panel (Exclusive to Demo Mode) */}
      {!isLiveMode ? (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', border: '1px solid var(--gold-primary)', boxShadow: '0 0 20px rgba(212,175,55,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
            <Clock size={20} />
            MLM Cron & Time Travel Simulator Sandbox
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-grey)', marginBottom: '24px' }}>
            Since the app is running in local simulation, use this panel to jump forward in time and manually trigger midnight cron schedules. This lets you immediately inspect how ROI and matching payouts accumulate down the binary tree!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Clock display */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-grey)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>VIRTUAL SYSTEM TIME</span>
              <h4 style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: 'var(--gold-primary)' }}>
                {vDate.toDateString()}
              </h4>
            </div>

            {/* Fast Forward 1 day */}
            <button onClick={handleAdvanceDay} className="btn btn-secondary" style={{ height: '56px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Clock size={18} />
              Jump 1 Day Forward
            </button>

            {/* Run Daily ROI */}
            <button onClick={handleRunROICron} className="btn btn-secondary" style={{ height: '56px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Play size={18} />
              Run Daily ROI Cron
            </button>

            {/* Run Binary Cron */}
            <button onClick={handleRunBinaryCron} className="btn btn-secondary" style={{ height: '56px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RefreshCw size={18} />
              Run Binary Matching Cron
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleResetDatabase} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>
              Reset Simulation Database
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '16px',
          borderRadius: '8px',
          color: '#34d399',
          fontSize: '13px',
          marginBottom: '32px'
        }}>
          Live mode connection active. The cron schedules will run automatically via `node-cron` on the Express API server (Daily ROI at 12:00 AM, Daily Binary at 1:00 AM).
        </div>
      )}

      {/* Layout: Approvals and PSP Declare */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '28px',
        alignItems: 'start',
        marginBottom: '40px'
      }}>
        {/* Left: Approvals grid */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
            Pending Deposits ({deposits.length})
          </h3>

          <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>User ID</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                  <th style={{ padding: '8px' }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No deposits waiting approval.
                    </td>
                  </tr>
                ) : (
                  deposits.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{d.userId}</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>${d.amount}</td>
                      <td style={{ padding: '8px', color: 'var(--text-grey)' }}>{d.description}</td>
                      <td style={{ padding: '8px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleApproveDeposit(d.id)} disabled={actionLoading} style={{ background: '#10b981', border: 'none', color: 'black', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => handleRejectDeposit(d.id)} disabled={actionLoading} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
            Pending Withdrawals ({withdrawals.length})
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>User ID</th>
                  <th style={{ padding: '8px' }}>Amount</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No withdrawals waiting process.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{w.userId}</td>
                      <td style={{ padding: '8px', fontWeight: 700 }}>${w.amount}</td>
                      <td style={{ padding: '8px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleProcessWithdrawal(w.id, 'Completed')} disabled={actionLoading} style={{ background: '#10b981', border: 'none', color: 'black', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                          Approve
                        </button>
                        <button onClick={() => handleProcessWithdrawal(w.id, 'Rejected')} disabled={actionLoading} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Declare PSP */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '16px', color: 'var(--gold-primary)' }}>
            Declare Weekly UTP PSP
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginBottom: '20px' }}>
            Declare a profit sharing percentage manually. Eligible stakes are Unit Token Plan (UTP) packages created before Monday (00:00:00) of the current week.
          </p>

          <form onSubmit={handleDeclarePSP}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                PSP RATE (PERCENTAGE %)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 4.5"
                value={pspRate}
                onChange={(e) => setPspRate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
              {actionLoading ? 'Declaring...' : 'Distribute Weekly Profits'}
            </button>
          </form>
        </div>
      </div>

      {/* Users table list */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px' }}>
          Registered Downline Nodes ({users.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-grey)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 6px' }}>User ID</th>
                <th style={{ padding: '10px 6px' }}>Name</th>
                <th style={{ padding: '10px 6px' }}>Sponsor</th>
                <th style={{ padding: '10px 6px' }}>Parent (Tree)</th>
                <th style={{ padding: '10px 6px' }}>Leg</th>
                <th style={{ padding: '10px 6px' }}>CapTok Main</th>
                <th style={{ padding: '10px 6px' }}>ProTok Profit</th>
                <th style={{ padding: '10px 6px' }}>Left Business</th>
                <th style={{ padding: '10px 6px' }}>Right Business</th>
                <th style={{ padding: '10px 6px' }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>{u.userId}</td>
                  <td style={{ padding: '10px 6px' }}>{u.name}</td>
                  <td style={{ padding: '10px 6px', color: 'var(--text-grey)' }}>{u.sponsorId || '-'}</td>
                  <td style={{ padding: '10px 6px', color: 'var(--text-grey)' }}>{u.parentId || '-'}</td>
                  <td style={{ padding: '10px 6px' }}>
                    {u.placement ? (
                      <span style={{
                        padding: '1px 5px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: u.placement === 'Left' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)',
                        color: u.placement === 'Left' ? 'var(--gold-primary)' : 'var(--text-white)'
                      }}>
                        {u.placement}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>${u.wallet.captok.main}</td>
                  <td style={{ padding: '10px 6px', color: '#10b981', fontWeight: 600 }}>${u.wallet.protok.profit.toFixed(2)}</td>
                  <td style={{ padding: '10px 6px' }}>${u.business.leftBusiness}</td>
                  <td style={{ padding: '10px 6px' }}>${u.business.rightBusiness}</td>
                  <td style={{ padding: '10px 6px' }}>
                    <span style={{
                      color: u.isActive ? '#34d399' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
