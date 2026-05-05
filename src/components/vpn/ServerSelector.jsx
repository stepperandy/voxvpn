import { useState, useMemo } from 'react';
import { Search, Zap, Signal } from 'lucide-react';

export default function ServerSelector({ servers, selectedServer, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');

  const regions = useMemo(() => {
    const unique = new Set(servers.map(s => s.country));
    return Array.from(unique).sort();
  }, [servers]);

  const filtered = useMemo(() => {
    return servers.filter(s => {
      const matchSearch = s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = filterRegion === 'all' || s.country === filterRegion;
      return matchSearch && matchRegion;
    });
  }, [servers, searchTerm, filterRegion]);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search servers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0d1120] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/10 transition-all"
        />
      </div>

      {/* Region filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterRegion('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            filterRegion === 'all'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
          }`}
        >
          All
        </button>
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setFilterRegion(region)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterRegion === region
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Server grid */}
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {filtered.map(server => (
          <button
            key={server.id}
            onClick={() => onSelect(server)}
            className={`p-3 rounded-lg border transition-all text-left ${
              selectedServer.id === server.id
                ? 'bg-cyan-500/10 border-cyan-500/40'
                : 'bg-[#0d1120] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{server.flag}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${
                  selectedServer.id === server.id ? 'text-cyan-400' : 'text-white'
                }`}>
                  {server.city}
                </p>
                <p className="text-slate-500 text-xs truncate">{server.country}</p>
                {/* Server stats */}
                {server.load !== undefined && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs">
                    <Zap size={10} className={server.load < 50 ? 'text-emerald-400' : 'text-amber-400'} />
                    <span className="text-slate-500">{server.load}%</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm">
          No servers found
        </div>
      )}
    </div>
  );
}