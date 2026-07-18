import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Search, RefreshCw, ExternalLink, MousePointerClick, Eye,
  TrendingUp, FileText, AlertTriangle, CheckCircle2, Link2
} from 'lucide-react';

export default function SearchConsoleDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getSearchConsoleData', {});
      setData(res.data);
    } catch (err) {
      setError('Not connected to Google Search Console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading Search Console data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-white text-sm font-medium">Google Search Console not connected</p>
            <p className="text-slate-500 text-xs mt-0.5">{error}. Contact your workspace admin to authorize the integration.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.totals) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-white text-sm font-medium">No Search Console data available</p>
            <p className="text-slate-500 text-xs mt-0.5">{data?.message || 'Verify your site property in Google Search Console.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { totals, topQueries, topPages, sitemaps, daily } = data;
  const maxClicks = Math.max(...(daily || []).map(d => d.clicks), 1);

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MousePointerClick className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-medium">Clicks (28d)</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 font-medium">Impressions</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.impressions.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 font-medium">Avg CTR</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.ctr}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400 font-medium">Avg Position</span>
          </div>
          <p className="text-2xl font-bold text-white">{totals.position}</p>
        </div>
      </div>

      {/* Clicks Sparkline */}
      {daily && daily.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Daily Clicks (Last 28 Days)</h3>
          <div className="flex items-end gap-1 h-24">
            {daily.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500/40 hover:bg-cyan-500/60 rounded-t transition-colors"
                style={{ height: `${(d.clicks / maxClicks) * 100}%`, minHeight: '2px' }}
                title={`${d.date}: ${d.clicks} clicks`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Two column: Queries + Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Top Search Queries
            </h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {topQueries.slice(0, 8).map((q, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-600 font-mono w-5">{i + 1}</span>
                  <span className="text-sm text-white truncate">{q.query}</span>
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <span className="text-slate-400">{q.impressions} imp</span>
                  <span className="text-cyan-400 font-medium">{q.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Top Pages
            </h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {topPages.slice(0, 8).map((p, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-600 font-mono w-5">{i + 1}</span>
                  <span className="text-sm text-white truncate max-w-[200px]">
                    {p.page.replace(/^https?:\/\/[^/]+/, '')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs flex-shrink-0">
                  <span className="text-slate-400">{p.position.toFixed(1)} pos</span>
                  <span className="text-cyan-400 font-medium">{p.clicks} clicks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sitemap Status / Indexing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            Sitemap & Indexing Status
          </h3>
          <a
            href={`https://search.google.com/search-console`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
          >
            Open GSC <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {sitemaps && sitemaps.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {sitemaps.map((s, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {s.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm text-white truncate">{s.path.replace(/^https?:\/\/[^/]+/, '')}</p>
                    <p className="text-xs text-slate-500">
                      {s.submitted_count} submitted · {s.indexed} indexed
                      {s.errors > 0 && ` · ${s.errors} errors`}
                      {s.warnings > 0 && ` · ${s.warnings} warnings`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  s.status === 'ok' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {s.status === 'ok' ? 'Healthy' : 'Needs Attention'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <AlertTriangle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No sitemaps submitted to Google Search Console.</p>
          </div>
        )}
      </div>
    </div>
  );
}