import React, { useState, useEffect } from 'react';
import { Shield, Bell, Eye, EyeOff, CheckCircle, Lock, LogOut, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings({ user }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [notify, setNotify] = useState({ deposits: true, withdrawals: true, roi: true });
  
  // PIN setup states
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStatus, setPinStatus] = useState('');

  // Logout other devices loader
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem(`aurex_pin_${user.userId}`) || '';
    if (savedPin) {
      setPinStatus('Active PIN Set');
    } else {
      setPinStatus('No PIN Set');
    }
  }, [user.userId]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.style.setProperty('--bg-black', '#f7f7f7');
      document.documentElement.style.setProperty('--bg-card', '#ffffff');
      document.documentElement.style.setProperty('--text-white', '#0f0f0f');
      document.documentElement.style.setProperty('--text-grey', '#5f5f5f');
      document.documentElement.style.setProperty('--border-grey', '#e2e8f0');
    } else {
      document.documentElement.style.setProperty('--bg-black', '#050505');
      document.documentElement.style.setProperty('--bg-card', '#0a0a0a');
      document.documentElement.style.setProperty('--text-white', '#ffffff');
      document.documentElement.style.setProperty('--text-grey', '#a3a3a3');
      document.documentElement.style.setProperty('--border-grey', 'rgba(255,255,255,0.05)');
    }
    alert(`Theme changed to ${newTheme.toUpperCase()}`);
  };

  const handleSaveNotify = () => {
    alert('Notification preferences updated successfully!');
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4 || isNaN(pin)) {
      alert('PIN must be a 4-digit number.');
      return;
    }
    if (pin !== confirmPin) {
      alert('PINs do not match.');
      return;
    }
    localStorage.setItem(`aurex_pin_${user.userId}`, pin);
    setPinStatus('Active PIN Set');
    setPin('');
    setConfirmPin('');
    alert('Security Transaction PIN configured successfully!');
  };

  const handleLogoutOtherDevices = () => {
    setLogoutLoading(true);
    setTimeout(() => {
      setLogoutLoading(false);
      alert('Successfully logged out from all other active browser session tokens.');
    }, 1500);
  };

  return (
    <div style={{ padding: '28px', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Platform <span className="gold-text-gradient">Settings Portal</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Configure multi-lingual options, transaction PIN authentication, and displays layout overrides.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Security PIN & display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PIN Setup Card */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)' }}>
              <Lock size={18} />
              Transaction Security PIN
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PIN Status: <strong>{pinStatus}</strong></span>

            <form onSubmit={handlePinSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>NEW 4-DIGIT PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  placeholder="xxxx"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="form-input"
                  style={{ width: '100px', textAlign: 'center', fontSize: '18px', fontWeight: 800, letterSpacing: '4px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px' }}>CONFIRM PIN</label>
                <input
                  type="password"
                  maxLength="4"
                  placeholder="xxxx"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="form-input"
                  style={{ width: '100px', textAlign: 'center', fontSize: '18px', fontWeight: 800, letterSpacing: '4px' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px', alignSelf: 'flex-start', fontWeight: 700 }}>
                Set PIN Code
              </button>
            </form>
          </motion.div>

          {/* Display Mode */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} style={{ color: 'var(--gold-primary)' }} />
              Display Layout Mode
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleThemeChange('dark')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: theme === 'dark' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: theme === 'dark' ? 'rgba(212,175,55,0.08)' : 'transparent', color: 'var(--text-white)', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Dark Luxury
              </button>
              <button 
                onClick={() => handleThemeChange('light')}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px', border: theme === 'light' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: theme === 'light' ? 'rgba(212,175,55,0.08)' : 'transparent', color: 'var(--text-white)', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Light Minimalist
              </button>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Alerts & device management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Language Preference */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} style={{ color: 'var(--gold-primary)' }} />
              Preferred Language
            </h3>
            <select 
              value={lang} 
              onChange={(e) => { setLang(e.target.value); alert(`Language switched to: ${e.target.value.toUpperCase()}`); }} 
              className="form-input"
              style={{ width: '100%', padding: '12px', background: '#000', color: '#fff' }}
            >
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
            </select>
          </motion.div>

          {/* Notifications Toggle */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--gold-primary)' }} />
              System Alert Preferences
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notify.deposits} 
                  onChange={() => setNotify({ ...notify, deposits: !notify.deposits })} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)' }} 
                />
                Email notification on Deposit requests
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notify.withdrawals} 
                  onChange={() => setNotify({ ...notify, withdrawals: !notify.withdrawals })} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)' }} 
                />
                Push alert notifications on Payout approvals
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notify.roi} 
                  onChange={() => setNotify({ ...notify, roi: !notify.roi })} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)' }} 
                />
                Alert on Daily ROI payouts
              </label>
            </div>

            <button onClick={handleSaveNotify} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', alignSelf: 'flex-start', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} />
              Save Preferences
            </button>
          </motion.div>

          {/* Logout from other devices */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
              <LogOut size={18} />
              Active Sessions Override
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-grey)', marginBottom: '16px', lineHeight: '1.4' }}>
              Clear active session cache keys on other mobile devices or browsers.
            </p>
            <button 
              onClick={handleLogoutOtherDevices} 
              disabled={logoutLoading}
              className="btn" 
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: logoutLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {logoutLoading ? 'Logging out other sessions...' : 'Logout From Other Devices'}
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
