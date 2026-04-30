import { motion } from 'framer-motion';
import { Signal, Loader2, Globe, Zap, Shield, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import WorldMap from './WorldMap';

const regionNames = {
  lhr: { name: 'London',        country: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  lax: { name: 'Los Angeles',   country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  ewr: { name: 'New York',      country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  ord: { name: 'Chicago',       country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  dfw: { name: 'Dallas',        country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  sea: { name: 'Seattle',       country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  atl: { name: 'Atlanta',       country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  mia: { name: 'Miami',         country: 'United States',  flag: '🇺🇸', region: 'Americas' },
  sgp: { name: 'Singapore',     country: 'Singapore',      flag: '🇸🇬', region: 'Asia Pacific' },
  ams: { name: 'Amsterdam',     country: 'Netherlands',    flag: '🇳🇱', region: 'Europe' },
  fra: { name: 'Frankfurt',     country: 'Germany',        flag: '🇩🇪', region: 'Europe' },
  par: { name: 'Paris',         country: 'France',         flag: '🇫🇷', region: 'Europe' },
  nrt: { name: 'Tokyo',         country: 'Japan',          flag: '🇯🇵', region: 'Asia Pacific' },
  syd: { name: 'Sydney',        country: 'Australia',      flag: '🇦🇺', region: 'Asia Pacific' },
  yto: { name: 'Toronto',       country: 'Canada',         flag: '🇨🇦', region: 'Americas' },
  bom: { name: 'Mumbai',        country: 'India',          flag: '🇮🇳', region: 'Asia Pacific' },
  jnb: { name: 'Johannesburg',  country: 'South Africa',   flag: '🇿🇦', region: 'Africa' },
  mad: { name: 'Madrid',        country: 'Spain',          flag: '🇪🇸', region: 'Europe' },
  waw: { name: 'Warsaw',        country: 'Poland',         flag: '🇵🇱', region: 'Europe' },
  sto: { name: 'Stockholm',     country: 'Sweden',         flag: '🇸🇪', region: 'Europe' },
};

const REGION_GROUPS = [
  { name: 'Americas',     flag: '🌎', color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/25' },
  { name: 'Europe',       flag: '🌍', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
  { name: 'Asia Pacific', flag: '🌏', color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/25' },
  { name: 'Africa',       flag: '🌍', color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25' },
];

const PERKS = [
  { icon: Zap,    label: 'VoxVPN Protocol',        desc: 'Industry-leading encryption' },
  { icon: Shield, label: 'AES-256 Encrypted',    desc: 'Military-grade security' },
  { icon: Wifi,   label: '10 Gbps Uplinks',      desc: 'Blazing-fast backbone' },
  { icon: Globe,  label: '4 Continents',         desc: 'Truly global coverage' },
];

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getVultrServers', {})
      .then((res) => setServers(res.data.servers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isOnline = (s) => s?.status === 'active' && s?.power === 'running';
  const onlineCount = servers.filter(isOnline).length;

  // Group servers by region
  const serversByRegion = {};
  Object.entries(regionNames).forEach(([key, info]) => {
    if (!serversByRegion[info.region]) serversByRegion[info.region] = [];
    serversByRegion[info.region].push({ key, ...info });
  });

  return (
    <section id="servers" className="bg-[#06080f] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* BG glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #22d3ee 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Global Network</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Servers on Every
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Continent</span>
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Connect through our high-speed infrastructure in 10+ countries. Every server runs VoxVPN with AES-256 encryption.
          </p>
        </motion.div>

        {/* Live counter strip */}
        {!loading && servers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-6 mb-8 flex-wrap"
          >
            {[
              { label: 'Total Servers', value: servers.length, color: 'text-white' },
              { label: 'Online Now', value: onlineCount, color: 'text-emerald-400' },
              { label: 'Locations', value: Object.keys(regionNames).length, color: 'text-cyan-400' },
              { label: 'Uptime', value: '99.8%', color: 'text-violet-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/3">
                <span className={`text-lg font-black ${color}`}>{value}</span>
                <span className="text-slate-500 text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* World Map — large and bold */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-white/5 bg-[#040810]">
              <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
              <p className="text-slate-400 text-sm">Loading live server network…</p>
            </div>
          ) : (
            <WorldMap servers={servers} />
          )}
        </motion.div>

        {/* Region cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {REGION_GROUPS.map(({ name, flag, color, bg }, i) => {
            const locs = serversByRegion[name] || [];
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`p-5 rounded-2xl border ${bg}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{flag}</span>
                  <div>
                    <p className={`font-black text-sm ${color}`}>{name}</p>
                    <p className="text-slate-500 text-xs">{locs.length} locations</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {locs.slice(0, 5).map(loc => (
                    <span key={loc.key} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {loc.flag} {loc.name}
                    </span>
                  ))}
                  {locs.length > 5 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500">+{locs.length - 5} more</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Network perks row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {PERKS.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/2"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-bold text-xs">{label}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}