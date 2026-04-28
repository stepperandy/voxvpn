import { useState } from 'react';

const SERVER_LOCATIONS = [
  { key: 'lhr', name: 'London',       country: 'United Kingdom', flag: '🇬🇧', x: 48.5, y: 28 },
  { key: 'ewr', name: 'New York',     country: 'United States',  flag: '🇺🇸', x: 23,   y: 32 },
  { key: 'lax', name: 'Los Angeles',  country: 'United States',  flag: '🇺🇸', x: 14,   y: 35 },
  { key: 'ord', name: 'Chicago',      country: 'United States',  flag: '🇺🇸', x: 20,   y: 30 },
  { key: 'mia', name: 'Miami',        country: 'United States',  flag: '🇺🇸', x: 22,   y: 40 },
  { key: 'yto', name: 'Toronto',      country: 'Canada',         flag: '🇨🇦', x: 22,   y: 27 },
  { key: 'ams', name: 'Amsterdam',    country: 'Netherlands',    flag: '🇳🇱', x: 50,   y: 26 },
  { key: 'fra', name: 'Frankfurt',    country: 'Germany',        flag: '🇩🇪', x: 51.5, y: 27 },
  { key: 'par', name: 'Paris',        country: 'France',         flag: '🇫🇷', x: 49,   y: 29 },
  { key: 'sto', name: 'Stockholm',    country: 'Sweden',         flag: '🇸🇪', x: 53,   y: 20 },
  { key: 'sgp', name: 'Singapore',    country: 'Singapore',      flag: '🇸🇬', x: 78,   y: 54 },
  { key: 'nrt', name: 'Tokyo',        country: 'Japan',          flag: '🇯🇵', x: 84,   y: 31 },
  { key: 'syd', name: 'Sydney',       country: 'Australia',      flag: '🇦🇺', x: 84,   y: 73 },
  { key: 'jnb', name: 'Johannesburg', country: 'South Africa',   flag: '🇿🇦', x: 56,   y: 70 },
  { key: 'bom', name: 'Mumbai',       country: 'India',          flag: '🇮🇳', x: 70,   y: 43 },
];

const PROTOCOLS = ['WireGuard', 'OpenVPN', 'IKEv2'];

export default function WorldMap({ servers = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const getServerData = (key) => servers.find(s => s.location === key);
  const isOnline = (s) => s && s.status === 'active' && s.power === 'running';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-[#060a14]" style={{ height: 420 }}>
      {/* World map background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png")`,
          backgroundSize: '96% auto',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.12) saturate(0.3) hue-rotate(180deg)',
        }}
      />

      {/* SVG overlay with pins */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SERVER_LOCATIONS.map((loc) => {
          const serverData = getServerData(loc.key);
          const online = isOnline(serverData);
          const color = serverData ? (online ? '#22d3ee' : '#f43f5e') : '#22d3ee';
          return (
            <g key={loc.key}>
              {/* Pulse ring */}
              <circle
                cx={loc.x}
                cy={loc.y}
                r="1.8"
                fill={color}
                opacity="0.15"
              />
              {/* Main dot */}
              <circle
                cx={loc.x}
                cy={loc.y}
                r="0.9"
                fill={color}
                opacity="0.9"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => setTooltip({ loc, serverData, online, e })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${tooltip.loc.x}%`,
            top: `${tooltip.loc.y}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className="bg-[#0a1020]/97 border border-cyan-500/25 rounded-xl p-3 min-w-[180px] shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{tooltip.loc.flag}</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">{tooltip.loc.name}</p>
                <p className="text-slate-400 text-[11px]">{tooltip.loc.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full ${tooltip.serverData ? (tooltip.online ? 'bg-cyan-400' : 'bg-rose-500') : 'bg-cyan-400'}`} />
              <span className={`text-xs font-semibold ${tooltip.serverData ? (tooltip.online ? 'text-cyan-400' : 'text-rose-400') : 'text-cyan-400'}`}>
                {tooltip.serverData ? (tooltip.online ? 'Online' : 'Offline') : 'Available'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {PROTOCOLS.map(p => (
                <span key={p} className="px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-[#060a14]/80 backdrop-blur-sm border-t border-white/5 z-10">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Online</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Offline</span>
        </div>
        <p className="text-slate-600 text-xs">{SERVER_LOCATIONS.length} locations · Hover a pin for details</p>
      </div>
    </div>
  );
}