import React, { useState } from 'react';
import { HelpCircle, Check, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_TICKETS = [
  { id: 'TKT_901', userId: 'AC100002', subject: 'P2P Transfer pending issue', message: 'I transferred $50 to AC100003 but target did not receive it.', status: 'Pending', reply: '' },
  { id: 'TKT_902', userId: 'AC100004', subject: 'Staking delay question', message: 'Why is my FTP stake not paying out yet? It is day 4.', status: 'Answered', reply: 'DRP plans have a 7-day wait period before ROI calculations commence. Payouts will trigger on day 7.' }
];

export default function SupportAdmin() {
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('aurex_tickets');
    if (!saved) {
      localStorage.setItem('aurex_tickets', JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(saved);
  });

  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    const list = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, status: 'Answered', reply: replyText };
      }
      return t;
    });

    setTickets(list);
    localStorage.setItem('aurex_tickets', JSON.stringify(list));
    alert('Reply sent to user ticket!');
    setReplyText('');
    setActiveTicket(null);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '32px' }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Support <span className="gold-text-gradient">Ticketing Helpdesk</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Monitor system support queries, resolve user account disputes, and write technical replies
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Tickets list */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--gold-primary)' }} />
            Helpdesk Tickets ({tickets.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: activeTicket && activeTicket.id === t.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-grey)',
                  padding: '16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-primary)' }}>{t.id} (User: {t.userId})</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    background: t.status === 'Answered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: t.status === 'Answered' ? '#34d399' : '#f59e0b'
                  }}>
                    {t.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{t.subject}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.message}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected ticket resolution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {activeTicket ? (
            <div>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '12px', color: 'var(--gold-primary)' }}>
                Resolve Ticket {activeTicket.id}
              </h3>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-grey)', marginBottom: '20px', fontSize: '13px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>SUBJECT:</p>
                <p style={{ fontWeight: 600, marginBottom: '12px' }}>{activeTicket.subject}</p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>USER INQUIRY:</p>
                <p style={{ lineHeight: 1.5, color: 'var(--text-white)' }}>{activeTicket.message}</p>
              </div>

              {activeTicket.status === 'Answered' ? (
                <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '16px', fontSize: '13px' }}>
                  <p style={{ color: '#10b981', fontWeight: 600, marginBottom: '4px' }}>Replied Answer:</p>
                  <p style={{ color: 'var(--text-grey)', lineHeight: 1.5 }}>{activeTicket.reply}</p>
                </div>
              ) : (
                <form onSubmit={handleReplySubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px' }}>
                      WRITE ANSWER REPLY
                    </label>
                    <textarea
                      rows="4"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type ticket resolution reply here..."
                      className="form-input"
                      style={{ resize: 'none', height: '100px' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Reply size={16} />
                    Send Answer Reply
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Select a support ticket from the list to write answers or verify status details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
