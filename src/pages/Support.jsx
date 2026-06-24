import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, Clock, CheckCircle, MessageSquare, LifeBuoy, Ticket, ShieldAlert, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_TICKETS = [
  { id: 'TKT_901', userId: 'AC100002', subject: 'P2P Transfer pending issue', message: 'I transferred $50 to AC100003 but target did not receive it.', status: 'Pending', reply: '' },
  { id: 'TKT_902', userId: 'AC100004', subject: 'Staking delay question', message: 'Why is my FTP stake not paying out yet? It is day 4.', status: 'Answered', reply: 'DRP plans have a 7-day wait period before ROI calculations commence. Payouts will trigger on day 7.' }
];

const FAQ_ITEMS = [
  { q: 'How long does withdrawal take?', a: 'Withdrawals are typically processed within 24 hours by the admin team.' },
  { q: 'What is the minimum withdrawal amount?', a: 'Minimum withdrawal is $10 USDT.' },
  { q: 'How do I change my wallet address?', a: 'Go to Profile → Wallet Details and update your USDT BEP20 address.' },
];

export default function Support({ user }) {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('aurex_tickets');
    if (saved) {
      setTickets(JSON.parse(saved));
    } else {
      localStorage.setItem('aurex_tickets', JSON.stringify(INITIAL_TICKETS));
      setTickets(INITIAL_TICKETS);
    }
  }, []);

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
    setSubject('');
    setMessage('');
    alert('Support ticket submitted successfully!');
  };

  const iconBox = (Icon, color, bg) => (
    <div style={{
      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: bg, border: `1px solid ${color}33`, boxShadow: `0 0 10px ${color}22`, flexShrink: 0
    }}>
      <Icon size={18} style={{ color }} />
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 18px rgba(212,175,55,0.15)'
        }}>
          <LifeBuoy size={26} style={{ color: 'var(--gold-primary)' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px' }}>
            Helpdesk &amp; <span className="gold-text-gradient">Support Center</span>
          </h1>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', marginTop: '4px' }}>
            Open a technical support request or review responses from our system administrators
          </p>
        </div>
      </div>

      {/* Stats mini-row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'MY TOTAL TICKETS', value: userTickets.length, icon: Ticket, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
          { label: 'AWAITING REPLY', value: userTickets.filter(t => t.status === 'Pending').length, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
          { label: 'RESOLVED', value: userTickets.filter(t => t.status === 'Answered').length, icon: CheckCircle, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.025, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            {iconBox(s.icon, s.color, s.bg)}
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-white)' }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="responsive-grid-1-12" style={{ gap: '28px', alignItems: 'start' }}>

        {/* Submit Ticket Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {iconBox(MessageSquare, '#60a5fa', 'rgba(96,165,250,0.08)')}
              Open Support Ticket
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.7px' }}>
                  TICKET SUBJECT
                </label>
                <div className="input-group-wrapper" style={{ position: 'relative' }}>
                  <Ticket size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Deposit receipt delay / KYC issue"
                    className="form-input custom-auth-input"
                    style={{ paddingLeft: '40px', fontSize: '13px', height: '45px', width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-grey)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.7px' }}>
                  DESCRIPTION / ENQUIRY DETAILS
                </label>
                <div className="input-group-wrapper" style={{ position: 'relative' }}>
                  <MessageSquare size={15} className="input-icon" style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)', transition: 'all 0.3s ease', zIndex: 10 }} />
                  <textarea
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write detailed inquiry here..."
                    className="form-input custom-auth-input"
                    style={{ paddingLeft: '40px', paddingTop: '12px', fontSize: '13px', width: '100%', resize: 'none', minHeight: '130px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 700 }}>
                <Send size={14} />
                Submit Ticket Request
              </button>
            </form>
          </motion.div>

          {/* FAQ */}
          <motion.div
            whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
            className="glass-card shifting-card"
            style={{ padding: '24px' }}
          >
            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {iconBox(Info, '#a78bfa', 'rgba(167,139,250,0.08)')}
              Frequently Asked Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} style={{ borderRadius: '8px', border: '1px solid var(--border-grey)', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: 'none', padding: '12px 14px', textAlign: 'left', color: 'var(--text-white)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    {faq.q}
                    <ChevronRight size={14} style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--gold-primary)' }} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-grey)', lineHeight: 1.6, borderTop: '1px solid var(--border-grey)' }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tickets History */}
        <motion.div
          whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2, ease: 'easeOut' } }}
          className="glass-card shifting-card"
          style={{ padding: '24px' }}
        >
          <h3 style={{ fontSize: '17px', fontFamily: 'var(--font-display)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {iconBox(HelpCircle, 'var(--gold-primary)', 'rgba(212,175,55,0.08)')}
            My Tickets History ({userTickets.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '620px', overflowY: 'auto', paddingRight: '4px' }}>
            {userTickets.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: 'var(--text-muted)', fontSize: '13px', gap: '12px' }}>
                <ShieldAlert size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <span>You have not opened any support requests yet.</span>
              </div>
            ) : (
              userTickets.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-grey)',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: t.status === 'Answered' ? '3px solid #34d399' : '3px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-primary)' }}>{t.id}</span>
                    <span style={{
                      fontSize: '10px', padding: '3px 9px', borderRadius: '20px', fontWeight: 700,
                      background: t.status === 'Answered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: t.status === 'Answered' ? '#34d399' : '#f59e0b',
                      display: 'flex', alignItems: 'center', gap: '4px',
                      border: `1px solid ${t.status === 'Answered' ? 'rgba(52,211,153,0.3)' : 'rgba(245,158,11,0.3)'}`
                    }}>
                      {t.status === 'Answered' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {t.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-white)' }}>{t.subject}</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-grey)', lineHeight: 1.5, marginBottom: t.reply ? '12px' : '0' }}>
                    {t.message}
                  </p>

                  {t.reply && (
                    <div style={{ borderTop: '1px solid var(--border-grey)', marginTop: '10px', paddingTop: '10px', fontSize: '12px', background: 'rgba(52,211,153,0.03)', padding: '10px', borderRadius: '6px' }}>
                      <p style={{ color: '#34d399', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
                        <CheckCircle size={11} /> Admin Reply:
                      </p>
                      <p style={{ color: 'var(--text-grey)', lineHeight: 1.5 }}>{t.reply}</p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
