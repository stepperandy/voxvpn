import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Wifi, Lock, Radio, Globe, Zap, MessageSquare, Phone, Signal } from 'lucide-react';

const orbitIcons = [
  { Icon: Wifi,         angle: 0,   radius: 145, color: '#22d3ee' },
  { Icon: Lock,         angle: 45,  radius: 145, color: '#a78bfa' },
  { Icon: Globe,        angle: 90,  radius: 145, color: '#34d399' },
  { Icon: Radio,        angle: 135, radius: 145, color: '#f472b6' },
  { Icon: Zap,          angle: 180, radius: 145, color: '#fbbf24' },
  { Icon: MessageSquare,angle: 225, radius: 145, color: '#22d3ee' },
  { Icon: Phone,        angle: 270, radius: 145, color: '#c084fc' },
  { Icon: Signal,       angle: 315, radius: 145, color: '#6ee7b7' },
];

function ShieldViz() {
  return (
    <div className="relative flex items-center justify-center w-[510px] h-[510px] sm:w-[670px] sm:h-[670px]">

      {/* Galaxy rings */}
      {[256, 211, 166].map((r, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/15"
          style={{ width: r * 2, height: r * 2 }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 16 + i * 6, repeat: Infinity, ease: 'linear' }}
        >
          {/* Dot on ring */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full blur-[1px] ${
            i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-violet-400' : 'bg-pink-400'
          }`} />
        </motion.div>
      ))}

      {/* Orbiting communication icons */}
      <motion.div
        className="absolute w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        {orbitIcons.map(({ Icon, angle, color }, idx) => {
          const rad = (angle * Math.PI) / 180;
          const r = 232;
          const x = r * Math.cos(rad);
          const y = r * Math.sin(rad);
          return (
            <motion.div
              key={idx}
              className="absolute flex items-center justify-center w-14 h-14 rounded-xl bg-[#0a0f1e] border border-white/10"
              style={{
                left: `calc(50% + ${x}px - 28px)`,
                top: `calc(50% + ${y}px - 28px)`,
                boxShadow: `0 0 12px ${color}55`,
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <Icon size={24} color={color} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Pulse rings emitting from shield */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-400/40"
          style={{ width: 144, height: 144 }}
          animate={{ scale: [1, 3.2], opacity: [0.7, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.9 }}
        />
      ))}

      {/* Shield glow blob */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{ width: 288, height: 288, background: 'radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Shield SVG — expanding with light */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.12, 1],
          filter: [
            'drop-shadow(0 0 10px #22d3ee) drop-shadow(0 0 30px #22d3ee44)',
            'drop-shadow(0 0 32px #22d3ee) drop-shadow(0 0 80px #22d3eeaa)',
            'drop-shadow(0 0 10px #22d3ee) drop-shadow(0 0 30px #22d3ee44)',
          ],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="208" height="237" viewBox="0 0 88 100" fill="none">
          <path
            d="M44 2L6 16V46C6 68 24 88 44 98C64 88 82 68 82 46V16L44 2Z"
            fill="url(#shieldGrad)"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          <path
            d="M44 10L12 22V46C12 65 28 83 44 91C60 83 76 65 76 46V22L44 10Z"
            fill="url(#shieldInner)"
            opacity="0.5"
          />
          {/* Lock body */}
          <rect x="33" y="46" width="22" height="17" rx="3" fill="#22d3ee" opacity="0.95" />
          <path d="M37 46V40C37 36.7 40.1 34 44 34C47.9 34 51 36.7 51 40V46" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="55" r="2.5" fill="#080c18" />
          <defs>
            <linearGradient id="shieldGrad" x1="44" y1="2" x2="44" y2="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0e2a3a" />
              <stop offset="100%" stopColor="#051020" />
            </linearGradient>
            <linearGradient id="shieldInner" x1="44" y1="10" x2="44" y2="91" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
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
    <div className="bg-[#080c18] pt-28 pb-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 w-full py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              10,000+ users protected worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Your Privacy,{' '}
              <span className="relative inline-block text-cyan-400 italic">
                Our Priority.
                {/* Curved underline */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 320 12" fill="none" preserveAspectRatio="none">
                  <path d="M4 9 Q80 2 160 7 Q240 12 316 4" stroke="#22d3ee" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9"/>
                </svg>
              </span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              VoxVPN encrypts your connection, hides your identity, and unlocks the internet — on every device, everywhere in the world.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button className="px-7 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-full text-sm transition-all shadow-lg shadow-cyan-500/25">
                Get Protected Now
              </button>
              <button className="px-7 py-3 border border-white/15 hover:border-cyan-500/50 text-white font-semibold rounded-full text-sm transition-all">
                See How It Works
              </button>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              {['No-Logs Policy', 'Blazing Fast', '10+ Locations', 'AES-256 Bit'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Shield Viz */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <ShieldViz />
          </motion.div>
        </div>
      </div>
    </div>
  );
}