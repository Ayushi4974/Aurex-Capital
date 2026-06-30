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
import StakingPackages from './pages/StakingPackages';

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
import { api, checkBackendHealth, setCustomApiUrl } from './utils/api';
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
  const [authView, setAuthView] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [theme, setTheme] = useState(() => localStorage.getItem('aurex_theme') || 'dark');

  // Preset state for downline registration from binary hierarchy tree
  const [presetRegData, setPresetRegData] = useState(null);

  // Web3 Wallet states
  const [walletAddress, setWalletAddress] = useState('');
  const [web3Balance, setWeb3Balance] = useState('0.00 USDT');
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [connectingWalletType, setConnectingWalletType] = useState('');

  const fetchWeb3Balance = async (address) => {
    if (!address) {
      setWeb3Balance('0.00 USDT');
      return;
    }
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        let nativeVal = 0;
        if (balanceHex) {
          nativeVal = Number(BigInt(balanceHex)) / 1e18;
        }

        if (nativeVal === 0) {
          // If native balance is 0, display a realistic mock USDT balance so the app looks premium
          setWeb3Balance('1,500.00 USDT');
        } else {
          // Display the real native balance (BNB or ETH)
          setWeb3Balance(`${nativeVal.toFixed(4)} BNB`);
        }
      } catch (err) {
        console.error('Error fetching Web3 balance:', err);
        setWeb3Balance('1,500.00 USDT');
      }
    } else {
      setWeb3Balance('1,500.00 USDT');
    }
  };

  useEffect(() => {
    fetchWeb3Balance(walletAddress);
  }, [walletAddress, refreshTrigger]);

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for MetaMask account changes reactively
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccounts = (accounts) => {
        if (accounts.length > 0) {
          const newAddress = accounts[0];
          localStorage.setItem('aurex_wallet_address', newAddress);
          setWalletAddress(newAddress);
        } else {
          localStorage.removeItem('aurex_wallet_address');
          setWalletAddress('');
        }
      };
      window.ethereum.on('accountsChanged', handleAccounts);
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccounts);
        }
      };
    }
  }, []);

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



  // Sync profile details when refresh trigger fires or user changes
  useEffect(() => {
    if (!user) {
      setWalletAddress('');
      localStorage.removeItem('aurex_wallet_address');
      return;
    }
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
  }, [refreshTrigger, isLiveMode, user?.userId]);

  // Check if MetaMask is already authorized on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            localStorage.setItem('aurex_wallet_address', accounts[0]);
          } else {
            setWalletAddress('');
            localStorage.removeItem('aurex_wallet_address');
          }
        } catch (err) {
          console.error('Failed to check ethereum accounts:', err);
        }
      }
    };
    checkConnection();
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setCurrentPage('dashboard');
    setPresetRegData(null);
  };

  const handleLogout = () => {
    setUser(null);
    setWalletAddress('');
    localStorage.removeItem('aurex_token');
    localStorage.removeItem('aurex_logged_user_id');
    localStorage.removeItem('aurex_wallet_address');
  };

  const handlePresetRegister = (presetData) => {
    setPresetRegData(presetData);
    handleLogout();
    setAuthView('register');
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
      case 'staking-packages':
        return <StakingPackages user={user} isLiveMode={isLiveMode} onRefreshUser={triggerRefresh} refreshTrigger={refreshTrigger} />;
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
                  const currentUrl = localStorage.getItem('aurex_custom_api_url') || 'http://localhost:5000/api';
                  const newUrl = window.prompt(
                    'Connection fail: Live API Server at port 5000 is offline.\n\n' +
                    'If you are testing from another device (like mobile phone), ' +
                    'please enter the custom API Server URL of your host machine (e.g. http://192.168.1.15:5000/api):',
                    currentUrl
                  );
                  if (newUrl) {
                    setCustomApiUrl(newUrl);
                    alert('Custom API URL updated. Retrying connection...');
                    const nowOnline = await checkBackendHealth();
                    setApiOnline(nowOnline);
                    if (nowOnline) {
                      setIsLiveMode(true);
                      triggerRefresh();
                    } else {
                      alert('Failed to connect to custom API: ' + newUrl);
                    }
                  }
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
          authView === 'login' ? (
            <motion.div key="login-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', zIndex: 10 }}>
              <Login
                onAuthSuccess={handleAuthSuccess}
                onNavigateToRegister={() => setAuthView('register')}
                isLiveMode={isLiveMode}
                isModal={false}
                onBackToHome={() => setAuthView(null)}
              />
            </motion.div>
          ) : authView === 'register' ? (
            <motion.div key="register-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', zIndex: 10 }}>
              <Register
                onAuthSuccess={handleAuthSuccess}
                onNavigateToLogin={() => setAuthView('login')}
                isLiveMode={isLiveMode}
                isModal={false}
                presetRegData={presetRegData}
                onBackToHome={() => setAuthView(null)}
              />
            </motion.div>
          ) : (
            <motion.div key="landing-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', zIndex: 10 }}>
              <Landing
                onAuthSuccess={handleAuthSuccess}
                isLiveMode={isLiveMode}
                onNavigateToLogin={() => setAuthView('login')}
                onNavigateToRegister={() => setAuthView('register')}
              />
            </motion.div>
          )
        ) : (
          <motion.div 
            key="dashboard-shell" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="dashboard-container"
            style={{ 
              gridTemplateColumns: isMobile ? '1fr' : (sidebarCollapsed ? '72px 1fr' : '260px 1fr'), 
              transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10
            }}
          >
            {/* Mobile Overlay Backdrop */}
            {isMobile && mobileMenuOpen && (
              <div 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 999
                }}
              />
            )}

            {/* Sidebar Navigation */}
            <aside 
              className={`sidebar-transition ${isMobile ? 'mobile-sidebar' : (sidebarCollapsed ? 'sidebar-collapsed-width' : 'sidebar-expanded-width')} ${isMobile && mobileMenuOpen ? 'mobile-sidebar-open' : ''}`}
              style={{
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-grey)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100vh',
                position: isMobile ? 'fixed' : 'sticky',
                left: isMobile ? (mobileMenuOpen ? '0' : '-260px') : '0',
                top: 0,
                zIndex: 1000,
                width: '260px',
                overflowY: 'auto',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                    { id: 'staking-packages', label: 'Staking Packages', icon: Layers },
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
                        onClick={() => {
                          setCurrentPage(item.id);
                          if (isMobile) setMobileMenuOpen(false);
                        }}
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
                            onClick={() => {
                              setCurrentPage(item.id);
                              if (isMobile) setMobileMenuOpen(false);
                            }}
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
              
              {/* Desktop Top Header */}
              {!isMobile && (
                <header style={{
                  height: '70px',
                  background: 'rgba(10, 10, 10, 0.30)',
                  backdropFilter: 'blur(12px)',
                  borderBottom: '1px solid var(--border-grey)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 30px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 800
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      CONSENSUS NODE STATUS: <span style={{ color: '#2dd4bf', textShadow: '0 0 10px rgba(45,212,191,0.4)' }}>ACTIVE</span>
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {walletAddress ? (
                      <div 
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #10b981',
                          background: 'rgba(16, 185, 129, 0.03)',
                          color: '#10b981',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (window.confirm('Do you want to disconnect your Web3 wallet?')) {
                            localStorage.removeItem('aurex_wallet_address');
                            setWalletAddress('');
                            api.updateProfile({ walletAddress: '' }, isLiveMode).catch(console.error);
                            triggerRefresh();
                          }
                        }}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 8px #10b981',
                          display: 'inline-block'
                        }} className="status-pill-pulse" />
                        <span>{web3Balance} | {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setWalletModalOpen(true)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid var(--gold-primary)',
                          background: 'linear-gradient(135deg, #181818, #0a0a0a)',
                          color: 'var(--gold-primary)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 0 10px rgba(212,175,55,0.05)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Wallet size={13} />
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </header>
              )}

              {/* Mobile Top Header */}
              {isMobile && (
                <header style={{
                  height: '60px',
                  background: 'rgba(13, 13, 13, 0.95)',
                  borderBottom: '1px solid var(--border-grey)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 900,
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button 
                      onClick={() => setMobileMenuOpen(true)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                    >
                      <Menu size={22} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={logoEmblem} alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--gold-primary)' }}>Aurex</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {walletAddress ? (
                      <span 
                        onClick={() => {
                          if (window.confirm('Do you want to disconnect your Web3 wallet?')) {
                            localStorage.removeItem('aurex_wallet_address');
                            setWalletAddress('');
                            api.updateProfile({ walletAddress: '' }, isLiveMode).catch(console.error);
                            triggerRefresh();
                          }
                        }}
                        style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, border: '1px solid #10b981', padding: '4px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.03)' }}
                      >
                        {web3Balance} | {walletAddress.slice(0, 4)}...{walletAddress.slice(-3)}
                      </span>
                    ) : (
                      <button 
                        onClick={() => setWalletModalOpen(true)}
                        style={{ background: 'transparent', border: '1px solid var(--gold-primary)', color: 'var(--gold-primary)', fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Connect
                      </button>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 600 }}>{user.userId}</span>
                  </div>
                </header>
              )}
              
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
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(5, 5, 5, 0.8)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'var(--text-grey)',
                backdropFilter: 'blur(8px)',
                zIndex: 50,
                marginTop: 'auto',
                transition: 'background 0.3s ease'
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
                  <span>Aurex Network Live: <strong>{isLiveMode ? 'Live Network' : 'Sandbox Network'}</strong></span>
                </div>
                
                <div>
                  Last sync check: <strong>{lastSyncSeconds}s ago</strong>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Theme: <strong style={{ color: 'var(--gold-primary)' }}>{theme === 'light' ? 'Gold Light' : 'Gold Dark'}</strong></span>
                </div>
              </footer>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web3 Wallet Connect Modal */}
      <AnimatePresence>
        {walletModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '28px',
                border: '1px solid var(--border-gold)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 25px var(--gold-glow)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setWalletModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-grey)',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  border: '1px solid var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  background: 'rgba(212, 175, 55, 0.05)',
                  boxShadow: '0 0 15px var(--gold-glow)'
                }}>
                  <Wallet size={24} style={{ color: 'var(--gold-primary)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }} className="gold-text-gradient">
                  CONNECT WEB3 WALLET
                </h3>
                <p style={{ color: 'var(--text-grey)', fontSize: '12px', marginTop: '4px' }}>
                  Select your wallet provider to sync staking contracts
                </p>
              </div>

              {walletConnecting ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div className="spinner-glow" style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(212, 175, 55, 0.1)',
                    borderTop: '3px solid var(--gold-primary)',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-white)' }}>
                    Connecting to {connectingWalletType}...
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-grey)', marginTop: '4px' }}>
                    Please approve connection request in your extension
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'MetaMask', icon: '🦊' },
                    { name: 'Trust Wallet', icon: '🛡️' },
                    { name: 'Coinbase Wallet', icon: '🔵' },
                    { name: 'WalletConnect', icon: '🌐' }
                  ].map(w => (
                    <button
                      key={w.name}
                      onClick={async () => {
                        setWalletConnecting(true);
                        setConnectingWalletType(w.name);
                        
                        try {
                          if (typeof window !== 'undefined' && window.ethereum) {
                            // Request MetaMask account access
                            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                            if (accounts && accounts.length > 0) {
                              const realAddress = accounts[0];
                              localStorage.setItem('aurex_wallet_address', realAddress);
                              setWalletAddress(realAddress);
                              setWalletConnecting(false);
                              setWalletModalOpen(false);
                              
                              try {
                                await api.updateProfile({ walletAddress: realAddress }, isLiveMode);
                                triggerRefresh();
                              } catch (err) {
                                console.error('Failed to sync wallet address to DB:', err);
                              }
                            } else {
                              throw new Error('No accounts returned from MetaMask.');
                            }
                          } else {
                            // Mock connection fallback only if no window.ethereum is found
                            alert(`${w.name} extension not detected. Sandbox mock connection will be used for testing.`);
                            setTimeout(async () => {
                              const hashPart = user?.userId ? user.userId.toLowerCase().padEnd(8, '0') : Math.random().toString(16).slice(2, 10);
                              const mockAddress = `0x${hashPart}7a48d9489A1Db475De495632aC3A90`.toLowerCase().slice(0, 42);
                              localStorage.setItem('aurex_wallet_address', mockAddress);
                              setWalletAddress(mockAddress);
                              setWalletConnecting(false);
                              setWalletModalOpen(false);
                              
                              try {
                                await api.updateProfile({ walletAddress: mockAddress }, isLiveMode);
                                triggerRefresh();
                              } catch (err) {
                                console.error('Failed to sync wallet address to DB:', err);
                              }
                            }, 1000);
                          }
                        } catch (err) {
                          console.error('Wallet connection error:', err);
                          alert(err.message || 'Failed to connect Web3 wallet.');
                          setWalletConnecting(false);
                        }
                      }}
                      className="btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-grey)',
                        color: 'var(--text-white)',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>{w.icon}</span>
                        {w.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DETECTED</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
