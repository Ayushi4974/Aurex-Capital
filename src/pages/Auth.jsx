import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Auth({ onAuthSuccess, isLiveMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    email: '',
    mobile: '',
    sponsorId: 'AC100001', // default sponsor for demo ease
    placement: 'Left'
  });

  const [sponsorName, setSponsorName] = useState('');
  const [sponsorError, setSponsorError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate sponsor ID
  useEffect(() => {
    if (isLogin || !formData.sponsorId) {
      setSponsorName('');
      setSponsorError('');
      return;
    }

    const validateSponsor = async () => {
      try {
        const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const sponsor = users.find(u => u.userId.toUpperCase() === formData.sponsorId.toUpperCase());
        if (sponsor) {
          setSponsorName(sponsor.name);
          setSponsorError('');
        } else {
          setSponsorName('');
          setSponsorError('Sponsor not found on the platform');
        }
      } catch (err) {
        setSponsorName('');
        setSponsorError('Error validating sponsor');
      }
    };

    const delayDebounce = setTimeout(() => {
      validateSponsor();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.sponsorId, isLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (sponsorError) {
      setError('Please provide a valid sponsor ID.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newUser = await api.register(
        formData.name,
        formData.email,
        formData.password,
        formData.mobile,
        formData.sponsorId,
        formData.placement,
        isLiveMode
      );
      setSuccess(`Account registered successfully! User ID: ${newUser.userId}`);
      setTimeout(() => {
        onAuthSuccess(newUser);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await api.login(formData.userId, formData.password, isLiveMode);
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1c1505 0%, #050505 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Gold Circles */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(170, 124, 17, 0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '480px',
          zIndex: 10
        }}
      >
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              border: '2px solid var(--gold-primary)',
              boxShadow: '0 0 25px var(--gold-glow-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #181818, #0a0a0a)'
            }}
          >
            <span style={{
              fontSize: '32px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px'
            }} className="gold-text-gradient">IMX</span>
          </motion.div>
          
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 800, 
            fontSize: '32px',
            letterSpacing: '1px'
          }} className="gold-text-gradient">Aurex Capital</h2>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '6px' }}>
            Next-Gen Binary Staking and ROI Engine
          </p>
        </div>

        {/* Form Box */}
        <div className="glass-card" style={{ padding: '36px', position: 'relative' }}>
          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            marginBottom: '28px',
            border: '1px solid var(--border-grey)'
          }}>
            <button 
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isLogin ? 'linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))' : 'transparent',
                color: isLogin ? 'var(--bg-black)' : 'var(--text-grey)',
                border: 'none',
                fontSize: '15px'
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: !isLogin ? 'linear-gradient(135deg, var(--gold-secondary), var(--gold-primary))' : 'transparent',
                color: !isLogin ? 'var(--bg-black)' : 'var(--text-grey)',
                border: 'none',
                fontSize: '15px'
              }}
            >
              Register Node
            </button>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#34d399',
                  fontSize: '14px',
                  marginBottom: '20px'
                }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* User ID */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      USER ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="userId"
                        required
                        placeholder="AC100002"
                        value={formData.userId}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Tip: Use <strong>AC100001</strong> (Admin) or <strong>AC100002</strong> (User) to log in instantly.
                    </span>
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--text-grey)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        PASSWORD
                      </label>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Password for default accounts is: <strong>admin123</strong> (for admin) or <strong>user123</strong> (for user).
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}
                >
                  {/* Full Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      FULL NAME
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      EMAIL ADDRESS
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        name="password"
                        required
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      MOBILE NUMBER
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="mobile"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>

                  {/* Sponsor ID */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      SPONSOR ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="sponsorId"
                        required
                        placeholder="AC100001"
                        value={formData.sponsorId}
                        onChange={handleChange}
                        className="form-input"
                        style={{ paddingLeft: '44px', textTransform: 'uppercase' }}
                      />
                    </div>
                    {sponsorName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', marginTop: '6px' }}>
                        <CheckCircle size={12} />
                        <span>Sponsor Name: <strong>{sponsorName}</strong></span>
                      </div>
                    )}
                    {sponsorError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                        <AlertCircle size={12} />
                        <span>{sponsorError}</span>
                      </div>
                    )}
                  </div>

                  {/* Placement (Binary Leg) */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-grey)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                      BINARY TREE PLACEMENT
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: formData.placement === 'Left' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                        border: formData.placement === 'Left' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                        cursor: 'pointer',
                        color: formData.placement === 'Left' ? 'var(--gold-primary)' : 'var(--text-grey)',
                        transition: 'all 0.2s ease'
                      }}>
                        <input 
                          type="radio" 
                          name="placement" 
                          value="Left" 
                          checked={formData.placement === 'Left'}
                          onChange={handleChange}
                          style={{ accentColor: 'var(--gold-primary)', display: 'none' }}
                        />
                        <span style={{ fontWeight: 600 }}>Left Leg</span>
                      </label>

                      <label style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: formData.placement === 'Right' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.3)',
                        border: formData.placement === 'Right' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                        cursor: 'pointer',
                        color: formData.placement === 'Right' ? 'var(--gold-primary)' : 'var(--text-grey)',
                        transition: 'all 0.2s ease'
                      }}>
                        <input 
                          type="radio" 
                          name="placement" 
                          value="Right" 
                          checked={formData.placement === 'Right'}
                          onChange={handleChange}
                          style={{ accentColor: 'var(--gold-primary)', display: 'none' }}
                        />
                        <span style={{ fontWeight: 600 }}>Right Leg</span>
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                      <HelpCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
                      Traverses down the chosen branch to place your node in the extreme terminal slot.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 700,
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--bg-black)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              ) : isLogin ? 'Sign In to Account' : 'Initialize Node'}
            </motion.button>
          </form>
        </div>

        {/* Disclaimer / Simulator Alert */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {isLiveMode ? (
            <span style={{ color: '#10b981' }}>● Connecting to LIVE Express Server at http://localhost:5000</span>
          ) : (
            <span style={{ color: 'var(--gold-primary)' }}>✦ Running in MOCK Engine Mode (Full Local Simulation)</span>
          )}
        </div>
      </motion.div>

      {/* Inline Spin Animation for loader */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
