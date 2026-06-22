import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_TICKETS = [
  { id: 'TKT_901', userId: 'AC100002', subject: 'P2P Transfer pending issue', message: 'I transferred $50 to AC100003 but target did not receive it.', status: 'Pending', reply: '' },
  { id: 'TKT_902', userId: 'AC100004', subject: 'Staking delay question', message: 'Why is my FTP stake not paying out yet? It is day 4.', status: 'Answered', reply: 'DRP plans have a 7-day wait period before ROI calculations commence. Payouts will trigger on day 7.' }
];

export default function Support({ user }) {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Load tickets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aurex_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      localStorage.setItem('aurex_tickets', JSON.stringify(INITIAL_TICKETS));
      setTickets(INITIAL_TICKETS);
    }
  }, []);

  // Filter tickets for this specific user
  const userTickets = tickets.filter(t => t.userId === user.userId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket = {
      id: `TKT_${Math.floor(100 + Math.random() * 900)}`,
      userId: user.userId,
      subject: subject.trim(),
      message: message.trim(),
      status: 'Pending',
      reply: ''
    };

    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    localStorage.setItem('aurex_tickets', JSON.stringify(updatedTickets));
    
    // Reset form
    setSubject('');
    setMessage('');
    alert('Support ticket submitted successfully!');
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
          Helpdesk & <span className="gold-text-gradient">Support Support</span>
        </h1>
        <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
          Open a technical support request or review responses from our system administrators
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Submit Ticket Form */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} style={{ color: 'var(--gold-primary)' }} />
            Open Support Ticket
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                TICKET SUBJECT
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Deposit receipt delay / KYC issue"
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'var(--text-white)' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-grey)', marginBottom: '6px', fontWeight: 600 }}>
                DESCRIPTION / ENQUIRY DETAILS
              </label>
              <textarea
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write detailed inquiry here..."
                className="form-input"
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-grey)', borderRadius: '8px', color: 'var(--text-white)', resize: 'none', minHeight: '120px' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}>
              <Send size={14} />
              Submit Ticket Request
            </button>
          </form>
        </motion.div>

        {/* Tickets History */}
        <motion.div 
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: "easeOut" } }}
          className="glass-card shifting-card" 
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--gold-primary)' }} />
            My Tickets History ({userTickets.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
            {userTickets.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', fontSize: '13px' }}>
                You have not opened any support requests yet.
              </div>
            ) : (
              userTickets.map(t => (
                <div
                  key={t.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-grey)',
                    padding: '16px',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-primary)' }}>{t.id}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: t.status === 'Answered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: t.status === 'Answered' ? '#34d399' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {t.status === 'Answered' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {t.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-white)' }}>{t.subject}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.5, marginBottom: t.reply ? '12px' : '0' }}>
                    {t.message}
                  </p>
                  
                  {t.reply && (
                    <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '10px', marginTop: '10px', fontSize: '12px', background: 'rgba(212,175,55,0.03)', padding: '10px', borderRadius: '6px' }}>
                      <p style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Admin Reply:
                      </p>
                      <p style={{ color: 'var(--text-grey)', lineHeight: 1.5 }}>{t.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
