import React, { useState } from 'react';
import { Volume2, Send, Trash2, PlusCircle } from 'lucide-react';

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState([
    { id: 'ANN_801', title: 'System Maintenance Upgrade', desc: 'V1.0.3 database upgrade will commence Sunday at 02:00 AM UTC.', target: 'All Users', date: '2026-06-20' },
    { id: 'ANN_802', title: 'ERC-20 USDT Deprecations', desc: 'Please use TRC-20 and BEP-20 transfer slips to reduce transaction delays.', target: 'Stakers Only', date: '2026-06-18' }
  ]);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('All Users');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const newAnn = {
      id: `ANN_${Math.floor(800 + Math.random() * 200)}`,
      title: title.trim(),
      desc: desc.trim(),
      target,
      date: new Date().toISOString().split('T')[0]
    };

    setAnnouncements([newAnn, ...announcements]);
    setTitle('');
    setDesc('');
    alert('Announcement published successfully to stakers dashboards!');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Announcements <span className="gold-text-gradient">Manager</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Publish and edit notifications displayed on stakers dashboard widgets
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Publish form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={18} style={{ color: 'var(--gold-primary)' }} />
            Publish New Announcement
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                ANNOUNCEMENT TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Server Payouts Underway"
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'white' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                MESSAGE CONTENT
              </label>
              <textarea
                rows="4"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Write message details..."
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'white', resize: 'none' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TARGET SEGMENT AUDIENCE
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(20,20,20,1)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'white' }}
              >
                <option value="All Users">All Users & Admins</option>
                <option value="Stakers Only">Active Stakers Only</option>
                <option value="Executive Ranks">Executive Ranks & Above</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}>
              <Send size={14} />
              Publish Announcement
            </button>
          </form>
        </div>

        {/* Existing announcements */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} style={{ color: 'var(--gold-primary)' }} />
            Active Board Notices ({announcements.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {announcements.map((a) => (
              <div 
                key={a.id}
                style={{
                  background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-grey)',
                  padding: '16px', borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--gold-primary)', fontWeight: 700 }}>{a.id}</span>
                  <button 
                    onClick={() => handleDelete(a.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-white)' }}>{a.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', marginTop: '4px', lineHeight: 1.4 }}>{a.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  <span>Audience: <strong>{a.target}</strong></span>
                  <span>Date: {a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
