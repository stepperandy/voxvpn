import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SERVER_LOCATIONS = [
  { key: 'lhr', name: 'London',        country: 'United Kingdom', flag: '🇬🇧', x: 48.5, y: 28,   region: 'Europe' },
  { key: 'ewr', name: 'New York',      country: 'United States',  flag: '🇺🇸', x: 23,   y: 32,   region: 'Americas' },
  { key: 'lax', name: 'Los Angeles',   country: 'United States',  flag: '🇺🇸', x: 14,   y: 35,   region: 'Americas' },
  { key: 'ord', name: 'Chicago',       country: 'United States',  flag: '🇺🇸', x: 20,   y: 30,   region: 'Americas' },
  { key: 'mia', name: 'Miami',         country: 'United States',  flag: '🇺🇸', x: 22,   y: 40,   region: 'Americas' },
  { key: 'yto', name: 'Toronto',       country: 'Canada',         flag: '🇨🇦', x: 22,   y: 27,   region: 'Americas' },
  { key: 'ams', name: 'Amsterdam',     country: 'Netherlands',    flag: '🇳🇱', x: 50,   y: 26,   region: 'Europe' },
  { key: 'fra', name: 'Frankfurt',     country: 'Germany',        flag: '🇩🇪', x: 51.5, y: 27,   region: 'Europe' },
  { key: 'par', name: 'Paris',         country: 'France',         flag: '🇫🇷', x: 49,   y: 29,   region: 'Europe' },
  { key: 'sto', name: 'Stockholm',     country: 'Sweden',         flag: '🇸🇪', x: 53,   y: 20,   region: 'Europe' },
  { key: 'mad', name: 'Madrid',        country: 'Spain',          flag: '🇪🇸', x: 46,   y: 33,   region: 'Europe' },
  { key: 'sgp', name: 'Singapore',     country: 'Singapore',      flag: '🇸🇬', x: 78,   y: 54,   region: 'Asia Pacific' },
  { key: 'nrt', name: 'Tokyo',         country: 'Japan',          flag: '🇯🇵', x: 84,   y: 31,   region: 'Asia Pacific' },
  { key: 'syd', name: 'Sydney',        country: 'Australia',      flag: '🇦🇺', x: 84,   y: 73,   region: 'Asia Pacific' },
  { key: 'jnb', name: 'Johannesburg',  country: 'South Africa',   flag: '🇿🇦', x: 56,   y: 70,   region: 'Africa' },
  { key: 'bom', name: 'Mumbai',        country: 'India',          flag: '🇮🇳', x: 70,   y: 43,   region: 'Asia Pacific' },
];

// Connection lines between key hubs
const CONNECTIONS = [
  { from: 'ewr', to: 'lhr' },
  { from: 'lhr', to: 'fra' },
  { from: 'fra', to: 'sgp' },
  { from: 'sgp', to: 'nrt' },
  { from: 'ewr', to: 'mia' },
  { from: 'lax', to: 'nrt' },
  { from: 'bom', to: 'sgp' },
  { from: 'lhr', to: 'jnb' },
  { from: 'yto', to: 'lax' },
];

function getLocation(key) {
  return SERVER_LOCATIONS.find(l => l.key === key);
}

export default function WorldMap({ servers = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const getServerData = (key) => servers.find(s => s.location === key);
  const isOnline = (s) => s && s.status === 'active' && s.power === 'running';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/20 bg-[#040810]" style={{ height: 480 }}>

      {/* Glowing background radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* World map image — high contrast */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png")`,
          backgroundSize: '94% auto',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.55) saturate(0.8) hue-rotate(180deg)',
        }}
      />

      {/* SVG layer — connections + pins */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="pinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {CONNECTIONS.map(({ from, to }) => {
          const f = getLocation(from);
          const t2 = getLocation(to);
          if (!f || !t2) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={f.x} y1={f.y}
              x2={t2.x} y2={t2.y}
              stroke="#22d3ee"
              strokeWidth="0.15"
              strokeOpacity="0.25"
              strokeDasharray="0.8 0.8"
            />
          );
        })}

        {/* Server pins */}
        {SERVER_LOCATIONS.map((loc) => {
          const serverData = getServerData(loc.key);
          const online = isOnline(serverData);
          const color = serverData ? (online ? '#22d3ee' : '#f43f5e') : '#22d3ee';
          const isHovered = tooltip?.loc.key === loc.key;

          return (
            <g key={loc.key}
              onMouseEnter={() => setTooltip({ loc, serverData, online })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer pulse ring */}
              <circle cx={loc.x} cy={loc.y} r="3" fill={color} opacity="0.06" />
              {/* Mid ring */}
              <circle cx={loc.x} cy={loc.y} r="1.8" fill={color} opacity="0.12" />
              {/* Core dot */}
              <circle cx={loc.x} cy={loc.y} r="0.9" fill={color} opacity="0.95" filter="url(#glow)" />
              {/* Hover ring */}
              {isHovered && (
                <circle cx={loc.x} cy={loc.y} r="2.5" fill="none" stroke={color} strokeWidth="0.3" opacity="0.7" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Animated CSS pulses on top of SVG */}
      {SERVER_LOCATIONS.map((loc, i) => (
        <motion.div
          key={`pulse-${loc.key}`}
          className="absolute rounded-full border border-cyan-400"
          style={{
            left: `${loc.x}%`,
            top: `${loc.y}%`,
            width: 20,
            height: 20,
            marginLeft: -10,
            marginTop: -10,
          }}
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: (i * 0.18) % 2,
          }}
        />
      ))}

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.loc.key}
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${Math.min(tooltip.loc.x, 78)}%`,
              top: `${Math.max(tooltip.loc.y - 18, 4)}%`,
            }}
          >
            <div className="bg-[#080f1e]/98 border border-cyan-500/30 rounded-2xl p-3.5 min-w-[200px] shadow-2xl shadow-cyan-500/10">
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-2xl">{tooltip.loc.flag}</span>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{tooltip.loc.name}</p>
                  <p className="text-slate-400 text-xs">{tooltip.loc.country}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    tooltip.serverData ? (tooltip.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500') : 'bg-emerald-400 animate-pulse'
                  }`} />
                  <span className={`text-xs font-bold ${
                    tooltip.serverData ? (tooltip.online ? 'text-emerald-400' : 'text-rose-400') : 'text-emerald-400'
                  }`}>
                    {tooltip.serverData ? (tooltip.online ? 'Online' : 'Offline') : 'Available'}
                  </span>
                </div>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{tooltip.loc.region}</span>
              </div>
              <div className="flex gap-1.5 mt-2.5">
                {['VoxVPN', 'AES-256'].map(p => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">{p}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-3 bg-[#040810]/90 backdrop-blur-sm border-t border-white/5 z-10">
        <div className="flex items-center gap-5 text-xs">
          <span className="flex items-center gap-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block ring-2 ring-cyan-400/30" />
            Online
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Offline
          </span>
        </div>
        <span className="text-slate-500 text-xs">{SERVER_LOCATIONS.length} server locations · Hover a pin for details</span>
      </div>
    </div>
  );
}