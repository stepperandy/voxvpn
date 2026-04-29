import { motion } from 'framer-motion';
import { Lock, Shield, Globe, Zap, Play, ArrowRight, Eye, EyeOff, Wifi, Key, Fingerprint, ShieldCheck, RadioTower, Server } from 'lucide-react';

const FLYING_ICONS = [
  { Icon: Lock,        x: '8%',  y: '15%', size: 18, duration: 14, delay: 0,   rotate: 25  },
  { Icon: ShieldCheck, x: '88%', y: '10%', size: 22, duration: 18, delay: 1,   rotate: -15 },
  { Icon: Key,         x: '5%',  y: '55%', size: 16, duration: 12, delay: 2.5, rotate: 40  },
  { Icon: Wifi,        x: '92%', y: '45%', size: 20, duration: 16, delay: 0.8, rotate: -30 },
  { Icon: Globe,       x: '15%', y: '78%', size: 24, duration: 20, delay: 1.5, rotate: 10  },
  { Icon: Eye,         x: '82%', y: '75%', size: 17, duration: 13, delay: 3,   rotate: -20 },
  { Icon: Fingerprint, x: '75%', y: '20%', size: 21, duration: 17, delay: 0.5, rotate: 35  },
  { Icon: Server,      x: '20%', y: '35%', size: 15, duration: 11, delay: 2,   rotate: -10 },
  { Icon: RadioTower,  x: '60%', y: '82%', size: 19, duration: 15, delay: 1.2, rotate: 20  },
  { Icon: EyeOff,      x: '40%', y: '8%',  size: 16, duration: 19, delay: 3.5, rotate: -25 },
];

const TRUST_BADGES = [
  { icon: Lock,   label: 'No-Logs Policy' },
  { icon: Shield, label: 'AES-256 Bit' },
  { icon: Globe,  label: '10+ Locations' },
  { icon: Zap,    label: 'Kill Switch' },
];

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-[#06080f] flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-4">

      {/* Dot grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(34,211,238,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      {/* Bottom cyan glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[340px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.22) 0%, transparent 70%)' }}
      />

      {/* Top subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
      />

      {/* Flying security objects */}
      {FLYING_ICONS.map(({ Icon, x, y, size, duration, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: x, top: y }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.18, 0.12, 0.2, 0],
            y: [0, -30, -55, -80, -110],
            x: [0, 12 * (i % 2 === 0 ? 1 : -1), 6, 18 * (i % 2 === 0 ? 1 : -1), 0],
            rotate: [rotate, rotate + 20, rotate - 10, rotate + 30, rotate],
            scale: [0.8, 1, 1.1, 0.95, 0.7],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={size} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.5))' }} />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          style={{
            background: 'linear-gradient(90deg, #a78bfa 0%, #22d3ee 55%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Your Privacy. Fully Protected.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-slate-400 text-lg max-w-xl leading-relaxed mb-8"
        >
          VoxVPN shields your identity with military-grade encryption, a strict no-logs policy, and blazing-fast WireGuard servers in 10+ countries.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3 mb-12"
        >
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-7 py-3.5 rounded-xl font-bold text-black text-sm transition-all shadow-lg shadow-cyan-500/25"
            style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}
          >
            Get VoxVPN Now
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-7 py-3.5 rounded-xl font-semibold text-white text-sm border border-white/15 hover:border-white/30 transition-all bg-white/5"
          >
            See How It Works
          </button>
        </motion.div>

        {/* Glowing Shield */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex items-center justify-center mb-10"
        >
          {/* Shield glow blob */}
          <div className="absolute w-72 h-72 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)' }}
          />
          {/* Animated pulse rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-cyan-400/30"
              style={{ width: 160 + i * 60, height: 160 + i * 60 }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            />
          ))}
          {/* Shield SVG */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <svg width="200" height="228" viewBox="0 0 88 100" fill="none"
              style={{ filter: 'drop-shadow(0 0 24px rgba(34,211,238,0.7)) drop-shadow(0 0 60px rgba(34,211,238,0.3))' }}
            >
              <defs>
                <linearGradient id="shG1" x1="44" y1="2" x2="44" y2="98" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0e7490" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="shG2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              {/* Outer shield */}
              <path d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z"
                fill="url(#shG1)" stroke="#22d3ee" strokeWidth="1.2" strokeOpacity="0.8" />
              {/* Inner shield highlight */}
              <path d="M44 12L14 24V46C14 64 28 80 44 89C60 80 74 64 74 46V24L44 12Z"
                fill="url(#shG2)" opacity="0.15" />
              {/* Left dark panel */}
              <path d="M44 12L14 24V46C14 64 28 80 44 89L44 12Z"
                fill="#060f1a" opacity="0.55" />
              {/* Right lighter panel */}
              <path d="M44 12L74 24V46C74 64 60 80 44 89L44 12Z"
                fill="#0a1e2e" opacity="0.4" />
              {/* Center divider */}
              <line x1="44" y1="12" x2="44" y2="89" stroke="#22d3ee" strokeWidth="0.6" strokeOpacity="0.5" />
              {/* Top edge glow */}
              <path d="M44 2L6 16" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
              <path d="M44 2L82 16" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-10"
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-slate-300 text-sm">
              <Icon size={15} className="text-slate-400" />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* VPN Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(10,16,30,0.92)', backdropFilter: 'blur(16px)' }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            {/* Shield icon */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e3a5f, #0e2240)' }}>
              <Shield size={16} className="text-cyan-400" />
            </div>
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-bold">Protected</span>
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
            <span className="text-base">🇺🇸</span>
            <span className="text-white font-semibold text-sm">New York US</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-0 border-b border-white/5">
            {[
              { value: '193bps', label: 'Download' },
              { value: '2.04bps', label: 'Upload' },
              { value: '38s', label: 'Ping' },
            ].map((s, i) => (
              <div key={s.label} className={`px-4 py-3 ${i < 2 ? 'border-r border-white/5' : ''}`}>
                <p className="text-white font-bold text-sm">{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Disconnect button */}
          <div className="p-3">
            <button className="w-full py-2.5 rounded-xl font-bold text-black text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #06b6d4)' }}>
              Disconnect
            </button>
          </div>
        </motion.div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#06080f] to-transparent pointer-events-none" />
    </div>
  );
}