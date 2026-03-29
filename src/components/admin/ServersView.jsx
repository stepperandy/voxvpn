import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Server, Cpu, MemoryStick } from 'lucide-react';
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
};

export default function ServersView() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await base44.functions.invoke('getVultrServers', {});
      setServers(res.data.servers || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchServers(); }, []);

  const online = servers.filter(s => s.status === 'active' && s.power === 'running').length;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">{servers.length} servers</span>
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">{online} online</span>
          {online < servers.length && (
            <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 font-medium">{servers.length - online} offline</span>
          )}
        </div>
        <button
          onClick={() => fetchServers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span className="text-sm">Fetching live server data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servers.map((s, idx) => {
            const region = regionNames[s.location] || { name: s.location.toUpperCase(), country: '', flag: '🌐' };
            const isOnline = s.status === 'active' && s.power === 'running';
            const ram = s.ram >= 1024 ? `${s.ram / 1024} GB` : `${s.ram} MB`;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-5 hover:border-cyan-500/20 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{region.flag}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{s.name}</p>
                      <p className="text-slate-500 text-xs">{region.name} · {region.country}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                    isOnline ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                    {isOnline ? 'Running' : 'Offline'}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <p className="text-slate-500 mb-1">IP Address</p>
                    <p className="text-white font-mono">{s.ip}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <p className="text-slate-500 mb-1">Region</p>
                    <p className="text-white uppercase">{s.location}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <p className="text-slate-500 mb-1">vCPUs</p>
                    <p className="text-white">{s.vcpu} Core{s.vcpu > 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2">
                    <p className="text-slate-500 mb-1">RAM</p>
                    <p className="text-white">{ram}</p>
                  </div>
                  <div className="bg-white/3 rounded-lg px-3 py-2 col-span-2">
                    <p className="text-slate-500 mb-1">OS</p>
                    <p className="text-white">{s.os}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}