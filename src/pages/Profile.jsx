import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Mail, Phone, Calendar, Lock, Globe, Wallet,
  ToggleLeft, ToggleRight, ShieldCheck, KeyRound, UserCircle2, BadgeCheck
} from 'lucide-react';

export default function Profile({ user }) {
  const [profile, setProfile] = useState(user);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmNew: '' });
  const [txPasswordData, setTxPasswordData] = useState({ oldTxPassword: '', newTxPassword: '', confirmNewTx: '' });
  const [walletAddr, setWalletAddr] = useState(user.walletAddress || '0x918F3aD343F818dE4DB98c575Ee693C6Cf56bc8c');
  const [country, setCountry] = useState(user.country || 'India');

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
    if (passwordData.newPassword !== passwordData.confirmNew) { setError('New passwords do not match!'); return; }
    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId);
    if (idx > -1) {
      if (users[idx].password !== passwordData.oldPassword) { setError('Incorrect old password!'); return; }
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
    if (txPasswordData.newTxPassword !== txPasswordData.confirmNewTx) { setTxError('New transaction passwords do not match!'); return; }
    const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
    const idx = users.findIndex(u => u.userId === user.userId);
    if (idx > -1) {
      const currentTxPassword = users[idx].transactionPassword || 'tx123';
      if (currentTxPassword !== txPasswordData.oldTxPassword) { setTxError('Incorrect old transaction password!'); return; }
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

  const iconBox = (Icon, color, bg) => (
    <div style={{
      width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 8px ${color}22`, flexShrink: 0
    }}>
      <Icon size={16} style={{ color }} />
    </div>
  );

  const infoRow = (Icon, label, value, iconColor = 'var(--gold-primary)') => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-grey)' }}>
      <Icon size={15} style={{ color: iconColor, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-white)', marginTop: '2px' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(212,175,55,0.15)'
        }}>
          <UserCircle2 size={26} style={{ color: 'var(--gold-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            My Account &amp; <span className="gold-text-gradient">Profile Settings</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Configure receiving addresses, sponsorship uplines, and secure transaction shields.
          </p>
        </div>
      </div>

      <div className="responsive-grid-12-1" style={{ gap: '28px', alignItems: 'stretch' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Profile Card */}
          <motion.div
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '28px' }}
          >
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-grey)' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`}
                  alt="Profile Avatar"
                  style={{
                    width: '68px', height: '68px', borderRadius: '50%',
                    border: '2px solid var(--gold-primary)',
                    boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                    background: 'var(--bg-card)'
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px',
                  borderRadius: '50%', background: '#10b981', border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BadgeCheck size={11} style={{ color: 'white' }} />
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: '21px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{profile.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 700 }}>{profile.rank}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{profile.userId}</span>
                </div>
              </div>
            </div>

            <div>
              {infoRow(User, 'User ID', profile.userId)}
              {infoRow(User, 'Sponsor / Referrer ID', profile.sponsorId || 'System (Root)', '#60a5fa')}
              {infoRow(Mail, 'Email Address', profile.email || 'N/A', '#34d399')}
              {infoRow(Phone, 'Mobile Number', profile.mobile || 'N/A', '#a78bfa')}
              {infoRow(Calendar, 'Registration Date', new Date(profile.doj).toLocaleDateString(), '#f59e0b')}
              {infoRow(Globe, 'Country', country, '#2dd4bf')}
            </div>
          </motion.div>

          {/* Wallet address form */}
          <motion.div
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {iconBox(Wallet, 'var(--gold-primary)', 'rgba(212,175,55,0.08)')}
              Wallet Details &amp; Country Preference
            </h3>

            <form onSubmit={handleProfileDetailsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                  USDT RECEIVING WALLET ADDRESS (BEP20)
                </label>
                <input type="text" value={walletAddr} onChange={(e) => setWalletAddr(e.target.value)} className="form-input" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                  GEOGRAPHIC COUNTRY
                </label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="form-input" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '6px', fontSize: '13px', alignSelf: 'flex-start', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} />
                Save Profile Configuration
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <motion.div
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {iconBox(ShieldCheck, '#34d399', 'rgba(52,211,153,0.08)')}
              Security Preferences &amp; Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Google Authenticator (2FA)', desc: 'Request TOTP pin on rewards release withdrawals.', state: gAuth, set: setGAuth, icon: Shield, color: '#60a5fa' },
                { label: 'SMS Security Notifications', desc: 'Send text alerts on P2P credit transfers.', state: smsAuth, set: setSmsAuth, icon: Phone, color: '#34d399' },
                { label: 'Email Activity Reports', desc: 'Send daily logs digests of unilevel commissions.', state: emailNotif, set: setEmailNotif, icon: Mail, color: '#a78bfa' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {iconBox(item.icon, item.color, `${item.color}14`)}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{item.label}</span>
                      <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => item.set(!item.state)} style={{ background: 'transparent', border: 'none', color: item.state ? 'var(--gold-primary)' : 'var(--text-grey)', cursor: 'pointer' }}>
                    {item.state ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TRANSACTION WARNING THRESHOLD (USDT)
              </label>
              <select value={thresholdAmt} onChange={(e) => setThresholdAmt(e.target.value)} className="form-input"
                style={{ background: '#000', color: '#fff', fontSize: '12px' }}>
                <option value="100">Notify on transactions above $100</option>
                <option value="500">Notify on transactions above $500</option>
                <option value="1000">Notify on transactions above $1000</option>
                <option value="5000">Notify on transactions above $5000</option>
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Management full width */}
      <motion.div
        whileHover={{ y: -6, scale: 1.005, transition: { duration: 0.2, ease: 'easeOut' } }}
        className="glass-card shifting-card"
        style={{ padding: '32px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {iconBox(KeyRound, 'var(--gold-primary)', 'rgba(212,175,55,0.08)')}
          Password Management Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

          {/* Change Login Password */}
          <div style={{ background: 'var(--input-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-grey)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={15} style={{ color: '#60a5fa' }} />
              Change Login Password
            </h4>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Old Password', 'New Password', 'Confirm New Password'].map((lbl, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>{lbl.toUpperCase()}</label>
                  <input type="password" className="form-input" required
                    value={i === 0 ? passwordData.oldPassword : i === 1 ? passwordData.newPassword : passwordData.confirmNew}
                    onChange={(e) => setPasswordData({ ...passwordData, [i === 0 ? 'oldPassword' : i === 1 ? 'newPassword' : 'confirmNew']: e.target.value })} />
                </div>
              ))}
              {error && <p style={{ color: '#ef4444', fontSize: '12px' }}>{error}</p>}
              {success && <p style={{ color: '#10b981', fontSize: '12px' }}>{success}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Lock size={13} /> Update Login Password
              </button>
            </form>
          </div>

          {/* Change TX Password */}
          <div style={{ background: 'var(--input-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-grey)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={15} style={{ color: '#a78bfa' }} />
              Change Transaction Password
            </h4>
            <form onSubmit={handleTxPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Old Transaction Password (Default: tx123)', 'New Transaction Password', 'Confirm New Transaction Password'].map((lbl, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '4px', fontWeight: 600 }}>{lbl.toUpperCase()}</label>
                  <input type="password" className="form-input" required
                    value={i === 0 ? txPasswordData.oldTxPassword : i === 1 ? txPasswordData.newTxPassword : txPasswordData.confirmNewTx}
                    onChange={(e) => setTxPasswordData({ ...txPasswordData, [i === 0 ? 'oldTxPassword' : i === 1 ? 'newTxPassword' : 'confirmNewTx']: e.target.value })} />
                </div>
              ))}
              {txError && <p style={{ color: '#ef4444', fontSize: '12px' }}>{txError}</p>}
              {txSuccess && <p style={{ color: '#10b981', fontSize: '12px' }}>{txSuccess}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Shield size={13} /> Update Transaction Password
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
