import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, Users, Award, DollarSign, Zap, Calendar, Clock, Landmark, Gift, ArrowUpRight, Megaphone, Activity, Trophy, Bell, ArrowDownLeft
} from 'lucide-react';
import { api } from '../utils/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar 
} from 'recharts';
import confetti from 'canvas-confetti';

// Smooth Count-Up Easing component for hero stats
function AnimatedCounter({ value, isRaw, isText }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isText || typeof value !== 'number') return;
    let startTimestamp = null;
    const startValue = 0;
    const endValue = value;
    if (endValue === 0) {
      setCount(0);
      return;
    }
    const duration = 1200; // ms
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo algorithm
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * (endValue - startValue) + startValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, isText]);

  if (isText) return <span>{value}</span>;
  if (isRaw) return <span>{Math.round(count).toLocaleString()}</span>;
  return <span>${count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

export default function Dashboard({ user, isLiveMode, onNavigate, refreshTrigger }) {
  const [stats, setStats] = useState({
    walletBalance: 0,
    activeInvestment: 0,
    totalRoiEarned: 0,
    withdrawableBalance: 0,
    totalTeamBusiness: 0,
    directReferralsCount: 0,
    totalTeamCount: 0,
    currentRank: 'Member',
    totalEarnings: 0,
    pendingWithdrawals: 0
  });

  const [txHistory, setTxHistory] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [roiChartData, setRoiChartData] = useState([]);
  const [earningsChartData, setEarningsChartData] = useState([]);
  const [investmentChartData, setInvestmentChartData] = useState([]);

  // Interactive Live Ticker and Flip States
  const [liveTickerMsg, setLiveTickerMsg] = useState('Aurex Capital node consensus synchronization: 100% OK.');
  const [flipIdx, setFlipIdx] = useState(0);

  // Stagger variants for hero cards entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // Stagger variants for activity logs
  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -15 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 90 } }
  };



  // Sync active message updates in ticker bar
  useEffect(() => {
    const msgs = [
      'AC100004 just earned $7.50 Daily ROI (0.75%) from Nexus Elite',
      'AC100007 completed $120.00 withdrawal payout request successfully',
      'New stakeholder AC100008 registered placement in Left leg under AC100002',
      'AC100002 staked an additional $500.00 package in Nexus Pro',
      'Weekly UTP Profit Share declared at +8.0% for all locked stakes',
      'AC100003 Direct Referral Reward +$120.00 credited to ProTok wallet',
      'Aurex Consensus Node completed block consensus verification: 100% OK'
    ];
    const interval = setInterval(() => {
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLiveTickerMsg(randomMsg);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Sync deposit/withdrawal flip index
  const depositWithdrawalTxs = txHistory.filter(t => ['Deposit', 'Withdrawal'].includes(t.type));
  const currentFlipTx = depositWithdrawalTxs[flipIdx];
  useEffect(() => {
    if (depositWithdrawalTxs.length <= 1) return;
    const interval = setInterval(() => {
      setFlipIdx(prev => (prev + 1) % depositWithdrawalTxs.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [depositWithdrawalTxs.length]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const walletData = await api.getBalance(user.userId, isLiveMode) || {
          captok: { main: 0, used: 0 },
          protok: { profit: 0, requested: 0, released: 0 }
        };
        const txs = await api.getTransactions(user.userId, isLiveMode) || [];
        const stakes = await api.getMyStakes(user.userId, isLiveMode) || [];
        const currentProfile = await api.getProfile(user.userId, isLiveMode) || user;

        // Cumulative aggregates
        const roiEarned = txs
          .filter(t => t.type === 'ROI' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const directRef = txs
          .filter(t => t.type === 'DirectReward' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const binaryReward = txs
          .filter(t => t.type === 'BinaryReward' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const levelReward = txs
          .filter(t => t.type === 'LevelReward' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const rankReward = txs
          .filter(t => t.type === 'RankReward' && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const otherReward = txs
          .filter(t => ['FastTrackReward', 'PoolReward', 'LoyaltyReward'].includes(t.type) && t.status === 'Completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalEarned = roiEarned + directRef + binaryReward + levelReward + rankReward + otherReward;

        const pendingWithdraw = txs
          .filter(t => t.type === 'Withdrawal' && t.status === 'Pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const teamBusiness = (currentProfile.business?.leftBusiness || 0) + (currentProfile.business?.rightBusiness || 0);

        setStats({
          walletBalance: walletData.captok?.main || 0,
          activeInvestment: walletData.captok?.used || 0,
          totalRoiEarned: roiEarned,
          withdrawableBalance: walletData.protok?.profit || 0,
          totalTeamBusiness: teamBusiness,
          directReferralsCount: currentProfile.business?.directTeam || 0,
          totalTeamCount: currentProfile.business?.totalTeam || 0,
          currentRank: currentProfile.rank || 'Member',
          totalEarnings: totalEarned,
          pendingWithdrawals: pendingWithdraw
        });

        setTxHistory(txs);

        // Fetch announcements
        const ann = localStorage.getItem('aurex_announcement') || 'Welcome to Aurex Capital! Build your Nexus downline networks today.';
        setAnnouncementText(ann);

        // Construct ROI Chart Data
        const roiTxs = [...txs]
          .filter(t => t.type === 'ROI' && t.status === 'Completed')
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        let cumulativeRoi = 0;
        const roiChart = roiTxs.map(t => {
          cumulativeRoi += t.amount;
          return {
            date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            ROI: t.amount,
            Cumulative: cumulativeRoi
          };
        }).slice(-7);
        
        const fallbackRoiData = [
          { date: 'Jun 16', ROI: 5, Cumulative: 10 },
          { date: 'Jun 17', ROI: 5, Cumulative: 15 },
          { date: 'Jun 18', ROI: 8, Cumulative: 23 },
          { date: 'Jun 19', ROI: 8, Cumulative: 31 },
          { date: 'Jun 20', ROI: 12, Cumulative: 43 },
          { date: 'Jun 21', ROI: 12, Cumulative: 55 },
          { date: 'Jun 22', ROI: 15, Cumulative: 70 }
        ];
        setRoiChartData(roiChart.length >= 2 ? roiChart : fallbackRoiData);

        // Construct Earnings Chart Data
        const earnTypes = ['DirectReward', 'LevelReward', 'FastTrackReward', 'PoolReward', 'RankReward', 'LoyaltyReward', 'BinaryReward'];
        const earnTxs = [...txs]
          .filter(t => earnTypes.includes(t.type) && t.status === 'Completed')
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const earningsChart = earnTxs.map(t => ({
          date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          Commissions: t.amount
        })).slice(-7);

        const fallbackEarningsData = [
          { date: 'Jun 16', Commissions: 50 },
          { date: 'Jun 17', Commissions: 0 },
          { date: 'Jun 18', Commissions: 150 },
          { date: 'Jun 19', Commissions: 80 },
          { date: 'Jun 20', Commissions: 0 },
          { date: 'Jun 21', Commissions: 250 },
          { date: 'Jun 22', Commissions: 180 }
        ];
        setEarningsChartData(earningsChart.length >= 2 ? earningsChart : fallbackEarningsData);

        // Construct Investment Trend Data
        let currentInv = 0;
        const invChart = [...txs]
          .filter(t => ['Staking', 'Unstake'].includes(t.type) && t.status === 'Completed')
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map(t => {
            if (t.type === 'Staking') currentInv += t.amount;
            if (t.type === 'Unstake') currentInv -= t.amount;
            return {
              date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              Staked: currentInv
            };
          }).slice(-7);

        const fallbackInvestmentData = [
          { date: 'Jun 16', Staked: 500 },
          { date: 'Jun 17', Staked: 500 },
          { date: 'Jun 18', Staked: 1000 },
          { date: 'Jun 19', Staked: 1000 },
          { date: 'Jun 20', Staked: 1500 },
          { date: 'Jun 21', Staked: 1500 },
          { date: 'Jun 22', Staked: walletData.captok?.used || 2000 }
        ];
        setInvestmentChartData(invChart.length >= 2 ? invChart : fallbackInvestmentData);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchDashboardStats();
  }, [user, isLiveMode, refreshTrigger]);

  const cards = [
    { title: 'Total Wallet Balance', value: stats.walletBalance, icon: Wallet, color: 'var(--gold-primary)', glowClass: 'pulse-glow-gold' },
    { title: 'Active Investment', value: stats.activeInvestment, icon: Zap, color: 'var(--gold-primary)' },
    { title: 'Total ROI Earned', value: stats.totalRoiEarned, icon: TrendingUp, color: '#34d399', glowClass: 'pulse-glow-green' },
    { title: 'Withdrawable Balance', value: stats.withdrawableBalance, icon: DollarSign, color: '#34d399', glowClass: 'pulse-glow-green' },
    { title: 'Total Team Business', value: stats.totalTeamBusiness, icon: Award, color: 'var(--gold-primary)' },
    { title: 'Direct Referrals Count', value: stats.directReferralsCount, icon: Users, color: '#60a5fa', isRaw: true },
    { title: 'Total Team Count', value: stats.totalTeamCount, icon: Users, color: '#a78bfa', isRaw: true },
    { title: 'Current Rank', value: stats.currentRank, icon: Trophy, color: '#fbbf24', isRaw: true, isText: true, glowClass: 'pulse-glow-gold' },
    { title: 'Total Earnings', value: stats.totalEarnings, icon: Gift, color: '#2dd4bf', glowClass: 'pulse-glow-green' },
    { title: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Landmark, color: '#f87171' }
  ];

  const cappingLimit = stats.activeInvestment * 2.50;
  const currentEarnings = stats.totalEarnings;
  const cappingPercent = cappingLimit > 0 ? Math.min((currentEarnings / cappingLimit) * 100, 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cappingPercent / 100) * circumference;

  const getStatusPill = (type, status) => {
    let color = '#34d399';
    let bg = 'rgba(52, 211, 153, 0.08)';
    let border = 'rgba(52, 211, 153, 0.2)';
    
    if (type === 'Withdrawal') {
      color = '#f87171';
      bg = 'rgba(248, 113, 113, 0.08)';
      border = 'rgba(248, 113, 113, 0.2)';
    } else if (type === 'Staking') {
      color = 'var(--gold-primary)';
      bg = 'rgba(212, 175, 55, 0.08)';
      border = 'rgba(212, 175, 55, 0.2)';
    } else if (['ROI', 'DirectReward', 'BinaryReward', 'LevelReward', 'RankReward', 'FastTrackReward'].includes(type)) {
      color = '#60a5fa';
      bg = 'rgba(96, 165, 250, 0.08)';
      border = 'rgba(96, 165, 250, 0.2)';
    }
    
    return (
      <span 
        className="status-pill-pulse"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '9.5px',
          fontWeight: 700,
          color: color,
          backgroundColor: bg,
          border: `1px solid ${border}`
        }}
      >
        {type}
      </span>
    );
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative', zIndex: 5 }}>
      
      {/* Welcome header & marquee ticker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }} className="gold-text-gradient">
              Aurex Capital Dashboard
            </h1>
            <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '2px' }}>
              Secure unilevel downline portals and premium cryptocurrency investment packages dashboard.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)' }}
            >
              <Bell size={18} style={{ color: 'var(--gold-primary)' }} />
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            </motion.div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              USER ID: {user.userId}
            </span>
          </div>
        </div>

        {/* Scrolling news marquee */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', padding: '8px 16px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 800, background: 'var(--gold-primary)', color: 'black', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>News</span>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
            <span className="marquee-text" style={{ fontSize: '12px', color: 'var(--text-grey)' }}>
              {announcementText} &bull; Earn up to 250% capping return on active Nexus stakes &bull; Withdrawals are approved instantly with a 5% system fee &bull; Direct referral commissions credit up to 5 unilevel levels.
            </span>
          </div>
        </div>

        {/* Live Simulator Ticker Feed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--gold-secondary)' }}>
          <span className="status-pill-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2dd4bf', display: 'inline-block' }} />
          <span>Live Feed: <strong>{liveTickerMsg}</strong></span>
        </div>
      </div>

      {/* 10 Stat Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: "easeOut" } }}
              className="shifting-card" 
              style={{ 
                padding: '20px', 
                borderLeft: `3px solid ${c.color}`, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                minHeight: '110px',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-grey)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {c.title}
                </span>
                <Icon size={15} style={{ color: c.color }} />
              </div>
              <h3 
                className={c.glowClass || ''} 
                style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-white)', marginTop: '8px', zIndex: 2 }}
              >
                <AnimatedCounter value={c.value} isRaw={c.isRaw} isText={c.isText} />
              </h3>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section (3 trend charts) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* ROI Growth */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', height: '300px', borderRadius: '16px' }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Daily ROI Growth
          </h4>
          <ResponsiveContainer width="100%" height="88%">
            <AreaChart data={roiChartData}>
              <defs>
                <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-grey)" fontSize={10} />
              <YAxis stroke="var(--text-grey)" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0e0e0e', border: '1px solid var(--border-gold)', borderRadius: '6px' }} />
              <Area type="monotone" dataKey="Cumulative" stroke="#d4af37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRoi)" isAnimationActive={true} animationDuration={1300} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Earnings Trend */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', height: '300px', borderRadius: '16px' }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Commissions & Bonus Payouts
          </h4>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={earningsChartData}>
              <defs>
                <linearGradient id="colorBarComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#aa7c11" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-grey)" fontSize={10} />
              <YAxis stroke="var(--text-grey)" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0e0e0e', border: '1px solid var(--border-gold)', borderRadius: '6px' }} cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }} />
              <Bar dataKey="Commissions" fill="url(#colorBarComm)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1300} animationBegin={150} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Investment Trend */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.015, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '20px', height: '300px', borderRadius: '16px' }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Active Locked Investment Capital
          </h4>
          <ResponsiveContainer width="100%" height="88%">
            <LineChart data={investmentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="var(--text-grey)" fontSize={10} />
              <YAxis stroke="var(--text-grey)" fontSize={10} />
              <Tooltip contentStyle={{ background: '#0e0e0e', border: '1px solid var(--border-gold)', borderRadius: '6px' }} />
              <Line type="monotone" dataKey="Staked" stroke="#d4af37" strokeWidth={3} dot={{ fill: '#f3e5ab', r: 4 }} isAnimationActive={true} animationDuration={1300} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* Widgets & Activity Columns */}
      <div className="responsive-grid-12-1" style={{
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Latest Activity Logs */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px', borderRadius: '16px' }}
        >
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <Activity size={16} style={{ color: 'var(--gold-primary)' }} />
            Latest Account Activity Logs
          </h3>
          <motion.div 
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {txHistory.slice(0, 5).map((tx, idx) => (
              <motion.div 
                key={tx.id || idx} 
                variants={listItemVariants}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{tx.id}</span>
                    {getStatusPill(tx.type, tx.status)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '6px' }}>{tx.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '13px', color: tx.type === 'Withdrawal' ? '#f87171' : '#34d399' }}>
                    {tx.type === 'Withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </strong>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                    <Clock size={9} className="status-pill-pulse" />
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
            {txHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                No activity records found.
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Split widgets: 250% Capping Circle & Flip Operations Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Circular progress progress to 250% limit */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '16px' }}
          >
            <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-primary)', textTransform: 'uppercase', fontWeight: 700 }}>
              <Award size={16} />
              250% Nexus Capital Capping Limit
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              
              {/* Progress Circle SVG */}
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--gold-primary)" 
                    strokeWidth="6" 
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 3px var(--gold-glow))' }}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-white)' }}>{cappingPercent.toFixed(1)}%</span>
                  <span style={{ fontSize: '7px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.2px' }}>Cap limit</span>
                </div>
              </div>

              {/* Progress stats details */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12.5px', color: 'var(--text-grey)' }}>
                  Earnings Cap: <strong style={{ color: 'white' }}>${cappingLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong>
                </p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-grey)', marginTop: '4px' }}>
                  Accumulated: <strong style={{ color: 'var(--gold-primary)' }}>${currentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD</strong>
                </p>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${cappingPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-primary))', borderRadius: '2px' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flip Swap transaction card widget */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '20px', borderRadius: '16px' }}
          >
            <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-display)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-primary)' }}>
              <Landmark size={15} />
              Recent Network Operations (Live Feed)
            </h3>

            <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
              {currentFlipTx ? (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentFlipTx.id}
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 90 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', padding: '12px', borderRadius: '8px' }}
                  >
                    <div>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{currentFlipTx.id}</span>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-white)' }}>{currentFlipTx.type}</div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-grey)' }}>{currentFlipTx.description}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: currentFlipTx.type === 'Withdrawal' ? '#f87171' : '#34d399', fontSize: '13px' }}>
                        {currentFlipTx.type === 'Withdrawal' ? '-' : '+'}${currentFlipTx.amount.toLocaleString()}
                      </strong>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{currentFlipTx.status}</div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', width: '100%' }}>No deposit or payout requests logged.</div>
              )}
            </div>
          </motion.div>

        </div>

      </div>

    </div>
  );
}
