import { motion } from 'framer-motion';
import { Lock, Shield, Globe, Zap } from 'lucide-react';

const TRUST_BADGES = [
  'No-Logs Policy',
  'AES-256 Bit',
  '10+ Locations',
  'Kill Switch',
];

export default function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden pt-24" style={{ background: '#060010' }}>

      {/* Top neon glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,45,120,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Main two-column layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto w-full px-8 lg:px-16 pt-8 pb-0 flex-1">

        {/* LEFT: Text + CTAs */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl lg:max-w-lg xl:max-w-xl mb-10 lg:mb-0">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-black leading-tight mb-6 text-4xl sm:text-5xl lg:text-6xl"
            style={{
              fontFamily: "'Courier New', monospace",
              background: 'linear-gradient(135deg, #ff2d78 0%, #ff6bb5 50%, #ff2d78 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 20px rgba(255,45,120,0.6))',
            }}
          >
            Your Privacy.<br />Fully Protected.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-slate-300 text-base leading-relaxed mb-8 max-w-md"
          >
            VoxVPN shields your identity with military-grade encryption, a strict no-logs policy, and blazing-fast VoxVPN servers in 10+ countries.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 mb-10"
          >
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 font-bold text-white text-sm transition-all"
              style={{
                border: '2px solid #ff2d78',
                boxShadow: '0 0 16px rgba(255,45,120,0.5), inset 0 0 16px rgba(255,45,120,0.08)',
                background: 'rgba(255,45,120,0.12)',
                borderRadius: '4px',
              }}
            >
              Get VoxVPN Now
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 font-bold text-white text-sm transition-all"
              style={{
                border: '2px solid #00f5ff',
                boxShadow: '0 0 16px rgba(0,245,255,0.4), inset 0 0 16px rgba(0,245,255,0.06)',
                background: 'rgba(0,245,255,0.06)',
                borderRadius: '4px',
              }}
            >
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* RIGHT: Neon Shield with upward beam */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex items-center justify-center flex-shrink-0"
          style={{ width: 360, height: 380 }}
        >
          {/* Upward beam — thin neon line */}
          <div className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '-80px',
              transform: 'translateX(-50%)',
              width: '3px',
              height: '200px',
              background: 'linear-gradient(to top, rgba(0,245,255,1) 0%, rgba(255,45,120,0.7) 50%, transparent 100%)',
              filter: 'blur(1px)',
              boxShadow: '0 0 12px 4px rgba(0,245,255,0.5)',
            }}
          />
          {/* Wide beam glow */}
          <div className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '-80px',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '220px',
              background: 'linear-gradient(to top, rgba(0,245,255,0.2) 0%, rgba(255,45,120,0.1) 50%, transparent 100%)',
              filter: 'blur(25px)',
            }}
          />

          {/* Pulse rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 200 + i * 70,
                height: 200 + i * 70,
                border: `1px solid rgba(255,45,120,${0.25 - i * 0.07})`,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.9, ease: 'easeInOut' }}
            />
          ))}

          {/* Neon Shield SVG */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <svg width="240" height="274" viewBox="0 0 88 100" fill="none"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.8)) drop-shadow(0 0 50px rgba(255,45,120,0.5))',
              }}
            >
              <defs>
                <linearGradient id="neonShieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff2d78" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00f5ff" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="neonEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff2d78" />
                  <stop offset="50%" stopColor="#00f5ff" />
                  <stop offset="100%" stopColor="#ff2d78" />
                </linearGradient>
              </defs>
              {/* Outer shield fill */}
              <path d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z"
                fill="url(#neonShieldFill)" />
              {/* Outer shield border neon */}
              <path d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z"
                fill="none" stroke="url(#neonEdge)" strokeWidth="2" strokeOpacity="0.9" />
              {/* Inner shield */}
              <path d="M44 14L16 26V46C16 63 28 77 44 86C60 77 72 63 72 46V26L44 14Z"
                fill="none" stroke="#00f5ff" strokeWidth="1.2" strokeOpacity="0.5" />
              {/* Center divider */}
              <line x1="44" y1="14" x2="44" y2="86" stroke="#00f5ff" strokeWidth="0.8" strokeOpacity="0.4" />
              {/* Top edge highlights */}
              <path d="M44 2L6 16" stroke="#ff2d78" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
              <path d="M44 2L82 16" stroke="#ff2d78" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust badges row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 flex items-center justify-center gap-3 text-slate-300 text-sm px-4 mb-6"
      >
        {TRUST_BADGES.map((label, i) => (
          <span key={label} className="flex items-center gap-3">
            <span style={{ color: '#a0a0b0' }}>{label}</span>
            {i < TRUST_BADGES.length - 1 && <span style={{ color: '#444' }}>|</span>}
          </span>
        ))}
      </motion.div>

      {/* VPN Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mx-auto mb-0 w-full max-w-xs rounded-lg overflow-hidden"
        style={{
          border: '1px solid rgba(0,245,255,0.3)',
          background: 'rgba(6,0,16,0.95)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(0,245,255,0.1)',
        }}
      >
        <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase">VPN Status Card</span>
        </div>
        <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="font-bold text-sm" style={{ color: '#00ff88' }}>Protected</span>
          <div className="flex items-center gap-2">
            <span>🇺🇸</span>
            <span className="text-white text-sm font-semibold">New York US</span>
          </div>
        </div>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-slate-500 text-xs mb-1">Download/Upload/Ping</p>
          <p className="text-white font-semibold text-sm">85 Mbps / 30 Mbps / 12 ms</p>
        </div>
        <div className="p-3">
          <button className="w-full py-2.5 font-bold text-white text-sm rounded transition-all"
            style={{
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}>
            Disconnect
          </button>
        </div>
      </motion.div>

      {/* City Skyline at bottom */}
      <div className="relative w-full mt-6" style={{ height: '220px', flexShrink: 0 }}>
        <img
          src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/d3ffda47d_generated_image.png"
          alt="Neon City Skyline"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ opacity: 0.85 }}
        />
        {/* Bottom fade */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, #060010 100%)' }} />
        {/* Top fade into bg */}
        <div className="absolute top-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to bottom, #060010, transparent)' }} />
      </div>

    </div>
  );
}