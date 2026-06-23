import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail, Phone, Calendar, Lock, Globe, Wallet, ToggleLeft, ToggleRight, Eye, ShieldCheck } from 'lucide-react';

export default function Profile({ user }) {
  const [profile, setProfile] = useState(user);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });
  const [txPasswordData, setTxPasswordData] = useState({ oldTxPassword: '', newTxPassword: '', confirmNewTx: '' });
  const [walletAddr, setWalletAddr] = useState(user.walletAddress || '0x918F3aD343F818dE4DB98c575Ee693C6Cf56bc8c');
  const [country, setCountry] = useState(user.country || 'India');

  // Security Switches Mock States
  const [gAuth, setGAuth] = useState(false);
  const [smsAuth, setSmsAuth] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [thresholdAmt, setThresholdAmt] = useState('500');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [txSuccess, setTxSuccess] = useState('');
  const [txError, setTxError] = useState('');

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const currentDbUser = users.find(u => u.userId === user.userId);
    if (currentDbUser) {
      setProfile(currentDbUser);
      setWalletAddr(currentDbUser.walletAddress || '0x918F3aD343F818dE4DB98c575Ee693C6Cf56bc8c');
      setCountry(currentDbUser.country || 'India');
    }
  }, [user.userId]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNew) {
      setError('New passwords do not match!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId);

    if (idx > -1) {
      if (users[idx].password !== passwordData.oldPassword) {
        setError('Incorrect old password!');
        return;
      }
      users[idx].password = passwordData.newPassword;
      users[idx].plainPassword = passwordData.newPassword;
      localStorage.setItem('aurex_users', JSON.stringify(users));
      setSuccess('Login password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmNew: '' });
    } else {
      setError('Could not find staker profile.');
    }
  };

  const handleTxPasswordSubmit = (e) => {
    e.preventDefault();
    if (txPasswordData.newTxPassword !== txPasswordData.confirmNewTx) {
      setTxError('New transaction passwords do not match!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId);

    if (idx > -1) {
      const currentTxPassword = users[idx].transactionPassword || 'tx123';
      if (currentTxPassword !== txPasswordData.oldTxPassword) {
        setTxError('Incorrect old transaction password!');
        return;
      }
      users[idx].transactionPassword = txPasswordData.newTxPassword;
      localStorage.setItem('aurex_users', JSON.stringify(users));
      setTxSuccess('Transaction password updated successfully!');
      setTxPasswordData({ oldTxPassword: '', newTxPassword: '', confirmNewTx: '' });
    } else {
      setTxError('Could not find staker profile.');
    }
  };

  const handleProfileDetailsSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId);

    if (idx > -1) {
      users[idx].walletAddress = walletAddr;
      users[idx].country = country;
      localStorage.setItem('aurex_users', JSON.stringify(users));
      alert('Wallet address and Country configuration updated successfully!');
    } else {
      alert('Failed to update profile configurations.');
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          My Account & <span className="gold-text-gradient">Profile Settings</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Configure receiving addresses, sponsorship uplines, and secure transaction shields.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'stretch' }}>
        
        {/* Left Column: Profile Card & Wallet Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Profile Card */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`}
                alt="Profile Avatar"
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  border: '2px solid var(--gold-primary)',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.25)',
                  background: 'var(--bg-card)'
                }}
              />
              <div>
                <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{profile.name}</h2>
                <span style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600 }}>{profile.rank}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>USER ID</span>
                <p style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{profile.userId}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SPONSOR / REFERRER ID</span>
                <p style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: 'var(--gold-primary)' }}>{profile.sponsorId || 'System (Root)'}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EMAIL ADDRESS</span>
                <p style={{ fontSize: '14px', fontWeight: 650, marginTop: '2px' }}>{profile.email || 'N/A'}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MOBILE NUMBER</span>
                <p style={{ fontSize: '14px', fontWeight: 650, marginTop: '2px' }}>{profile.mobile || 'N/A'}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>REGISTRATION DATE</span>
                <p style={{ fontSize: '14px', fontWeight: 650, marginTop: '2px' }}>{new Date(profile.doj).toLocaleDateString()}</p>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-grey)', paddingBottom: '14px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>COUNTRY</span>
                <p style={{ fontSize: '14px', fontWeight: 650, marginTop: '2px' }}>{country}</p>
              </div>
            </div>
          </motion.div>

          {/* Form to update Country & Wallet address */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '16px', color: 'var(--gold-primary)' }}>
              Wallet Details & Country preference
            </h3>

            <form onSubmit={handleProfileDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                  USDT RECEIVING WALLET ADDRESS (BEP20)
                </label>
                <input
                  type="text"
                  value={walletAddr}
                  onChange={(e) => setWalletAddr(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                  GEOGRAPHIC COUNTRY
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '13px', alignSelf: 'flex-start', fontWeight: 700 }}>
                Save Profile Configuration
              </button>
            </form>
          </motion.div>

        </div>

        {/* Right Column: Security Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Mock security switches */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
            className="glass-card shifting-card" 
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'space-between' }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)', marginBottom: '20px' }}>
                Security Preferences & Alerts
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Google Auth Switch */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Google Authenticator (2FA)</span>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Request TOTP pin on rewards release withdrawals.</p>
                  </div>
                  <button onClick={() => setGAuth(!gAuth)} style={{ background: 'transparent', border: 'none', color: gAuth ? 'var(--gold-primary)' : 'var(--text-grey)', cursor: 'pointer' }}>
                    {gAuth ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                {/* SMS Auth Switch */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>SMS Security Notifications</span>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Send text alerts on P2P credit transfers.</p>
                  </div>
                  <button onClick={() => setSmsAuth(!smsAuth)} style={{ background: 'transparent', border: 'none', color: smsAuth ? 'var(--gold-primary)' : 'var(--text-grey)', cursor: 'pointer' }}>
                    {smsAuth ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                {/* Email Switch */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Email Activity Reports</span>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Send daily logs digests of unilevel commissions.</p>
                  </div>
                  <button onClick={() => setEmailNotif(!emailNotif)} style={{ background: 'transparent', border: 'none', color: emailNotif ? 'var(--gold-primary)' : 'var(--text-grey)', cursor: 'pointer' }}>
                    {emailNotif ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Threshold limits */}
            <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '16px', marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TRANSACTION WARNING THRESHOLD (USDT)
              </label>
              <select 
                value={thresholdAmt}
                onChange={(e) => setThresholdAmt(e.target.value)}
                className="form-input"
                style={{ background: '#000', color: '#fff', fontSize: '12px' }}
              >
                <option value="100">Notify on transactions above $100</option>
                <option value="500">Notify on transactions above $500</option>
                <option value="1000">Notify on transactions above $1000</option>
                <option value="5000">Notify on transactions above $5000</option>
              </select>
            </div>
          </motion.div>

        </div>

      </div>

      {/* Password Management full width panel */}
      <motion.div 
        whileHover={{ y: -6, scale: 1.005, transition: { duration: 0.2, ease: "easeOut" } }}
        className="glass-card shifting-card" 
        style={{ padding: '32px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '24px', color: 'var(--gold-primary)' }}>
          Password Management Settings
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Change Login Password card */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-grey)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
              Change Login Password
            </h4>
            
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>OLD PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>NEW PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.confirmNew}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmNew: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
              {success && <p style={{ color: '#10b981', fontSize: '12px', marginBottom: '10px' }}>{success}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                Update Login Password
              </button>
            </form>
          </div>

          {/* Change Transaction Password card */}
          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-grey)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
              Change Transaction Password
            </h4>
            
            <form onSubmit={handleTxPasswordSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>OLD TRANSACTION PASSWORD (Default: tx123)</label>
                <input
                  type="password"
                  value={txPasswordData.oldTxPassword}
                  onChange={(e) => setTxPasswordData({ ...txPasswordData, oldTxPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>NEW TRANSACTION PASSWORD</label>
                <input
                  type="password"
                  value={txPasswordData.newTxPassword}
                  onChange={(e) => setTxPasswordData({ ...txPasswordData, newTxPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>CONFIRM NEW TRANSACTION PASSWORD</label>
                <input
                  type="password"
                  value={txPasswordData.confirmNewTx}
                  onChange={(e) => setTxPasswordData({ ...txPasswordData, confirmNewTx: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              {txError && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '10px' }}>{txError}</p>}
              {txSuccess && <p style={{ color: '#10b981', fontSize: '12px', marginBottom: '10px' }}>{txSuccess}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700 }}>
                Update Transaction Password
              </button>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
