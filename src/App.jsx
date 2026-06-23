import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  Wallet, 
  Send, 
  ShoppingBag, 
  Zap, 
  Calendar, 
  Users, 
  GitFork, 
  Layers, 
  Gift, 
  Landmark, 
  HelpCircle, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  Activity, 
  TrendingUp, 
  LogOut,
  RefreshCw,
  Database,
  DollarSign,
  Trophy,
  Volume2,
  Award,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';

// User Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import WalletManager from './pages/Wallet';
import Stake from './pages/Stake';
import DailyROIHistory from './pages/DailyROIHistory';
import Network from './pages/Network';
import Hierarchy from './pages/Hierarchy';
import EarningsHistory from './pages/EarningsHistory';
import RankRewards from './pages/RankRewards';
import Support from './pages/Support';
import Settings from './pages/Settings';

// Admin Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import DepositRequests from './pages/DepositRequests';
import AdminWithdrawals from './pages/AdminWithdrawals';
import InvestmentManagement from './pages/InvestmentManagement';
import BonusManagement from './pages/BonusManagement';
import SupportAdmin from './pages/SupportAdmin';
import AdminSettings from './pages/AdminSettings';

import logoEmblem from './assets/logo_emblem.png';
import logoTransparent from './assets/logo_transparent.png';

// Utilities
import { api, checkBackendHealth } from './utils/api';
import { dbGetVirtualDate, dbAdvanceDate, dbRunDailyROICron, dbRunDailyBinaryCron } from './utils/simDb';

// Floating Canvas Particle Background Component
function CanvasParticles() {
  const canvasRef = React.useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    
    const particles = [];
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.4,
        vx: Math.random() * 0.15 - 0.075,
        vy: Math.random() * 0.15 - 0.075,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
    
    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      });
      animationFrameId = requestAnimationFrame(draw);
    }
    
    draw();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="particles-canvas" />;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [theme, setTheme] = useState(() => localStorage.getItem('aurex_theme') || 'dark');

  // Preset state for downline registration from binary hierarchy tree
  const [presetRegData, setPresetRegData] = useState(null);

  // Apply data-theme to <html> element whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aurex_theme', theme);
  }, [theme]);

  // Track mouse coordinates for cursor glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync elapsed seconds timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLastSyncSeconds(0);
  }, [refreshTrigger]);

  // Fake "live data" streaming effect (increments withdrawable profit balance by $0.01-$0.05 every 8 seconds)
  useEffect(() => {
    if (isLiveMode || !user) return;
    const interval = setInterval(() => {
      setUser(prev => {
        if (!prev) return null;
        const increment = parseFloat((Math.random() * 0.05 + 0.01).toFixed(2));
        const newProfit = parseFloat((prev.wallet.protok.profit + increment).toFixed(2));
        
        // Persist to LocalStorage
        const dbUsers = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const matchIdx = dbUsers.findIndex(u => u.userId === prev.userId);
        if (matchIdx !== -1) {
          dbUsers[matchIdx].wallet.protok.profit = newProfit;
          localStorage.setItem('aurex_users', JSON.stringify(dbUsers));
        }
        
        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            protok: {
              ...prev.wallet.protok,
              profit: newProfit
            }
          }
        };
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [user?.userId, isLiveMode]);



  // Sync profile details when refresh trigger fires
  useEffect(() => {
    if (!user) return;
    const syncProfile = async () => {
      try {
        const profile = await api.getProfile(user.userId, isLiveMode);
        if (profile) {
          setUser(profile);
        }
      } catch (err) {
        console.error('Failed to sync profile status:', err);
      }
    };
    syncProfile();
  }, [refreshTrigger, isLiveMode]);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentPage('dashboard');
    setPresetRegData(null);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aurex_token');
    localStorage.removeItem('aurex_logged_user_id');
  };

  const handlePresetRegister = (presetData) => {
    setPresetRegData(presetData);
    handleLogout();
    setShowRegister(true);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Cron Simulation Panel Triggers
  const handleSimAdvanceDay = () => {
    const nextDate = dbAdvanceDate();
    alert(`System clock advanced by 1 Day. Virtual Date: ${nextDate.toDateString()}`);
    triggerRefresh();
  };

  const handleSimRunROICron = () => {
    const res = dbRunDailyROICron();
    alert(`Daily ROI Cron executed! Paid out: $${res.totalDistributed} to ${res.paidCount} stakes.`);
    triggerRefresh();
  };

  const handleSimRunBinaryCron = () => {
    const res = dbRunDailyBinaryCron();
    alert(`Daily Binary Matching Cron executed! Matches found: ${res.matchesCount}. matching rewards paid: $${res.totalPaid}`);
    triggerRefresh();
  };

  const renderActivePage = () => {
    if (!user) return null;

    switch (currentPage) {
      // User Backoffice Pages (12 Pages)
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'profile':
        return <Profile user={user} />;
      case 'stake':
        return <Stake user={user} isLiveMode={isLiveMode} onRefreshUser={triggerRefresh} refreshTrigger={refreshTrigger} />;
      case 'daily-roi':
        return <DailyROIHistory user={user} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'referrals':
        return <Network user={user} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'hierarchy':
        return <Hierarchy user={user} isLiveMode={isLiveMode} onPresetRegister={handlePresetRegister} />;
      case 'earnings':
        return <EarningsHistory user={user} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'withdraw':
        return <WalletManager user={user} isLiveMode={isLiveMode} onRefreshUser={triggerRefresh} refreshTrigger={refreshTrigger} />;
      case 'rank-rewards':
        return <RankRewards user={user} />;
      case 'support':
        return <Support user={user} />;
      case 'settings':
        return <Settings user={user} theme={theme} onThemeChange={setTheme} />;

      // Admin Backoffice Pages (8 Pages)
      case 'admin-dashboard':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <AdminDashboard isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'admin-users':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <UserManagement isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'admin-investments':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <InvestmentManagement isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'admin-deposits':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <DepositRequests isLiveMode={isLiveMode} onRefreshUser={triggerRefresh} refreshTrigger={refreshTrigger} />;
      case 'admin-withdrawals':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <AdminWithdrawals isLiveMode={isLiveMode} onRefreshUser={triggerRefresh} refreshTrigger={refreshTrigger} />;
      case 'admin-bonuses':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <BonusManagement isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'admin-support':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <SupportAdmin isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      case 'admin-settings':
        if (user.role !== 'admin') return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
        return <AdminSettings isLiveMode={isLiveMode} refreshTrigger={refreshTrigger} />;
      
      default:
        return <Dashboard user={user} onNavigate={setCurrentPage} isLiveMode={isLiveMode} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-black)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Global Canvas Particle Background */}
      <CanvasParticles />

      {/* Global Cursor Glow */}
      <div className="cursor-glow cursor-glow-animate" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Floating Status / Connection Override controls */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px'
      }}>
        <div className="glass-card" style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          background: 'rgba(10, 10, 10, 0.95)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isLiveMode ? '#10b981' : 'var(--gold-primary)',
            boxShadow: isLiveMode ? '0 0 10px #10b981' : '0 0 10px var(--gold-primary)',
            display: 'inline-block'
          }} className="status-pill-pulse" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-white)' }}>
            {isLiveMode ? 'LIVE PRODUCTION' : 'LIVE DEMO ACTIVE'}
          </span>
          <button
            onClick={async () => {
              if (!isLiveMode) {
                const online = await checkBackendHealth();
                setApiOnline(online);
                if (!online) {
                  alert('Connection fail: Live API Server at port 5000 is offline.');
                  return;
                }
                setIsLiveMode(true);
              } else {
                setIsLiveMode(false);
              }
              triggerRefresh();
            }}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '9px',
              fontWeight: 700,
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-grey)',
              cursor: 'pointer'
            }}
          >
            Toggle
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="landing-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', zIndex: 10 }}>
            <Landing onAuthSuccess={handleAuthSuccess} isLiveMode={isLiveMode} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard-shell" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="dashboard-container"
            style={{ 
              gridTemplateColumns: sidebarCollapsed ? '72px 1fr' : '260px 1fr', 
              transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10
            }}
          >
            {/* Sidebar Navigation */}
            <aside 
              className={`sidebar-transition ${sidebarCollapsed ? 'sidebar-collapsed-width' : 'sidebar-expanded-width'}`}
              style={{
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-grey)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100vh',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                overflowY: 'auto',
                transition: 'background 0.3s ease'
              }}
            >
              <div>
                {/* Branding Logo */}
                <div style={{ 
                  padding: sidebarCollapsed ? '16px 8px' : '24px', 
                  borderBottom: '1px solid var(--border-grey)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                  gap: '12px' 
                }}>
                  {!sidebarCollapsed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.05)', boxShadow: '0 0 12px var(--gold-glow)', overflow: 'hidden' }}>
                        <img src={logoEmblem} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', margin: 0, padding: 0 }} className="gold-text-gradient">Aurex Capital</h3>
                      </div>
                    </div>
                  ) : (
                    <div 
                      style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.05)', boxShadow: '0 0 10px var(--gold-glow)', cursor: 'pointer', overflow: 'hidden' }} 
                      onClick={() => setSidebarCollapsed(false)}
                      title="Expand Menu"
                    >
                      <img src={logoEmblem} alt="Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <button 
                      onClick={() => setSidebarCollapsed(true)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Collapse Menu"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                </div>

                {/* Sidebar User Links */}
                {!sidebarCollapsed && (
                  <div style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', marginTop: '14px' }}>
                    USER ACCOUNT CONTROLS
                  </div>
                )}
                <nav style={{ padding: sidebarCollapsed ? '10px 6px' : '0 12px 14px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: sidebarCollapsed ? '14px' : '0' }}>
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'withdraw', label: 'Withdraw', icon: Wallet },
                    { id: 'stake', label: 'Investment / Stake', icon: Zap },
                    { id: 'daily-roi', label: 'ROI History', icon: Calendar },
                    { id: 'referrals', label: 'Team / Referrals', icon: Users },
                    { id: 'hierarchy', label: 'Binary Tree', icon: GitFork },
                    { id: 'earnings', label: 'Earnings', icon: Gift },
                    { id: 'rank-rewards', label: 'Rewards & Ranks', icon: Award },
                    { id: 'support', label: 'Support', icon: HelpCircle },
                    { id: 'settings', label: 'Settings', icon: SettingsIcon },
                    { id: 'profile', label: 'My Profile', icon: User }
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`sidebar-nav-btn ${isActive ? 'active-tab' : ''}`}
                        style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: sidebarCollapsed ? 'center' : 'flex-start', 
                          gap: '10px', 
                          padding: '10px 14px', 
                          borderRadius: '6px', 
                          border: 'none',
                          background: 'transparent',
                          color: isActive ? 'var(--gold-primary)' : 'var(--text-grey)',
                          fontSize: '12px', 
                          fontWeight: 600, 
                          textAlign: 'left', 
                          cursor: 'pointer', 
                          width: '100%'
                        }}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon size={16} style={{ flexShrink: 0 }} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </nav>

                {/* Admin backoffice Links (Only visible to admin role) */}
                {(user.role === 'admin') && (
                  <>
                    {!sidebarCollapsed && (
                      <div style={{ padding: '12px 16px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
                        ADMIN OVERRIDES
                      </div>
                    )}
                    <nav style={{ padding: sidebarCollapsed ? '10px 6px' : '0 12px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {[
                        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: TrendingUp },
                        { id: 'admin-users', label: 'User Management', icon: UserCheck },
                        { id: 'admin-investments', label: 'Investment Management', icon: Zap },
                        { id: 'admin-deposits', label: 'Deposits Approval', icon: Landmark },
                        { id: 'admin-withdrawals', label: 'Withdrawals Approval', icon: DollarSign },
                        { id: 'admin-bonuses', label: 'Bonus Management', icon: Trophy },
                        { id: 'admin-support', label: 'Support Tickets', icon: HelpCircle },
                        { id: 'admin-settings', label: 'Admin Settings', icon: SettingsIcon }
                      ].map(item => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            className={`sidebar-nav-btn ${isActive ? 'active-tab' : ''}`}
                            style={{
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: sidebarCollapsed ? 'center' : 'flex-start', 
                              gap: '10px', 
                              padding: '10px 14px', 
                              borderRadius: '6px', 
                              border: 'none',
                              background: 'transparent',
                              color: isActive ? 'var(--gold-primary)' : 'var(--text-grey)',
                              fontSize: '12px', 
                              fontWeight: 600, 
                              textAlign: 'left', 
                              cursor: 'pointer', 
                              width: '100%'
                            }}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon size={16} style={{ flexShrink: 0 }} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                          </button>
                        );
                      })}
                    </nav>
                  </>
                )}
              </div>

              {/* Sidebar Profile & Logout Footer */}
              <div style={{ padding: sidebarCollapsed ? '16px 8px' : '16px', borderTop: '1px solid var(--border-grey)', background: 'rgba(0,0,0,0.15)' }}>
                {!sidebarCollapsed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div className="avatar-ring-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="avatar-ring-border"></div>
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                        alt="Profile Avatar"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', zIndex: 2, border: '1px solid var(--border-gold)', background: 'var(--bg-card)' }}
                      />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-white)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</p>
                      <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{user.userId}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                    <div className="avatar-ring-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`${user.name} (${user.userId})`}>
                      <div className="avatar-ring-border"></div>
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                        alt="Profile Avatar"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', zIndex: 2, border: '1px solid var(--border-gold)', background: 'var(--bg-card)' }}
                      />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleLogout} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    color: '#f87171', 
                    fontSize: '12px', 
                    cursor: 'pointer' 
                  }}
                  title={sidebarCollapsed ? "Sign Out" : undefined}
                >
                  <LogOut size={12} />
                  {!sidebarCollapsed && <span>Sign Out</span>}
                </button>
              </div>
            </aside>

            {/* Main Content Body */}
            <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', background: theme === 'light' ? 'var(--bg-main)' : 'radial-gradient(circle at top right, #0e0a02 0%, #050505 60%)', overflowY: 'auto', transition: 'background 0.3s ease' }}>
              
              {/* Virtual Clock Display (Demo mode only) */}


              {/* Views rendering */}
              <div style={{ flex: 1 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderActivePage()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sync and Node Status Footer Bar */}
              <footer style={{
                padding: '12px 24px',
                borderTop: '1px solid var(--border-grey)',
                background: 'rgba(5, 5, 5, 0.8)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--text-grey)',
                backdropFilter: 'blur(8px)',
                zIndex: 50,
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #10b981'
                  }} className="status-pill-pulse" />
                  <span>Aurex Network Live: <strong>{isLiveMode ? 'Production Node' : 'Sandbox Node'}</strong></span>
                </div>
                
                <div>
                  Last sync check: <strong>{lastSyncSeconds}s ago</strong>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Theme: <strong style={{ color: 'var(--gold-primary)' }}>Gold Dark</strong></span>
                </div>
              </footer>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
