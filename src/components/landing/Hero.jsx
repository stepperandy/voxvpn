import { motion } from 'framer-motion';

const TRUST_BADGES = [
  'No-Logs Policy',
  'AES-256 Bit',
  '20 Locations',
  'Kill Switch',
];

export default function Hero() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-24"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, #0d0118 40%, #080010 100%)' }}
    >
      {/* Mesh wave background image — upper portion */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '62%',
          backgroundImage: `url("https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/1dab58cfb_generated_image.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 1,
        }}
      />
      {/* Fade mesh into dark bg */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: '30%',
          height: '32%',
          background: 'linear-gradient(to bottom, transparent, #0d0118)',
        }}
      />

      {/* 3D Shield — centered, overlapping mesh */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-center"
        style={{ marginTop: '20px', marginBottom: '-20px' }}
      >
        <svg
          width="180"
          height="210"
          viewBox="0 0 88 100"
          fill="none"
          style={{
            filter:
              'drop-shadow(0 0 30px rgba(130,80,255,0.8)) drop-shadow(0 0 60px rgba(100,50,220,0.4))',
          }}
        >
          <defs>
            <linearGradient id="shieldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="shieldRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          {/* Left half */}
          <path
            d="M44 4L8 18V48C8 70 24 88 44 98V4Z"
            fill="url(#shieldLeft)"
          />
          {/* Right half */}
          <path
            d="M44 4L80 18V48C80 70 64 88 44 98V4Z"
            fill="url(#shieldRight)"
          />
          {/* Border */}
          <path
            d="M44 4L8 18V48C8 70 24 88 44 98C64 88 80 70 80 48V18L44 4Z"
            fill="none"
            stroke="url(#shieldBorder)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Center line */}
          <line x1="44" y1="4" x2="44" y2="98" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Highlight */}
          <path
            d="M44 4L8 18V32C20 28 32 22 44 20V4Z"
            fill="rgba(255,255,255,0.12)"
          />
        </svg>
      </motion.div>

      {/* Main content block */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto w-full">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-black text-white leading-tight mb-0"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            letterSpacing: '-0.02em',
          }}
        >
          Your Privacy. Fully Protected.
        </motion.h1>

        {/* Gradient underline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-3 mb-6 rounded-full"
          style={{
            height: '3px',
            width: '340px',
            maxWidth: '80%',
            background: 'linear-gradient(90deg, #ec4899, #a855f7, #06b6d4)',
          }}
        />

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
        >
          VoxVPN shields your identity with military-grade encryption, a strict
          no-logs policy, and blazing-fast VoxVPN servers in 20 locations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-4 mb-8 flex-wrap justify-center"
        >
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 font-bold text-white text-sm rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}
          >
            Get VoxVPN Now
          </button>
          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3 font-bold text-white text-sm rounded-lg transition-all hover:bg-white/10 active:scale-95"
            style={{
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            See How It Works
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-8 flex-wrap"
        >
          {TRUST_BADGES.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              <span>{label}</span>
              {i < TRUST_BADGES.length - 1 && <span className="text-slate-600">|</span>}
            </span>
          ))}
        </motion.div>

        {/* VPN Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-xl rounded-xl overflow-hidden"
          style={{
            background: 'rgba(20, 10, 40, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="px-6 py-2 text-center text-white font-semibold text-sm border-b"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            VPN Status Card
          </div>
          <div className="px-6 py-3 flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="font-bold" style={{ color: '#4ade80' }}>Protected</span>
            <span className="text-slate-400">·</span>
            <span className="text-white">New York US</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">85 Mbps / 30 Mbps / 12 ms</span>
            <span className="text-slate-400">·</span>
            <button className="font-bold text-white hover:text-slate-300 transition-colors">Disconnect</button>
          </div>
        </motion.div>
      </div>

      {/* Bottom padding */}
      <div className="pb-16" />
    </div>
  );
}