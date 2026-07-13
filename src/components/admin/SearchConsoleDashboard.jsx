import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, MousePointerClick, Eye, TrendingUp, Loader2, RefreshCw, AlertCircle, FileText, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

function KpiCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-[#0d1120]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-slate-600 text-[10px] mt-1">{sub}</p>}
    </div>
  );
}

export default function SearchConsoleDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteDropdown, setSiteDropdown] = useState(false);

  const load = useCallback(async (siteUrl) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getSearchConsoleData', siteUrl ? { siteUrl } : {});
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load Search Console data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmtNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
  const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;
  const fmtPos = (n) => n.toFixed(1);

  const chartData = (data?.performance || []).map(r => ({
    date: format(parseISO(r.date), 'MMM d'),
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white">Google Search Console</h2>
          <p className="text-slate-400 text-sm mt-1">Search performance, top queries, and indexing status · Last 28 days</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Site selector */}
          {data?.sites?.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setSiteDropdown(!siteDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 text-sm transition-all"
              >
                <Search size={14} />
                <span className="max-w-[180px] truncate">{data.currentSite}</span>
                <ChevronDown size={14} />
              </button>
              {siteDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-[#0d1120] border border-white/10 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {data.sites.map((s) => (
                    <button
                      key={s.url}
                      onClick={() => { setSiteDropdown(false); load(s.url); }}
                      className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/5 transition-colors ${s.url === data.currentSite ? 'text-cyan-400' : 'text-slate-300'}`}
                    >
                      {s.url}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={() => load(data?.currentSite)} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 text-sm transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" size={28} /></div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 text-sm font-semibold">Connection Error</p>
            <p className="text-slate-500 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      ) : !data || data.sites.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0d1120] border border-white/5 text-center">
          <Search size={32} className="text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No verified sites found in your Google Search Console account.</p>
          <p className="text-slate-600 text-xs mt-1">Add and verify your site at <a href="https://search.google.com/search-console" target="_blank" rel="noopener" className="text-cyan-400 hover:underline">search.google.com/search-console</a></p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={MousePointerClick} label="Total Clicks" value={fmtNum(data.summary.clicks)} color="cyan" />
            <KpiCard icon={Eye} label="Impressions" value={fmtNum(data.summary.impressions)} color="violet" />
            <KpiCard icon={TrendingUp} label="Avg CTR" value={fmtPct(data.summary.ctr)} color="emerald" />
            <KpiCard icon={Search} label="Avg Position" value={fmtPos(data.summary.position)} color="amber" />
          </div>

          {/* Performance chart */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-sm">Search Performance</h3>
                <p className="text-slate-500 text-xs mt-0.5">Clicks and impressions over the last 28 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 7)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Line type="monotone" dataKey="clicks" stroke="#22d3ee" strokeWidth={2} dot={false} name="Clicks" />
                <Line type="monotone" dataKey="impressions" stroke="#a78bfa" strokeWidth={2} dot={false} name="Impressions" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top queries + Top pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Queries */}
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Top Queries</h3>
              {data.topQueries.length === 0 ? (
                <p className="text-slate-600 text-xs py-6 text-center">No query data available</p>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {data.topQueries.map((q, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-slate-600 text-[10px] font-mono w-5">{i + 1}</span>
                        <span className="text-slate-300 text-xs truncate">{q.query}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right flex-shrink-0">
                        <div>
                          <p className="text-white text-xs font-bold">{q.clicks}</p>
                          <p className="text-slate-600 text-[9px]">clicks</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-slate-400 text-xs">{fmtPos(q.position)}</p>
                          <p className="text-slate-600 text-[9px]">pos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Pages */}
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Top Pages</h3>
              {data.topPages.length === 0 ? (
                <p className="text-slate-600 text-xs py-6 text-center">No page data available</p>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {data.topPages.map((p, i) => {
                    const path = p.page.replace(/^https?:\/\/[^/]+/, '') || '/';
                    return (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-slate-600 text-[10px] font-mono w-5">{i + 1}</span>
                          <span className="text-slate-300 text-xs truncate">{path}</span>
                        </div>
                        <div className="flex items-center gap-3 text-right flex-shrink-0">
                          <div>
                            <p className="text-white text-xs font-bold">{p.clicks}</p>
                            <p className="text-slate-600 text-[9px]">clicks</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-slate-400 text-xs">{fmtNum(p.impressions)}</p>
                            <p className="text-slate-600 text-[9px]">impr</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sitemaps & Indexing */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={15} className="text-cyan-400" />
              <h3 className="text-white font-semibold text-sm">Sitemaps & Indexing Status</h3>
            </div>
            {data.sitemaps.length === 0 ? (
              <div className="py-6 text-center">
                <FileText size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-600 text-xs">No sitemaps submitted. Submit your sitemap in Search Console.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.sitemaps.map((s, i) => {
                  const isError = s.errors > 0;
                  const isWarning = s.warnings > 0;
                  const statusColor = isError ? 'text-red-400 bg-red-500/10 border-red-500/20' : isWarning ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  return (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText size={14} className="text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate">{s.path.split('/').pop() || s.path}</p>
                          <p className="text-slate-600 text-[10px]">Last submitted: {s.lastSubmitted ? format(parseISO(s.lastSubmitted), 'MMM d, yyyy') : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {s.indexed > 0 && (
                          <div className="hidden sm:block text-right">
                            <p className="text-white text-xs font-bold">{s.indexed}</p>
                            <p className="text-slate-600 text-[9px]">indexed</p>
                          </div>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                          {isError ? `${s.errors} Errors` : isWarning ? `${s.warnings} Warnings` : 'OK'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}