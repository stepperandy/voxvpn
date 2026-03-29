import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Server, Cpu, Globe, Wifi, HardDrive, Activity, Search, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const regionNames = {
  lhr: { name: 'London', country: 'United Kingdom', flag: '🇬🇧' },
  lax: { name: 'Los Angeles', country: 'United States', flag: '🇺🇸' },
  ewr: { name: 'New York', country: 'United States', flag: '🇺🇸' },
  ord: { name: 'Chicago', country: 'United States', flag: '🇺🇸' },
  dfw: { name: 'Dallas', country: 'United States', flag: '🇺🇸' },
  sea: { name: 'Seattle', country: 'United States', flag: '🇺🇸' },
  atl: { name: 'Atlanta', country: 'United States', flag: '🇺🇸' },
  mia: { name: 'Miami', country: 'United States', flag: '🇺🇸' },
  sgp: { name: 'Singapore', country: 'Singapore', flag: '🇸🇬' },
  ams: { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱' },
  fra: { name: 'Frankfurt', country: 'Germany', flag: '🇩🇪' },
  par: { name: 'Paris', country: 'France', flag: '🇫🇷' },
  nrt: { name: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  syd: { name: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  yto: { name: 'Toronto', country: 'Canada', flag: '🇨🇦' },
  bom: { name: 'Mumbai', country: 'India', flag: '🇮🇳' },
  jnb: { name: 'Johannesburg', country: 'South Africa', flag: '🇿🇦' },
  mad: { name: 'Madrid', country: 'Spain', flag: '🇪🇸' },
  waw: { name: 'Warsaw', country: 'Poland', flag: '🇵🇱' },
  sto: { name: 'Stockholm', country: 'Sweden', flag: '🇸🇪' },
};

export default function ServersView() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchServers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await base44.functions.invoke('getVultrServers', {});
      setServers(res.data.servers || []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchServers(); }, []);

  const online = servers.filter(s => s.status === 'active' && s.power === 'running').length;
  const offline = servers.length - online;

  const filtered = servers.filter(s => {
    const region = regionNames[s.location];
    const name = region ? region.name : s.location;
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      s.ip?.includes(search);
    const isOnline = s.status === 'active' && s.power === 'running';
    const matchStatus = statusFilter === 'all' || (statusFilter === 'online' && isOnline) || (statusFilter === 'offline' && !isOnline);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Servers', value: servers.length, color: 'text-white' },
          { label: 'Online', value: online, color: 'text-cyan-400' },
          { label: 'Offline', value: offline, color: 'text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[#0d1120] border border-white/5 px-5 py-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, location or IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0d1120] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {['all', 'online', 'offline'].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === f
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'bg-[#0d1120] text-slate-500 border border-white/5 hover:text-white'
              }`}
            >{f === 'all' ? 'All' : f}</button>
          ))}
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-xl bg-[#0d1120] border border-white/5 text-slate-500 hover:text-white transition-colors"
          >
            {viewMode === 'grid' ? <List size={15} /> : <LayoutGrid size={15} />}
          </button>
          <button onClick={() => fetchServers(true)} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d1120] border border-white/5 text-slate-400 hover:text-white text-xs transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-slate-600 text-xs">Last updated: {lastRefresh.toLocaleTimeString()}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32 gap-2 text-slate-400">
          <Loader2 size={20} className="animate-spin text-cyan-400" />
          <span className="text-sm">Fetching live server data...</span>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, idx) => {
            const region = regionNames[s.location] || { name: s.location.toUpperCase(), country: '', flag: '🌐' };
            const isOnline = s.status === 'active' && s.power === 'running';
            const ram = s.ram >= 1024 ? `${s.ram / 1024} GB` : `${s.ram} MB`;

            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-2xl border bg-[#0d1120] p-5 hover:shadow-lg transition-all ${
                  isOnline ? 'border-white/5 hover:border-cyan-500/20' : 'border-rose-500/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{s.name}</p>
                      <p className="text-slate-500 text-[11px]">{region.name} · {region.country}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-bold ${
                    isOnline ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
                    {isOnline ? 'Running' : 'Offline'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/3 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Wifi size={11} /> IP</div>
                    <p className="text-white font-mono text-[11px]">{s.ip}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Globe size={11} /> Region</div>
                    <p className="text-white uppercase text-[11px]">{s.location}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Cpu size={11} /> vCPUs</div>
                    <p className="text-white">{s.vcpu} Core{s.vcpu > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1"><Activity size={11} /> RAM</div>
                    <p className="text-white">{ram}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2.5 col-span-2">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1"><HardDrive size={11} /> OS</div>
                    <p className="text-white text-[11px] truncate">{s.os}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
          <div className="hidden md:grid grid-cols-6 gap-4 px-5 py-3 border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            <span>Status</span><span>Server</span><span>Location</span><span>IP Address</span><span>Resources</span><span>OS</span>
          </div>
          {filtered.map((s, idx) => {
            const region = regionNames[s.location] || { name: s.location.toUpperCase(), country: '', flag: '🌐' };
            const isOnline = s.status === 'active' && s.power === 'running';
            const ram = s.ram >= 1024 ? `${s.ram / 1024}GB` : `${s.ram}MB`;
            return (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center px-5 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={`text-xs font-semibold ${isOnline ? 'text-cyan-400' : 'text-rose-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{s.name}</p>
                </div>
                <div className="flex items-center gap-2 hidden md:flex">
                  <span className="text-xl">{region.flag}</span>
                  <div>
                    <p className="text-white text-xs">{region.name}</p>
                    <p className="text-slate-500 text-[10px]">{region.country}</p>
                  </div>
                </div>
                <p className="text-slate-300 text-xs font-mono hidden md:block">{s.ip}</p>
                <p className="text-slate-400 text-xs hidden md:block">{s.vcpu} vCPU · {ram}</p>
                <p className="text-slate-500 text-xs truncate hidden md:block">{s.os?.split(' ').slice(0, 3).join(' ')}</p>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-600 text-sm">No servers match your filters.</div>
          )}
        </div>
      )}

      {!loading && (
        <p className="text-slate-700 text-xs text-center">Showing {filtered.length} of {servers.length} servers</p>
      )}
    </div>
  );
}