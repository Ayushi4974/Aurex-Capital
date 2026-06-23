import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import logoEmblem from '../assets/logo_emblem.png';

export default function AnimatedToken({ size = 300 }) {
  const isSmall = size < 100;
  
  if (isSmall) {
    return <SmallAnimatedToken size={size} />;
  }

  return <ThreeDInteractiveToken size={size} />;
}

// 1. Compact Dashboard Version
function SmallAnimatedToken({ size }) {
  return (
    <div 
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '1.5px dashed rgba(212, 175, 55, 0.4)',
          borderRadius: '50%',
        }}
      />
      <motion.div
        animate={{ 
          scale: [1, 1.06, 1],
          rotateY: [0, 180, 360]
        }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 6, repeat: Infinity, ease: "linear" }
        }}
        style={{
          width: '76%',
          height: '76%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ffd700 0%, #d4af37 50%, #996515 100%)',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.5), inset 0 0 10px rgba(255,255,255,0.5)',
          border: '2px solid #ffd700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: `${size * 0.13}px`, fontWeight: 900, color: '#0a0a0a', textShadow: '0 1px 2px rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.1, textTransform: 'uppercase' }}>AUREX<br/>CAPITAL</span>
      </motion.div>
    </div>
  );
}

// 2. High-Fidelity 3D Parallax Token Component
function ThreeDInteractiveToken({ size }) {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Calculate 3D tilt angles based on cursor offset
  const rotateX = useTransform(y, [-size / 2, size / 2], [28, -28]);
  const rotateY = useTransform(x, [-size / 2, size / 2], [-28, 28]);

  // Specular shine reflections
  const shineLeft = useTransform(x, [-size / 2, size / 2], ['-30%', '70%']);
  const shineTop = useTransform(y, [-size / 2, size / 2], ['-30%', '70%']);

  // Shadow shifts opposite to tilt
  const shadowX = useTransform(x, [-size / 2, size / 2], [15, -15]);
  const shadowY = useTransform(y, [-size / 2, size / 2], [25, -5]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth reset
    x.set(0);
    y.set(0);
  };

  // Continuous auto-rotation motion properties (when not hovered)
  const autoSpinTransition = {
    duration: 15,
    repeat: Infinity,
    ease: "linear"
  };

  return (
    <div 
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1200px', // 3D Perspective Depth
        userSelect: 'none',
      }}
    >
      {/* Dynamic Floor Shadow */}
      <motion.div 
        style={{
          position: 'absolute',
          width: '78%',
          height: '78%',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.75)',
          filter: 'blur(30px)',
          x: isHovered ? shadowX : 0,
          y: isHovered ? shadowY : 15,
          scale: isHovered ? 0.95 : 1,
          transition: isHovered ? 'none' : 'all 0.5s ease'
        }}
      />

      {/* Orbit Rings (Backstage) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '95%',
          height: '95%',
          border: '1.5px dashed rgba(212, 175, 55, 0.15)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          position: 'absolute',
          width: '84%',
          height: '84%',
          border: '1px solid rgba(212, 175, 55, 0.08)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '12%',
          left: '12%',
          width: '6px',
          height: '6px',
          background: 'var(--gold-primary, #d4af37)',
          boxShadow: '0 0 10px var(--gold-primary)',
          borderRadius: '50%'
        }} />
      </motion.div>

      {/* Interactive 3D Coin Shell */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={isHovered ? {} : { rotateY: 360, y: [-8, 8, -8] }}
        transition={isHovered ? {} : {
          rotateY: autoSpinTransition,
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{
          position: 'relative',
          width: '74%',
          height: '74%',
          borderRadius: '50%',
          cursor: 'pointer',
          transformStyle: 'preserve-3d', // Enables true 3D layered stacking
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : undefined,
          transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Layer 1: Back Plate [translateZ(-12px)] */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4d3d0f 0%, #1a1505 100%)',
          border: '4px solid #8c6d12',
          transform: 'translateZ(-12px)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
          boxSizing: 'border-box'
        }} />

        {/* Layer 2: 3D Side Rim Extrusion Filler (Multiple layered rings for depth) */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.45)',
              background: 'transparent',
              transform: `translateZ(${-10 + (i * 2)}px)`,
              boxSizing: 'border-box',
              pointerEvents: 'none'
            }}
          />
        ))}

        {/* Layer 3: Central Base Face [translateZ(0px)] */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #2a2209 0%, #0d0b04 90%)',
          border: '4px solid #ffd700',
          transform: 'translateZ(0px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 25px rgba(0,0,0,0.95)',
          boxSizing: 'border-box'
        }}>
          {/* Circular Circuit tracks inside Base Face */}
          <div style={{
            position: 'absolute',
            width: '84%',
            height: '84%',
            borderRadius: '50%',
            border: '1px dashed rgba(212,175,55,0.2)',
          }} />
          <div style={{
            position: 'absolute',
            width: '68%',
            height: '68%',
            borderRadius: '50%',
            border: '1.5px solid rgba(212,175,55,0.08)',
          }} />
        </div>

        {/* Layer 4: Floating Star Inner Accents [translateZ(6px)] */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'translateZ(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {/* Staking stats ring */}
          <div style={{
            position: 'absolute',
            width: '56%',
            height: '56%',
            borderRadius: '50%',
            border: '1.5px double rgba(255, 215, 0, 0.55)',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.15)'
          }} />
        </div>

        {/* Layer 5: Parallax Text Emblem & Crown [translateZ(14px)] */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: 'translateZ(14px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {/* IMX Logo Text */}
          <h2 style={{
            fontFamily: 'var(--font-display, "Outfit", "Inter", sans-serif)',
            fontSize: `${size * 0.075}px`,
            fontWeight: 950,
            margin: 0,
            padding: 0,
            background: 'linear-gradient(135deg, #ffffff 10%, #ffd700 60%, #b8860b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.85))',
            letterSpacing: '4px',
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: 1.15
          }}>
            AUREX<br/>CAPITAL
          </h2>
        </div>

        {/* Layer 6: Dynamic Floating Reflections & Shine Overlay [translateZ(20px)] */}
        <motion.div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 65%)',
            mixBlendMode: 'overlay',
            transform: 'translateZ(20px)',
            pointerEvents: 'none',
            left: isHovered ? shineLeft : '20%',
            top: isHovered ? shineTop : '20%',
            transition: isHovered ? 'none' : 'left 0.6s ease, top 0.6s ease'
          }}
        />

        {/* Outer Shine Sheen Flare Effect (glass reflection) */}
        <div style={{
          position: 'absolute',
          width: '98%',
          height: '98%',
          left: '1%',
          top: '1%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.1) 100%)',
          transform: 'translateZ(22px)',
          pointerEvents: 'none'
        }} />
      </motion.div>
    </div>
  );
}
