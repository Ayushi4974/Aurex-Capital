import React, { useState, useEffect } from 'react';
import { Settings, Save, Landmark, Megaphone, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [minWithdraw, setMinWithdraw] = useState(20);
  const [maxWithdraw, setMaxWithdraw] = useState(5000);
  const [withdrawFee, setWithdrawFee] = useState(5);
  const [announcement, setAnnouncement] = useState('Welcome to Aurex Capital! Build your Nexus downline networks today.');
  const [roiSlabs, setRoiSlabs] = useState({
    start: 0.25,
    pro: 0.50,
    elite: 0.75,
    titan: 1.00,
    infinity: 2.00
  });

  useEffect(() => {
    const minW = localStorage.getItem('aurex_min_withdraw') || '20';
    const maxW = localStorage.getItem('aurex_max_withdraw') || '5000';
    const feeW = localStorage.getItem('aurex_withdraw_fee') || '5';
    const ann = localStorage.getItem('aurex_announcement') || 'Welcome to Aurex Capital! Build your Nexus downline networks today.';
    
    setMinWithdraw(parseFloat(minW));
    setMaxWithdraw(parseFloat(maxW));
    setWithdrawFee(parseFloat(feeW));
    setAnnouncement(ann);

    const slabs = localStorage.getItem('aurex_roi_slabs');
    if (slabs) {
      setRoiSlabs(JSON.parse(slabs));
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('aurex_min_withdraw', minWithdraw.toString());
    localStorage.setItem('aurex_max_withdraw', maxWithdraw.toString());
    localStorage.setItem('aurex_withdraw_fee', withdrawFee.toString());
    localStorage.setItem('aurex_announcement', announcement);
    localStorage.setItem('aurex_roi_slabs', JSON.stringify(roiSlabs));

    alert('Global Aurex Capital parameters and announcements configuration updated successfully!');
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Platform Rules & <span className="gold-text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Adjust ROI slab margins, withdraw thresholds limits, and schedule corporate announcement banners.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        whileHover={{ y: -5, boxShadow: '0 14px 36px rgba(212,175,55,0.12)', transition: { duration: 0.2 } }}
        className="glass-card shifting-card"
        style={{ padding: '32px' }}
      >
        <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} style={{ color: 'var(--gold-primary)' }} />
          Backoffice Rules Configuration
        </h3>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Withdrawal Limits */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700 }}>
                MIN WITHDRAW (USDT)
              </label>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(parseFloat(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700 }}>
                MAX DAILY WITHDRAW (USDT)
              </label>
              <input
                type="number"
                value={maxWithdraw}
                onChange={(e) => setMaxWithdraw(parseFloat(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 700 }}>
                WITHDRAWAL FEE (%)
              </label>
              <input
                type="number"
                value={withdrawFee}
                onChange={(e) => setWithdrawFee(parseFloat(e.target.value))}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Daily ROI Slabs */}
          <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '12px' }}>
              DAILY ROI PERCENTAGES SLABS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-grey)', marginBottom: '4px' }}>START ($100)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roiSlabs.start}
                  onChange={(e) => setRoiSlabs({ ...roiSlabs, start: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-grey)', marginBottom: '4px' }}>PRO ($500)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roiSlabs.pro}
                  onChange={(e) => setRoiSlabs({ ...roiSlabs, pro: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-grey)', marginBottom: '4px' }}>ELITE ($1,000)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roiSlabs.elite}
                  onChange={(e) => setRoiSlabs({ ...roiSlabs, elite: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-grey)', marginBottom: '4px' }}>TITAN ($5,000)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roiSlabs.titan}
                  onChange={(e) => setRoiSlabs({ ...roiSlabs, titan: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-grey)', marginBottom: '4px' }}>INFINITY ($10,000)</label>
                <input
                  type="number"
                  step="0.05"
                  value={roiSlabs.infinity}
                  onChange={(e) => setRoiSlabs({ ...roiSlabs, infinity: parseFloat(e.target.value) })}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Announcement scheduler */}
          <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '20px', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Megaphone size={14} />
              SYSTEM ANNOUNCEMENTS SCHEDULER
            </h4>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="form-input"
              style={{ width: '100%', height: '80px', padding: '12px', background: 'rgba(0,0,0,0.3)', resize: 'vertical' }}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(212,175,55,0.35)' }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn btn-primary"
            style={{ padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, alignSelf: 'flex-start' }}
          >
            <Save size={16} />
            Save Configuration Changes
          </motion.button>

        </form>
      </motion.div>

    </div>
  );
}
