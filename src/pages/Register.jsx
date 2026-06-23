import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import logoEmblem from '../assets/logo_emblem.png';

export default function Register({ onAuthSuccess, onNavigateToLogin, isLiveMode, presetRegData, isModal = true }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    sponsorId: presetRegData?.sponsorId || 'AC100001',
    placement: presetRegData?.placement || 'Left' // Maintained default parameter value for system genealogy compatibility
  });

  const [sponsorName, setSponsorName] = useState('');
  const [sponsorError, setSponsorError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate Sponsor ID
  useEffect(() => {
    if (!formData.sponsorId) {
      setSponsorName('');
      setSponsorError('');
      return;
    }

    const checkSponsor = async () => {
      try {
        const users = JSON.parse(localStorage.getItem('aurex_users') || '[]');
        const sponsor = users.find(u => u.userId.toUpperCase() === formData.sponsorId.toUpperCase());
        if (sponsor) {
          setSponsorName(sponsor.name);
          setSponsorError('');
        } else {
          setSponsorName('');
          setSponsorError('Sponsor not found in structure.');
        }
      } catch (err) {
        setSponsorName('');
        setSponsorError('Error checking sponsor.');
      }
    };

    const delayDebounce = setTimeout(() => {
      checkSponsor();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [formData.sponsorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (sponsorError) {
      setError('Please resolve sponsor validation error.');
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
      setSuccess(`Account registered successfully! ID: ${newUser.userId}`);
      setTimeout(() => {
        onAuthSuccess(newUser);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.7px' }}>FULL NAME</label>
        <div className="input-group-wrapper">
          <User size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input
            type="text"
            name="name"
            required
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="form-input custom-auth-input"
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.7px' }}>EMAIL ADDRESS</label>
        <div className="input-group-wrapper">
          <Mail size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input
            type="email"
            name="email"
            required
            placeholder="email@address.com"
            value={formData.email}
            onChange={handleChange}
            className="form-input custom-auth-input"
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.7px' }}>PASSWORD</label>
        <div className="input-group-wrapper">
          <Lock size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input
            type="password"
            name="password"
            required
            placeholder="Choose Password"
            value={formData.password}
            onChange={handleChange}
            className="form-input custom-auth-input"
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.7px' }}>MOBILE NUMBER</label>
        <div className="input-group-wrapper">
          <Phone size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input
            type="text"
            name="mobile"
            required
            placeholder="+1 (555) 000-0000"
            value={formData.mobile}
            onChange={handleChange}
            className="form-input custom-auth-input"
            style={{ paddingLeft: '40px', fontSize: '13px', height: '45px' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.7px' }}>SPONSOR ID</label>
        <div className="input-group-wrapper">
          <Shield size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
          <input
            type="text"
            name="sponsorId"
            required
            placeholder="AC100001"
            value={formData.sponsorId}
            onChange={handleChange}
            className="form-input custom-auth-input"
            style={{ paddingLeft: '40px', textTransform: 'uppercase', fontSize: '13px', height: '45px' }}
          />
        </div>
        {sponsorName && <span style={{ color: '#34d399', fontSize: '11px', marginTop: '5px', display: 'block', fontWeight: 600 }}>✔ Sponsor: {sponsorName}</span>}
        {sponsorError && <span style={{ color: '#f87171', fontSize: '11px', marginTop: '5px', display: 'block', fontWeight: 600 }}>✘ {sponsorError}</span>}
      </div>

      <motion.button 
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        type="submit" 
        disabled={loading} 
        className="btn custom-auth-btn" 
        style={{ width: '100%', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', height: '48px', marginTop: '10px', cursor: 'pointer' }}
      >
        {loading ? 'Initializing Node...' : 'Register Node'}
      </motion.button>
    </form>
  );

  const notifications = (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
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
        style={{ width: '100%', maxWidth: '460px', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '20px',
            border: '2px solid var(--gold-primary)',
            boxShadow: '0 0 25px var(--gold-glow-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #181818, #0a0a0a)'
          }}>
            <img src={logoEmblem} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }} className="gold-text-gradient">REGISTER NODE</h2>
          <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '4px' }}>
            Join the binary staking network
          </p>
        </div>

        <div className="glass-card auth-card" style={{ padding: '28px', maxHeight: '520px', overflowY: 'auto' }}>
          {notifications}
          {formContent}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-grey)' }}>
            Already registered?{' '}
            <button onClick={onNavigateToLogin} style={{ background: 'transparent', border: 'none', color: 'var(--gold-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
