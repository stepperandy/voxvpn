import { motion } from 'framer-motion';
import { CheckCircle, Wifi, Lock, Radio, Globe, Zap, MessageSquare, Phone } from 'lucide-react';
import { useRef } from 'react';

const orbitIcons = [
  { Icon: Wifi, angle: 0, radius: 130, color: '#22d3ee', duration: 10 },
  { Icon: Lock, angle: 45, radius: 130, color: '#a78bfa', duration: 10 },
  { Icon: Globe, angle: 90, radius: 130, color: '#34d399', duration: 10 },
  { Icon: Radio, angle: 135, radius: 130, color: '#f472b6', duration: 10 },
  { Icon: Zap, angle: 180, radius: 130, color: '#fbbf24', duration: 10 },
  { Icon: MessageSquare, angle: 225, radius: 130, color: '#22d3ee', duration: 10 },
  { Icon: Phone, angle: 270, radius: 130, color: '#c084fc', duration: 10 },
  { Icon: Wifi, angle: 315, radius: 130, color: '#6ee7b7', duration: 10 },
];

function ShieldViz() {
  return (
    <div className="relative flex items-center justify-center w-[420px] h-[420px]">
      {/* Galaxy rings */}
      {[210, 178, 142].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/20"
          style={{ width: r * 2, height: r * 2 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.03, 1] }}
          transition={{ rotate: { duration: 18 + i * 5, repeat: Infinity, ease: 'linear' }, scale: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut' } }}
        >
          {/* Ring dot */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-violet-400' : 'bg-pink-400'}`} />
        </motion.div>
      ))}

      {/* Orbiting icons */}
      <motion.div
        className="absolute w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      >
        {orbitIcons.map(({ Icon, angle, color }, idx) => {
          const rad = (angle * Math.PI) / 180;
          const x = 160 * Math.cos(rad);
          const y = 160 * Math.sin(rad);
          return (
            <motion.div
              key={idx}
              className="absolute flex items-center justify-center w-9 h-9 rounded-full bg-[#0d1120] border border-white/10"
              style={{
                left: `calc(50% + ${x}px - 18px)`,
                top: `calc(50% + ${y}px - 18px)`,
                boxShadow: `0 0 10px ${color}55`,
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Icon size={16} color={color} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pulse rings from shield */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/30"
          style={{ width: 100, height: 100 }}
          animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: i * 0.8 }}
        />
      ))}

      {/* Shield glow bg */}
      <motion.div
        className="absolute w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shield icon */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.08, 1],
          filter: [
            'drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 20px #22d3ee55)',
            'drop-shadow(0 0 24px #22d3ee) drop-shadow(0 0 50px #22d3ee88)',
            'drop-shadow(0 0 8px #22d3ee) drop-shadow(0 0 20px #22d3ee55)',
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* SVG shield custom shape */}
        <svg width="120" height="136" viewBox="0 0 88 100" fill="none">
          <path
            d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z"
            fill="url(#shieldGrad)"
            stroke="#22d3ee"
            strokeWidth="2"
          />
          <path
            d="M44 10L12 22V46C12 65 28 83 44 91C60 83 76 65 76 46V22L44 10Z"
            fill="url(#shieldInner)"
            opacity="0.6"
          />
          {/* Lock icon inside */}
          <rect x="33" y="45" width="22" height="18" rx="3" fill="#22d3ee" opacity="0.9" />
          <path d="M37 45V39C37 35.7 40.1 33 44 33C47.9 33 51 35.7 51 39V45" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="54" r="3" fill="#080c18" />
          <defs>
            <linearGradient id="shieldGrad" x1="44" y1="2" x2="44" y2="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0e2a3a" />
              <stop offset="100%" stopColor="#051020" />
            </linearGradient>
            <linearGradient id="shieldInner" x1="44" y1="10" x2="44" y2="91" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#080c18] pt-14 flex items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,200,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Home</span>
              <span>/</span>
              <span className="text-cyan-400">VPN Service</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight">
              Your<br />Privacy,{' '}
              <span className="relative inline-block text-cyan-400">
                Our Priority.
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 10" fill="none" preserveAspectRatio="none">
                  <path d="M2 7 Q75 2 150 7 Q225 12 298 5" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
                </svg>
              </span>
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed max-w-lg font-medium">
              VoxVPN encrypts your connection and hides your identity — on every device, everywhere in the world. AES-256 Encryption, no logs, blazing fast.
            </p>

            <div className="flex flex-wrap gap-4 pt-1">
              <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-lg text-base transition-all shadow-lg shadow-cyan-500/30">
                Get Protected Now
              </button>
              <button className="px-8 py-4 border border-slate-600 hover:border-cyan-500 text-white hover:text-cyan-400 font-bold rounded-lg text-base transition-all">
                Learn More
              </button>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              {['No-Logs Policy', 'Blazing Fast', '10+ Locations', 'AES-256 Bit'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <ShieldViz />
          </motion.div>
        </div>
      </div>
    </div>
  );
}