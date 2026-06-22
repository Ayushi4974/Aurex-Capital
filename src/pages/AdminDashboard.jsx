import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Activity, Landmark, Bell, HelpCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ isLiveMode, refreshTrigger }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestments: 0,
    totalWithdrawals: 0,
    totalDeposits: 0,
    dailyRevenue: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersList = await api.adminGetUsers(isLiveMode);
        const stakesList = await api.adminGetStakes(isLiveMode);
        
        // Fetch all transactions to get deposits & withdrawals sums
        const allTransactions = JSON.parse(localStorage.getItem('aurex_transactions') || '[]');
        
        const activeUsersCount = usersList.filter(u => u.isActive).length;
        const totalInvest = stakesList.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.amount, 0);

        const depositsCompleted = allTransactions
          .filter(t => t.type === 'Deposit' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const withdrawalsCompleted = allTransactions
          .filter(t => t.type === 'Withdrawal' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        // Daily revenue: sum of stakes created today (virtual date)
        const virtualDateStr = localStorage.getItem('aurex_virtual_date') || new Date().toISOString();
        const virtualDay = new Date(virtualDateStr).toDateString();
        const dailyRev = stakesList
          .filter(s => new Date(s.createdAt).toDateString() === virtualDay)
          .reduce((sum, s) => sum + s.amount, 0);

        // Pending requests count: pending deposits & pending withdrawals
        const pendingCount = allTransactions.filter(t => t.status === 'Pending').length;

        setStats({
          totalUsers: usersList.length,
          activeUsers: activeUsersCount,
          totalInvestments: totalInvest,
          totalWithdrawals: withdrawalsCompleted,
          totalDeposits: depositsCompleted,
          dailyRevenue: dailyRev,
          pendingRequests: pendingCount
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [isLiveMode, refreshTrigger]);

  const mockChartData = [
    { name: 'Mon', Volume: stats.totalInvestments * 0.85 },
    { name: 'Tue', Volume: stats.totalInvestments * 0.90 },
    { name: 'Wed', Volume: stats.totalInvestments * 0.92 },
    { name: 'Thu', Volume: stats.totalInvestments * 0.95 },
    { name: 'Fri', Volume: stats.totalInvestments * 0.98 },
    { name: 'Sat', Volume: stats.totalInvestments * 0.99 },
    { name: 'Sun', Volume: stats.totalInvestments }
  ];

  const cards = [
    { title: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'var(--gold-primary)', isRaw: true },
    { title: 'Active Node Users', value: stats.activeUsers, icon: Users, color: '#34d399', isRaw: true },
    { title: 'Total Active Investments', value: stats.totalInvestments, icon: DollarSign, color: 'var(--gold-primary)' },
    { title: 'Total Released Withdrawals', value: stats.totalWithdrawals, icon: Landmark, color: '#f87171' },
    { title: 'Total Approved Deposits', value: stats.totalDeposits, icon: Landmark, color: '#34d399' },
    { title: 'Daily Staking Revenue', value: stats.dailyRevenue, icon: TrendingUp, color: 'var(--gold-primary)' },
    { title: 'Pending Queue Requests', value: stats.pendingRequests, icon: Bell, color: '#f59e0b', isRaw: true }
  ];

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Admin Dashboard <span className="gold-text-gradient">Overview</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Real-time global telemetry metrics, active staking portfolios, and system users activation queues.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px'
      }}>
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
              className="glass-card shifting-card" 
              style={{ padding: '20px', borderLeft: `3px solid ${c.color}`, display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '110px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {c.title}
                </span>
                <Icon size={16} style={{ color: c.color }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)', marginTop: '8px' }}>
                {c.isRaw ? c.value : `$${c.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h3>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: 'var(--gold-primary)' }} />
          Global Staking Volumes Progression
        </h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminChartG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--gold-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0e0e0e', border: '1px solid var(--border-gold)', color: 'var(--text-white)' }} />
              <Area type="monotone" dataKey="Volume" stroke="var(--gold-primary)" strokeWidth={2} fill="url(#adminChartG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
