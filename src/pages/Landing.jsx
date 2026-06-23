import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { 
  Shield, TrendingUp, Users, Info, ChevronDown, MessageSquare, 
  MapPin, Phone, Mail, Award, CheckCircle, Zap, HelpCircle, ArrowRight, X, Lock, Key,
  Star, Globe, BarChart2, Cpu
} from 'lucide-react';
import Login from './Login';
import Register from './Register';
import AnimatedToken from '../components/AnimatedToken';
import logoEmblem from '../assets/logo_emblem.png';
import logoTransparent from '../assets/logo_transparent.png';

/* ─────────────────────────── Animated Counter ─────────────────────────── */
function CountUp({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(ease * numeric);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  const formatted = target.includes('.') ? count.toFixed(2) : Math.round(count).toLocaleString();
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

/* ─────────────────────────── Floating Orbs Background ─────────────────────────── */
function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {[
        { w: 400, h: 400, top: '-10%', left: '-5%', dur: 18, delay: 0, color: 'rgba(212,175,55,0.07)' },
        { w: 300, h: 300, top: '60%', right: '-8%', dur: 22, delay: 3, color: 'rgba(212,175,55,0.05)' },
        { w: 500, h: 500, top: '30%', left: '40%', dur: 28, delay: 6, color: 'rgba(212,175,55,0.03)' },
        { w: 250, h: 250, top: '80%', left: '20%', dur: 16, delay: 9, color: 'rgba(100,150,255,0.04)' },
      ].map((orb, i) => (
        <motion.div
          key={i}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.05, 1] }}
          transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: orb.w, height: orb.h,
            top: orb.top, left: orb.left, right: orb.right,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────── Particle Constellation Canvas ─────────────────────────── */
function ParticleConstellation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = 65;
    const mouse = { x: null, y: null, radius: 160 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.4 + 0.15;
        this.alpha = this.baseAlpha;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off bounds
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // pull slightly
            this.x += (dx / dist) * force * 0.4;
            this.y += (dy / dist) * force * 0.4;
            this.alpha = Math.min(0.9, this.baseAlpha + force * 0.5);
          } else {
            this.alpha = this.baseAlpha;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
        ctx.shadowBlur = this.radius * 2;
        ctx.shadowColor = '#d4af37';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}


/* ─────────────────────────── Tilt Card ─────────────────────────── */
function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10, scale: 1.02, boxShadow: '0 20px 40px rgba(212,175,55,0.2)', transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Glowing Button ─────────────────────────── */
function GlowButton({ onClick, primary, children, style }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, boxShadow: primary ? '0 0 30px rgba(212,175,55,0.5)' : '0 0 15px rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        padding: '16px 32px',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
        background: primary
          ? 'linear-gradient(135deg, #c8a84b, #f0c040, #b8952a)'
          : 'rgba(255,255,255,0.04)',
        color: primary ? '#0a0800' : 'white',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        letterSpacing: '0.3px',
        backdropFilter: 'blur(8px)',
        ...style
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─────────────────────────── Section Header ─────────────────────────── */
function SectionHeader({ badge, title, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{ textAlign: 'center', marginBottom: '35px' }}
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          display: 'inline-block',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.3)',
          color: 'var(--gold-primary)',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          padding: '6px 16px',
          borderRadius: '20px',
          marginBottom: '16px'
        }}
      >
        {badge}
      </motion.span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 900, lineHeight: 1.15 }}>
        {title} <span className="gold-text-gradient">{highlight}</span>
      </h2>
    </motion.div>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function Landing({ onAuthSuccess, isLiveMode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [faqOpen, setFaqOpen] = useState({});
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 100], ['rgba(5,5,5,0)', 'rgba(5,5,5,0.95)']);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseOverHero, setIsMouseOverHero] = useState(false);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const toggleFaq = (i) => setFaqOpen(prev => ({ ...prev, [i]: !prev[i] }));
  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! Our helpdesk will respond shortly.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  /* ── NAV LINKS ── */
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'packages', label: 'Packages' },
    { id: 'plan', label: 'Compensation' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' }
  ];

  /* ── HOW IT WORKS STEPS ── */
  const steps = [
    { num: '01', icon: <Key size={24} />, title: 'Register Account', desc: 'Sign up with a valid sponsor node ID and secure your placement in the binary genealogy tree.' },
    { num: '02', icon: <Shield size={24} />, title: 'Deposit Funds', desc: 'Submit manual deposit receipt proofs to load liquid CapTok Main balances instantly.' },
    { num: '03', icon: <Zap size={24} />, title: 'Stake Capital', desc: 'Lock capital in the FTP plan wizard to activate premium daily ROI slab yield cycles.' },
    { num: '04', icon: <TrendingUp size={24} />, title: 'Earn Daily ROI', desc: 'Collect daily returns and binary matching distributed straight to your ProTok profit wallet.' }
  ];

  /* ── PACKAGES ── */
  const packages = [
    { name: 'Starter', price: '$100', roi: '0.10%', duration: '365 Days', cap: '250%', color: '#60a5fa', popular: false },
    { name: 'Bronze', price: '$500', roi: '0.125%', duration: '365 Days', cap: '250%', color: '#c07a2a', popular: false },
    { name: 'Silver', price: '$1,000', roi: '0.175%', duration: '365 Days', cap: '250%', color: '#9ca3af', popular: true },
    { name: 'Gold', price: '$5,000', roi: '0.20%', duration: '365 Days', cap: '250%', color: '#f0c040', popular: false },
    { name: 'Platinum', price: '$10,000', roi: '0.225%', duration: '365 Days', cap: '250%', color: '#a78bfa', popular: false },
  ];

  /* ── COMPENSATION PLAN ── */
  const compensations = [
    { icon: <Zap size={28} />, title: '1. Slab Daily ROI', desc: 'Earn 0.10% – 0.35% daily based on active staked volumes. Payouts auto-trigger after a 7-day maturation window.' },
    { icon: <Users size={28} />, title: '2. Unilevel Referrals', desc: 'Level 1: 10% | Level 2: 5% | Level 3: 2% | Levels 4–5: 1% commission on each downline stake.' },
    { icon: <Award size={28} />, title: '3. Binary Matching', desc: 'Earn 10% matching payout on matched Left/Right leg volumes daily. Unmatched carry forward automatically.' },
    { icon: <Star size={28} />, title: '4. Rank Milestone Rewards', desc: 'Unlock premium rewards — cash, travel vouchers, luxury goods — as your team volume hits rank milestones.' },
    { icon: <BarChart2 size={28} />, title: '5. Pool & Loyalty Dividends', desc: 'Weekly UTP Profit pool distributed to qualified locked stakers. Loyalty dividends for long-term node holders.' },
    { icon: <Globe size={28} />, title: '6. Fast-Track Bonus', desc: 'Earn bonus accelerator payouts when you personally sponsor two new actives in the same calendar week.' },
  ];

  /* ── STATS ── */
  const stats = [
    { value: '74250', prefix: '', suffix: '+', label: 'Registered Nodes' },
    { value: '42.8M', prefix: '$', suffix: '', label: 'Active Investments' },
    { value: '0.35', prefix: '', suffix: '%', label: 'Max Daily ROI' },
    { value: '100', prefix: '', suffix: '%', label: 'Secure Contracts' },
  ];

  /* ── FAQ ── */
  const faqs = [
    { q: 'What is the wait period for DRP/FTP payouts?', a: 'Maturation begins exactly 7 days after the package creation timestamp to maintain platform liquidity and smart contract integrity.' },
    { q: 'What are the withdrawal limits and processing times?', a: 'Withdrawals require admin approval. Default transaction fee is 5%, and minimum threshold is $25 per request.' },
    { q: 'How does Binary Matching calculate commissions?', a: 'Commissions run daily at 1:00 AM, matching Left Leg and Right Leg volumes, rewarding 10% of matched volume to your wallet.' },
    { q: 'Is a sponsor ID required during registration?', a: 'Yes — a valid parent sponsor node ID is required to position you correctly inside the MLM binary genealogy tree.' },
    { q: 'Can I unstake capital before the contract expires?', a: 'Early unstaking is possible with a 10% penalty fee. All remaining ROI cycles are forfeited upon manual unstake.' },
  ];



  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top right, #0e0a04 0%, #030303 65%)', color: 'white', fontFamily: 'var(--font-sans)', overflowX: 'hidden', position: 'relative' }}>
      
      <FloatingOrbs />

      {/* ═══════════ STICKY HEADER ═══════════ */}
      <motion.header
        style={{
          position: 'sticky', top: 0, zIndex: 1000,
          background: headerBg,
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 40px', flexWrap: 'wrap', gap: '16px'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ boxShadow: ['0 0 8px rgba(212,175,55,0.3)', '0 0 20px rgba(212,175,55,0.6)', '0 0 8px rgba(212,175,55,0.3)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ width: '56px', height: '56px', borderRadius: '14px', border: '1px solid var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,175,55,0.07)', overflow: 'hidden' }}
          >
            <img src={logoEmblem} alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          </motion.div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', lineHeight: 1.1, margin: 0, padding: 0 }} className="gold-text-gradient">Aurex Capital</h3>
          </div>
        </motion.div>

        <nav style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          {navLinks.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ color: 'var(--gold-primary)', y: -1 }}
              onClick={() => scrollToSection(item.id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-grey)', fontSize: '15.5px', fontWeight: 700, cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s' }}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '14px' }}>
          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'var(--gold-primary)', color: 'var(--gold-primary)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            style={{ padding: '10px 24px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'white', borderRadius: '20px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 25px rgba(212,175,55,0.45)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
            style={{ padding: '10px 24px', border: 'none', background: 'linear-gradient(135deg, #c8a84b, #f0c040)', color: '#0a0800', borderRadius: '20px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}
          >
            Register
          </motion.button>
        </div>
      </motion.header>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ═══════════ HERO SECTION ═══════════ */}
        <section
          id="home"
          onMouseMove={handleHeroMouseMove}
          onMouseEnter={() => setIsMouseOverHero(true)}
          onMouseLeave={() => setIsMouseOverHero(false)}
          style={{
            padding: '85px 40px 65px',
            maxWidth: '1300px',
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Animated Mesh, Grid & Spotlight Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 0,
              overflow: 'hidden',
              borderRadius: '24px'
            }}
          >
            {/* Ambient Aurora Orbs */}
            <motion.div
              animate={{
                x: [-30, 30, -30],
                y: [-25, 25, -25],
                scale: [1, 1.12, 1]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '5%',
                left: '15%',
                width: '360px',
                height: '360px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)',
                filter: 'blur(55px)',
              }}
            />
            <motion.div
              animate={{
                x: [25, -25, 25],
                y: [25, -25, 25],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              style={{
                position: 'absolute',
                bottom: '5%',
                right: '10%',
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
                filter: 'blur(65px)',
              }}
            />

            {/* Futuristic Tech Grid */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 80%)',
                opacity: 0.8
              }}
            />

            {/* Grid Laser Sweep line */}
            <motion.div
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)',
                opacity: 0.55
              }}
            />

            {/* Interactive Spotlight Glow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isMouseOverHero ? 1 : 0,
                transition: 'opacity 0.4s ease',
                background: `radial-gradient(circle 380px at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.08), transparent 70%)`,
              }}
            />

            {/* Constellation nodes inside the fold */}
            <ParticleConstellation />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            
            {/* LEFT COPY */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', padding: '6px 16px', borderRadius: '30px', width: 'fit-content' }}
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'var(--gold-primary)' }}>LIVE · COMPENSATION BLOCKCHAIN SYSTEM</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1px' }}
              >
                Premium Wealth Begins With{' '}
                <span className="gold-sheen-text">
                  Aurex Capital
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                style={{ color: 'var(--text-grey)', fontSize: '16px', lineHeight: 1.75, maxWidth: '520px' }}
              >
                Secure steady digital gains through our smart unilevel staking pool. Build your left & right binary matching team network inside a premium AI-powered dashboard portal.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
              >
                <GlowButton primary onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                  Create Node Account <ArrowRight size={16} />
                </GlowButton>
                <GlowButton onClick={() => scrollToSection('packages')}>
                  View Slab Plans
                </GlowButton>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}
              >
                {['Smart Contract Secured', 'KYC Verified Nodes', '24/7 Admin Support'].map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-grey)' }}>
                    <CheckCircle size={13} style={{ color: '#34d399' }} />
                    {badge}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT TOKEN */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ flex: '1 1 380px', display: 'flex', justifyContent: 'center', position: 'relative' }}
            >
              {/* Glow rings around token */}
              {[1, 2, 3].map(ring => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2.5 + ring, repeat: Infinity, delay: ring * 0.5 }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 380 + ring * 50, height: 380 + ring * 50,
                    borderRadius: '50%',
                    border: `1px solid rgba(212,175,55,${0.25 - ring * 0.07})`,
                    pointerEvents: 'none'
                  }}
                />
              ))}

              {/* Floating Dashboard Card 1 - Top Left */}
              <motion.div
                className="desktop-only"
                animate={{
                  y: [0, -8, 0],
                  rotate: [-1, 1, -1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                style={{
                  position: 'absolute',
                  top: '-8%',
                  left: '-12%',
                  background: 'rgba(15, 15, 15, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 10px rgba(212,175,55,0.1)',
                  zIndex: 2,
                  cursor: 'default'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Staking Pool</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    $500.00
                    <span style={{ position: 'relative', display: 'flex', height: '6px', width: '6px' }}>
                      <span className="status-pill-pulse" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#34d399', opacity: 0.75 }}></span>
                      <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '6px', width: '6px', backgroundColor: '#34d399' }}></span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Dashboard Card 2 - Bottom Left */}
              <motion.div
                className="desktop-only"
                animate={{
                  y: [0, 8, 0],
                  rotate: [1, -1, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.2
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                style={{
                  position: 'absolute',
                  bottom: '8%',
                  left: '-8%',
                  background: 'rgba(15, 15, 15, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 10px rgba(212,175,55,0.1)',
                  zIndex: 2,
                  cursor: 'default'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Daily Slab Yield</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>+0.225% ROI</div>
                </div>
              </motion.div>

              {/* Floating Dashboard Card 3 - Middle Right */}
              <motion.div
                className="desktop-only"
                animate={{
                  y: [-5, 5, -5],
                  x: [0, 5, 0]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2.4
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                style={{
                  position: 'absolute',
                  top: '32%',
                  right: '-12%',
                  background: 'rgba(15, 15, 15, 0.75)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 10px rgba(212,175,55,0.1)',
                  zIndex: 2,
                  cursor: 'default'
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(167,139,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Binary Matching</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'white' }}>$1,200.00 Paid</div>
                </div>
              </motion.div>

              <AnimatedToken size={360} />
            </motion.div>
          </div>


          {/* ── STATS BAR ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1px', marginTop: '50px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ background: 'rgba(212,175,55,0.06)' }}
                transition={{ duration: 0.2 }}
                style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(5,5,5,0.6)' }}
              >
                <h3 style={{ fontSize: '40px', fontWeight: 900, lineHeight: 1 }} className="gold-text-gradient">
                  <CountUp target={s.value} prefix={s.prefix} suffix={s.suffix} />
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-grey)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '8px', display: 'block' }}>{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══════════ ABOUT SECTION ═══════════ */}
        <section id="about" style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <SectionHeader badge="Who We Are" title="About Aurex" highlight="Capital Platform" />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
              className="glass-card shifting-card"
              whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2 } }}
              style={{ padding: '44px', lineHeight: 1.85, color: 'var(--text-grey)', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <p style={{ fontSize: '16px' }}>
                Aurex Capital is a leading decentralised MLM genealogy and investment staking ecosystem built around the <strong style={{ color: 'var(--gold-primary)' }}>Aurex Utility Token</strong>. Our platform configures stable, transparent wealth opportunities by integrating daily ROI slab yields with binary match leg matrices.
              </p>
              <p style={{ fontSize: '15px' }}>
                Our algorithms run completely on-chain, keeping platform assets secure, auditable, and easily accessible. Stakers benefit from automated calculation panels, direct sponsor incentives, and 24/7 premium support systems.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '10px' }}>
                {[
                  { icon: <Shield size={18} />, text: 'Secure Smart Contracts' },
                  { icon: <TrendingUp size={18} />, text: 'Slab ROI Yields Optimizer' },
                  { icon: <Users size={18} />, text: 'Binary MLM Genealogy' },
                  { icon: <Cpu size={18} />, text: 'On-Chain Transparency' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4, color: 'var(--gold-primary)' }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-white)', fontWeight: 600, fontSize: '13px' }}
                  >
                    <span style={{ color: 'var(--gold-primary)' }}>{item.icon}</span>
                    {item.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how-it-works" style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <SectionHeader badge="Simple Process" title="How It" highlight="Operates" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -10, scale: 1.03, boxShadow: '0 20px 40px rgba(212,175,55,0.15)', transition: { duration: 0.2 } }}
                className="glass-card shifting-card"
                style={{ padding: '36px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '3px solid var(--border-gold)', position: 'relative', cursor: 'default' }}
              >
                {/* step number watermark */}
                <span style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '40px', fontWeight: 900, color: 'rgba(212,175,55,0.07)', fontFamily: 'var(--font-display)' }}>
                  {step.num}
                </span>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                >
                  {step.icon}
                </motion.div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══════════ PACKAGES SECTION ═══════════ */}
        <section id="packages" style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <SectionHeader badge="Choose Your Plan" title="Staking Investment" highlight="Packages" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              {packages.map((plan, i) => (
                <TiltCard
                  key={i}
                  className="glass-card"
                  style={{
                    padding: '32px 22px',
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    borderTop: `4px solid ${plan.color}`,
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'visible',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {plan.popular && (
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #c8a84b, #f0c040)', color: '#0a0800', fontSize: '10px', fontWeight: 800, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '1px' }}
                      >
                        ⭐ MOST POPULAR
                      </motion.div>
                    )}

                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${plan.color === '#f0c040' ? '240,192,64' : '96,165,250'},0.1)`, border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: plan.color }}>
                      <Zap size={20} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-grey)' }}>{plan.name} Plan</h3>
                    <h2 style={{ fontSize: '36px', fontWeight: 900 }} className="gold-text-gradient">{plan.price}</h2>

                    <div style={{ fontSize: '12px', color: 'var(--text-grey)', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Daily ROI:</span>
                        <strong style={{ color: '#34d399' }}>{plan.roi}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Contract:</span>
                        <strong style={{ color: 'var(--text-white)' }}>{plan.duration}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Max Cap:</span>
                        <strong style={{ color: 'var(--gold-primary)' }}>{plan.cap}</strong>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${plan.color}40` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                      style={{ padding: '12px 16px', background: `${plan.color}15`, border: `1px solid ${plan.color}50`, color: plan.color, borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, marginTop: '4px', transition: 'all 0.2s' }}
                    >
                      Get Started →
                    </motion.button>
                  </motion.div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ COMPENSATION PLAN ═══════════ */}
        <section id="plan" style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <SectionHeader badge="MLM Yields System" title="Compensation" highlight="Plan Benefits" />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
          >
            {compensations.map((c, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 16px 35px rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.3)', transition: { duration: 0.2 } }}
                className="glass-card"
                style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'default' }}
              >
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.15 }}
                  style={{ color: 'var(--gold-primary)', width: 'fit-content' }}
                >
                  {c.icon}
                </motion.div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{c.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.65 }}>{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>



        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" style={{ padding: '60px 40px', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          <SectionHeader badge="Have Questions?" title="Frequently Asked" highlight="Questions" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01, borderColor: 'rgba(212,175,55,0.2)', transition: { duration: 0.15 } }}
                className="glass-card"
                style={{ padding: '20px 24px', cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => toggleFaq(i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{item.q}</h4>
                  <motion.div
                    animate={{ rotate: faqOpen[i] ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ color: 'var(--gold-primary)', flexShrink: 0 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {faqOpen[i] && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.65, overflow: 'hidden' }}
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════ CONTACT SECTION ═══════════ */}
        <section id="contact" style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <SectionHeader badge="Get In Touch" title="Contact" highlight="Support" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
              
              {/* INFO CARD */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2 } }}
                className="glass-card shifting-card"
                style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Support Helpdesk</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-grey)', lineHeight: 1.6 }}>
                    Reach out for custom sponsorships, KYC lockups, or technical platform disputes. Our team is available 24/7.
                  </p>
                </div>

                {[
                  { icon: <Mail size={16} />, text: 'support@aurexcapital.com' },
                  { icon: <Phone size={16} />, text: '+1 (800) AUREX-NOW' },
                  { icon: <MapPin size={16} />, text: 'Zurich, Switzerland' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 5, color: 'var(--gold-primary)' }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-grey)' }}
                  >
                    <span style={{ color: 'var(--gold-primary)' }}>{item.icon}</span>
                    {item.text}
                  </motion.div>
                ))}

                {/* Social proof mini */}
                <div style={{ borderTop: '1px solid var(--border-grey)', paddingTop: '20px', display: 'flex', gap: '20px' }}>
                  {[{ n: '74K+', l: 'Members' }, { n: '98%', l: 'Uptime' }, { n: '5★', l: 'Rating' }].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800 }} className="gold-text-gradient">{s.n}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FORM CARD */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.2 } }}
                className="glass-card shifting-card"
                style={{ padding: '36px' }}
              >
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Send Inquiry</h3>
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { placeholder: 'Your Full Name', key: 'name', type: 'text' },
                    { placeholder: 'Your Email Address', key: 'email', type: 'email' },
                  ].map((field) => (
                    <motion.input
                      key={field.key}
                      whileFocus={{ borderColor: 'var(--gold-primary)', boxShadow: '0 0 0 2px rgba(212,175,55,0.15)' }}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={contactForm[field.key]}
                      onChange={e => setContactForm({ ...contactForm, [field.key]: e.target.value })}
                      style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-grey)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                      required
                    />
                  ))}
                  <motion.textarea
                    whileFocus={{ borderColor: 'var(--gold-primary)', boxShadow: '0 0 0 2px rgba(212,175,55,0.15)' }}
                    placeholder="Your message details..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    rows="4"
                    style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-grey)', borderRadius: '10px', color: 'white', resize: 'none', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s' }}
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(212,175,55,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px', background: 'linear-gradient(135deg, #c8a84b, #f0c040)', border: 'none', borderRadius: '10px', color: '#0a0800', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                  >
                    Send Message →
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════ CTA BANNER ═══════════ */}
        <section style={{ padding: '80px 40px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '24px', padding: '64px 40px', position: 'relative', overflow: 'hidden' }}
          >
            {/* Animated glow */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(212,175,55,0.15), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }}
            />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 900, marginBottom: '16px', position: 'relative' }}>
              Ready to Start <span className="gold-text-gradient">Earning Daily?</span>
            </h2>
            <p style={{ color: 'var(--text-grey)', fontSize: '15px', marginBottom: '32px', position: 'relative' }}>
              Join 74,000+ node stakers already earning daily ROI rewards on the Aurex Capital platform.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <GlowButton primary onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                Create Free Account <ArrowRight size={16} />
              </GlowButton>
              <GlowButton onClick={() => scrollToSection('plan')}>
                View Compensation Plan
              </GlowButton>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gold-primary)' }}>AC</span>
          </div>
          <span>© 2026 Aurex Capital. All Rights Reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy Policy', 'Terms of Service', 'White Paper'].map(link => (
            <motion.a key={link} href="#" whileHover={{ color: 'var(--gold-primary)' }} style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>{link}</motion.a>
          ))}
        </div>
      </footer>

      {/* ═══════════ AUTH MODAL ═══════════ */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: -30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '450px', padding: '36px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.08)', border: '1px solid var(--border-gold)' }}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, color: '#ef4444' }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowAuthModal(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-grey)', cursor: 'pointer' }}
              >
                <X size={20} />
              </motion.button>

              <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
                {['login', 'register'].map(mode => (
                  <motion.button
                    key={mode}
                    onClick={() => setAuthMode(mode)}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: authMode === mode ? 'linear-gradient(135deg, #c8a84b, #f0c040)' : 'transparent',
                      color: authMode === mode ? '#0a0800' : 'var(--text-grey)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.25s'
                    }}
                  >
                    {mode === 'login' ? 'Sign In' : 'Register'}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  initial={{ opacity: 0, x: authMode === 'login' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: authMode === 'login' ? 20 : -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {authMode === 'login' ? (
                    <Login onAuthSuccess={onAuthSuccess} onNavigateToRegister={() => setAuthMode('register')} isLiveMode={isLiveMode} />
                  ) : (
                    <Register onAuthSuccess={onAuthSuccess} onNavigateToLogin={() => setAuthMode('login')} isLiveMode={isLiveMode} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
