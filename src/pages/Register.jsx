import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Register({ onAuthSuccess, onNavigateToLogin, isLiveMode, presetRegData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    sponsorId: presetRegData?.sponsorId || 'AC100001',
    placement: presetRegData?.placement || 'Left'
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
      {/* Glow Effects */}
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
            <span style={{ fontSize: '26px', fontWeight: 800 }} className="gold-text-gradient">IMX</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }} className="gold-text-gradient">REGISTER NODE</h2>
          <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '4px' }}>
            {presetRegData ? `Placing under Sponsor ${presetRegData.sponsorId}` : 'Join the binary staking network'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '28px', maxHeight: '520px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
                <CheckCircle size={16} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" name="email" required placeholder="email@address.com" value={formData.email} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" name="password" required placeholder="Choose Password" value={formData.password} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>MOBILE NUMBER</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="mobile" required placeholder="+1 (555) 000-0000" value={formData.mobile} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>SPONSOR ID</label>
              <div style={{ position: 'relative' }}>
                <Shield size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" name="sponsorId" required placeholder="AC100001" value={formData.sponsorId} onChange={handleChange} className="form-input" style={{ paddingLeft: '40px', textTransform: 'uppercase' }} />
              </div>
              {sponsorName && <span style={{ color: '#10b981', fontSize: '11px', marginTop: '4px', display: 'block' }}>✔ Sponsor: {sponsorName}</span>}
              {sponsorError && <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>✘ {sponsorError}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>BINARY PLACEMENT</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{
                  flex: 1, padding: '10px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                  border: formData.placement === 'Left' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: formData.placement === 'Left' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  color: formData.placement === 'Left' ? 'var(--gold-primary)' : 'var(--text-grey)'
                }}>
                  <input type="radio" name="placement" value="Left" checked={formData.placement === 'Left'} onChange={handleChange} style={{ display: 'none' }} />
                  Left Leg
                </label>
                <label style={{
                  flex: 1, padding: '10px', borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                  border: formData.placement === 'Right' ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  background: formData.placement === 'Right' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  color: formData.placement === 'Right' ? 'var(--gold-primary)' : 'var(--text-grey)'
                }}>
                  <input type="radio" name="placement" value="Right" checked={formData.placement === 'Right'} onChange={handleChange} style={{ display: 'none' }} />
                  Right Leg
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 700 }}>
              {loading ? 'Initializing Node...' : 'Register Node'}
            </button>
          </form>

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
