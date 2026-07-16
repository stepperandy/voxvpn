import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, RefreshCw, Search, Phone, MessageSquare,
  Mic, Globe, AlertTriangle, CheckCircle2, Clock, Ban, Archive
} from "lucide-react";

const STATUS_CONFIG = {
  available:  { color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  reserved:   { color: "bg-yellow-500/20  text-yellow-300  border-yellow-500/30",  icon: Clock },
  assigned:   { color: "bg-blue-500/20    text-blue-300    border-blue-500/30",    icon: Phone },
  suspended:  { color: "bg-orange-500/20  text-orange-300  border-orange-500/30",  icon: AlertTriangle },
  expired:    { color: "bg-red-500/20     text-red-300     border-red-500/30",     icon: Ban },
  released:   { color: "bg-gray-500/20    text-gray-400    border-gray-500/30",    icon: Archive },
};

const STATUSES = Object.keys(STATUS_CONFIG);
const PAGE_SIZE = 50;

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [filterCap, setFilterCap] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.NumberInventory.list("-last_synced_at", 2000);
      setInventory(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("syncNumberInventory", {});
      const d = res.data;
      alert(`Sync complete: +${d?.telnyx || 0} Telnyx, +${d?.didww || 0} DIDWW, ${d?.released || 0} reservations released`);
      await loadInventory();
    } catch (err) { alert("Sync failed: " + err.message); }
    finally { setSyncing(false); }
  };

  const countries = useMemo(() => ["all", ...new Set(inventory.map(n => n.country_code).filter(Boolean).sort())], [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter(n => {
      if (filterStatus !== "all" && n.status !== filterStatus) return false;
      if (filterCountry !== "all" && n.country_code !== filterCountry) return false;
      if (filterProvider !== "all" && n.provider !== filterProvider) return false;
      if (filterCap === "sms" && !n.sms_enabled) return false;
      if (filterCap === "voice" && !n.voice_enabled) return false;
      if (search && !n.phone_number?.includes(search) && !n.city?.toLowerCase().includes(search.toLowerCase()) && !n.assigned_to?.includes(search)) return false;
      return true;
    });
  }, [inventory, filterStatus, filterCountry, filterProvider, filterCap, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Summary counts
  const counts = useMemo(() => {
    const c = {};
    STATUSES.forEach(s => c[s] = 0);
    inventory.forEach(n => { if (c[n.status] !== undefined) c[n.status]++; });
    return c;
  }, [inventory]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" /> Number Inventory
          <span className="text-sm text-gray-500 font-normal">({inventory.length.toLocaleString()} total)</span>
        </h2>
        <button onClick={runSync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg text-sm font-bold transition-colors">
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync Providers
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => { setFilterStatus(s === filterStatus ? "all" : s); setPage(0); }}
              className={`rounded-xl border p-3 text-center transition-all ${cfg.color} ${filterStatus === s ? 'ring-2 ring-white/30' : 'opacity-80 hover:opacity-100'}`}>
              <Icon className="w-4 h-4 mx-auto mb-1" />
              <p className="text-lg font-bold">{counts[s]}</p>
              <p className="text-xs capitalize">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Number, city, user..." className="pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 w-52" />
        </div>
        <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setPage(0); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          {countries.map(c => <option key={c} value={c}>{c === "all" ? "All Countries" : c}</option>)}
        </select>
        <select value={filterProvider} onChange={e => { setFilterProvider(e.target.value); setPage(0); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="all">All Providers</option>
          <option value="telnyx">Telnyx</option>
          <option value="didww">DIDWW</option>
        </select>
        <select value={filterCap} onChange={e => { setFilterCap(e.target.value); setPage(0); }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
          <option value="all">All Capabilities</option>
          <option value="sms">SMS Enabled</option>
          <option value="voice">Voice Enabled</option>
        </select>
        <span className="self-center text-sm text-gray-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {["Number", "Country", "City", "Type", "Provider", "SMS", "Voice", "Status", "Owner / Reserved", "Renewal"].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map(num => {
                  const cfg = STATUS_CONFIG[num.status] || STATUS_CONFIG.available;
                  const Icon = cfg.icon;
                  return (
                    <tr key={num.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-white font-semibold whitespace-nowrap">{num.phone_number}</td>
                      <td className="py-3 px-4 text-gray-300">{num.country_code}</td>
                      <td className="py-3 px-4 text-gray-400 max-w-[100px] truncate">{num.city || "—"}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-gray-400 capitalize">{num.number_type || "local"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-purple-400 font-semibold uppercase">{num.provider}</span>
                      </td>
                      <td className="py-3 px-4">
                        {num.sms_enabled
                          ? <MessageSquare className="w-4 h-4 text-emerald-400" />
                          : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        {num.voice_enabled
                          ? <Mic className="w-4 h-4 text-emerald-400" />
                          : <span className="text-gray-700">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {num.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 max-w-[140px] truncate">
                        {num.assigned_to || num.reserved_for || "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {num.renewal_date || "—"}
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-gray-500">No numbers match filters</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 text-sm">← Prev</button>
              <span className="text-sm text-gray-500">Page {page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 text-sm">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}