import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Login({ onAuthSuccess, onNavigateToRegister, isLiveMode, isModal = true }) {
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
        <div style={{ position: 'relative' }}>
          <Shield size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            name="userId" 
            required 
            placeholder="AC100002" 
            value={formData.userId}
            onChange={handleChange}
            className="form-input" 
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }} 
          />
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.7px' }}>PASSWORD</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="password" 
            name="password" 
            required 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
            className="form-input" 
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }} 
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', height: '48px', marginTop: '10px' }}>
        {loading ? 'Authenticating...' : 'Sign In to Account'}
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

  // Standalone page layout fallback
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
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(170, 124, 17, 0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '20px',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 0 25px var(--gold-glow-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #181818, #0a0a0a)'
          }}>
            <span style={{ fontSize: '26px', fontWeight: 800 }} className="gold-text-gradient">IMX</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '30px' }} className="gold-text-gradient">SIGN IN</h2>
          <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '6px' }}>Secure Node Authentication portal</p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          {notifications}
          {formContent}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-grey)' }}>
            Don't have a node yet?{' '}
            <button onClick={onNavigateToRegister} style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Register Node
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
