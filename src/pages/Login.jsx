import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { api, setCustomApiUrl } from '../utils/api';
import logoEmblem from '../assets/logo_emblem.png';

export default function Login({ onAuthSuccess, onNavigateToRegister, isLiveMode, isModal = true, onBackToHome }) {
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await api.login(formData.userId, formData.password, isLiveMode);
      setSuccess('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onAuthSuccess(user);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.7px' }}>USER ID</label>
        <div className="input-group-wrapper">
          <Shield size={16} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input 
            type="text" 
            name="userId" 
            required 
            placeholder="AC100002" 
            value={formData.userId}
            onChange={handleChange}
            className="form-input custom-auth-input" 
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }} 
          />
        </div>
      </div>
 
      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.7px' }}>PASSWORD</label>
        <div className="input-group-wrapper">
          <Lock size={16} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••" 
            value={formData.password}
            onChange={handleChange}
            className="form-input custom-auth-input" 
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }} 
          />
        </div>
      </div>
 
      <button 
        type="submit" 
        disabled={loading}
        className="btn auth-submit-btn"
        style={{
          width: '100%',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--gold-primary)',
          color: 'black',
          fontWeight: 700,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '8px',
          fontSize: '14px',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? 'Signing In...' : 'Sign In to Account'}
      </button>
    </form>
  );
 
  const notifications = (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '20px' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
 
  if (isModal) {
    return (
      <div style={{ width: '100%' }}>
        {notifications}
        {formContent}
      </div>
    );
  }
 
  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            onClick={onBackToHome}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '20px',
              border: '2px solid var(--gold-primary)',
              boxShadow: '0 0 25px var(--gold-glow-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #181818, #0a0a0a)',
              cursor: 'pointer'
            }}
          >
            <img src={logoEmblem} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <h2 
            onClick={onBackToHome}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '30px', cursor: 'pointer' }} 
            className="gold-text-gradient"
          >
            SIGN IN
          </h2>
          <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '6px' }}>Secure Account Authentication portal</p>
        </div>
 
        <div className="glass-card auth-card" style={{ padding: '32px' }}>
          {notifications}
          {formContent}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-grey)' }}>
            Don't have an account yet?{' '}
            <button onClick={onNavigateToRegister} style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Register Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
