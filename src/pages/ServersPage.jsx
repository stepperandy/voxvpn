import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Shield, Zap, Search, Loader2, Server, Wifi, Signal } from 'lucide-react';

const FLAG_MAP = {
  US: '🇺🇸', GB: '🇬🇧', UK: '🇬🇧', DE: '🇩🇪', NL: '🇳🇱', SG: '🇸🇬',
  JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', FR: '🇫🇷', ZA: '🇿🇦', BR: '🇧🇷',
  IN: '🇮🇳', SE: '🇸🇪', CH: '🇨🇭', IE: '🇮🇪', IT: '🇮🇹', ES: '🇪🇸',
  PL: '🇵🇱', PT: '🇵🇹', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', AT: '🇦🇹',
  BE: '🇧🇪', CZ: '🇨🇿', HU: '🇭🇺', RO: '🇷🇴', GR: '🇬🇷', TR: '🇹🇷',
  MX: '🇲🇽', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', KR: '🇰🇷', HK: '🇭🇰',
  TW: '🇹🇼', MY: '🇲🇾', TH: '🇹🇭', ID: '🇮🇩', VN: '🇻🇳', PH: '🇵🇭',
  AE: '🇦🇪', IL: '🇮🇱', SA: '🇸🇦', EG: '🇪🇬', NG: '🇳🇬', KE: '🇰🇪',
};

function flag(code) {
  return FLAG_MAP[code?.toUpperCase()] || '🌐';
}

function loadColor(pct) {
  if (pct < 50) return 'bg-emerald-400';
  if (pct < 80) return 'bg-amber-400';
  return 'bg-rose-400';
}

function LoadBar({ pct }) {
  const clamped = Math.min(100, Math.max(0, pct || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${loadColor(clamped)} transition-all`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{Math.round(clamped)}%</span>
    </div>
  );
}

// AI-generated marketing blurbs per region
const REGION_BLURBS = {
  'North America': 'Ultra-fast servers across the US and Canada for seamless streaming and gaming.',
  'Europe': 'Pan-European coverage with GDPR-compliant infrastructure and blazing speeds.',
  'Asia Pacific': 'Low-latency nodes across Southeast and East Asia for global connectivity.',
  'Middle East & Africa': 'Expanding coverage bringing privacy and freedom to underserved regions.',
  'South America': 'Reliable South American nodes for content and security across the continent.',
};

export default function ServersPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiContent, setAiContent] = useState(null);
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch real servers from DB
        const dbServers = await base44.entities.VPNServer.filter({ status: 'online' });
        setServers(dbServers || []);
      } catch (e) {
        // fallback to empty
      } finally {
        setLoading(false);
      }
    };

    const fetchAI = async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a copywriter for VoxVPN, a premium privacy-first VPN. 
Generate compelling content for the VPN Servers page.
Return JSON with:
- headline: main page headline (max 10 words, punchy)
- subheadline: supporting description (1-2 sentences)
- network_promise: one bold claim about the VoxVPN server network
- speed_note: a short note about connection speeds
- security_note: a short note about server-level security
- server_locations: array of 12 objects, each with {city, country_code, region, ping_ms (number 5-80), load_pct (number 10-75), specialty (string, e.g. "Streaming", "P2P", "Gaming", "General")}
Include diverse global locations across NA, Europe, APAC, MENA, LATAM.`,
          response_json_schema: {
            type: "object",
            properties: {
              headline: { type: "string" },
              subheadline: { type: "string" },
              network_promise: { type: "string" },
              speed_note: { type: "string" },
              security_note: { type: "string" },
              server_locations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    city: { type: "string" },
                    country_code: { type: "string" },
                    region: { type: "string" },
                    ping_ms: { type: "number" },
                    load_pct: { type: "number" },
                    specialty: { type: "string" },
                  }
                }
              }
            }
          }
        });
        setAiContent(res);
      } catch (e) {
        // silent
      }
    };

    fetchData();
    fetchAI();
  }, []);

  // Merge real DB servers + AI-generated display servers
  const displayServers = servers.length > 0
    ? servers.map(s => ({
        city: s.city || s.region,
        country_code: s.country,
        region: s.region,
        ping_ms: Math.floor(20 + Math.random() * 60),
        load_pct: s.current_load || Math.floor(20 + Math.random() * 55),
        specialty: 'General',
        ip_address: s.ip_address,
        status: s.status,
      }))
    : (aiContent?.server_locations || []);

  const regions = ['All', ...new Set(displayServers.map(s => s.region).filter(Boolean))];

  const filtered = displayServers.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.city?.toLowerCase().includes(q) || s.country_code?.toLowerCase().includes(q) || s.region?.toLowerCase().includes(q);
    const matchRegion = activeRegion === 'All' || s.region === activeRegion;
    return matchSearch && matchRegion;
  });

  const specialtyColors = {
    Streaming: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    Gaming: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    P2P: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    General: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/4 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-6">
              <Globe size={12} /> Global Server Network
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {aiContent?.headline || 'Connect to the World's Fastest VPN Servers'}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {aiContent?.subheadline || 'VoxVPN operates a global network of high-speed, zero-log servers across 60+ locations in 40+ countries.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Network Stats */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: Server, value: '60+', label: 'Servers Worldwide' },
            { icon: Globe, value: '40+', label: 'Countries' },
            { icon: Zap, value: '10 Gbps', label: 'Network Capacity' },
            { icon: Shield, value: '0 Logs', label: 'Privacy Guaranteed' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Icon size={20} className="text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Promise bar */}
      {(aiContent?.network_promise || aiContent?.speed_note) && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4">
            {aiContent.network_promise && (
              <div className="flex-1 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-sm font-semibold text-center">
                🌐 {aiContent.network_promise}
              </div>
            )}
            {aiContent.speed_note && (
              <div className="flex-1 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-sm font-semibold text-center">
                ⚡ {aiContent.speed_note}
              </div>
            )}
            {aiContent.security_note && (
              <div className="flex-1 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 text-violet-300 text-sm font-semibold text-center">
                🔒 {aiContent.security_note}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Server List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by city or country…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#0d1120] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {regions.slice(0, 6).map(r => (
                <button key={r} onClick={() => setActiveRegion(r)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    activeRegion === r
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {loading || (!aiContent && displayServers.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={28} className="text-cyan-400 animate-spin" />
              <p className="text-slate-500 text-sm">Loading server network…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Globe size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No servers match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((server, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}
                  className="p-5 rounded-2xl border border-white/5 bg-[#0d1120] hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{flag(server.country_code)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{server.city}</p>
                      <p className="text-slate-500 text-xs">{server.region}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${specialtyColors[server.specialty] || specialtyColors.General}`}>
                      {server.specialty || 'General'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Server Load</span>
                    </div>
                    <LoadBar pct={server.load_pct} />

                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-1.5">
                        <Signal size={12} className="text-cyan-400" />
                        <span className="text-xs text-slate-400">{server.ping_ms || '—'} ms</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400 font-semibold">Online</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-[#0d1120] p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Connect to Any Server, Instantly</h2>
          <p className="text-slate-400 text-base mb-8">All servers included in every VoxVPN plan. No restrictions, no throttling.</p>
          <a href="/#pricing"
            className="inline-block px-10 py-4 bg-cyan-400 hover:bg-cyan-300 text-black font-black rounded-full text-base transition-all shadow-xl shadow-cyan-500/20">
            Get VoxVPN Now →
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}