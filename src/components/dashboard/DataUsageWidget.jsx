import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wifi, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function DataUsageWidget() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['airaloUsage'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAiraloUsage', {});
      return response.data;
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    staleTime: 10000, // Cache for 10 seconds
  });

  const usage = data?.usage || {};
  const esim = data?.esim || {};
  const percentageUsed = usage.percentage_used || 0;

  // Color coding based on usage
  const getStatusColor = () => {
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusText = () => {
    if (percentageUsed >= 90) return 'Critical';
    if (percentageUsed >= 70) return 'High';
    return 'Normal';
  };

  if (error && error.response?.status === 404) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="font-semibold text-white">No Active eSIM</h3>
            <p className="text-sm text-slate-400">Purchase an eSIM to monitor data usage</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/10 bg-[linear-gradient(135deg,rgba(11,28,58,0.8),rgba(3,21,47,0.95))] p-6 shadow-lg shadow-cyan-950/20">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-500/10 p-2.5">
            <Wifi className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Data Usage</h3>
            <p className="text-xs text-slate-400">{esim.product_name || 'eSIM Plan'}</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-white/15 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : 'Refresh'}
        </button>
      </div>

      {isLoading && !data ? (
        <div className="space-y-3">
          <div className="h-2 rounded-full bg-white/10"></div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Loading...</span>
            <span>--</span>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">
                {usage.used_gb?.toFixed(2) || '0'}GB / {usage.total_gb || '0'}GB
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                percentageUsed >= 90 ? 'bg-red-500/20 text-red-300' :
                percentageUsed >= 70 ? 'bg-amber-500/20 text-amber-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {getStatusText()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getStatusColor()}`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Usage Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400 mb-1">Used</p>
              <p className="text-lg font-semibold text-white">
                {usage.used_gb?.toFixed(2) || '0'}GB
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400 mb-1">Remaining</p>
              <p className="text-lg font-semibold text-cyan-300">
                {usage.remaining_gb?.toFixed(2) || '0'}GB
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-xs text-slate-400 mb-1">Usage</p>
              <p className="text-lg font-semibold text-white">
                {percentageUsed}%
              </p>
            </div>
          </div>

          {/* Valid Until */}
          {esim.valid_until && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-xs text-slate-400">Valid Until</p>
              <p className="text-sm font-medium text-white">
                {new Date(esim.valid_until).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Auto-refresh toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/10 cursor-pointer"
            />
            <label htmlFor="autoRefresh" className="text-xs text-slate-400 cursor-pointer">
              Auto-refresh every 30 seconds
            </label>
          </div>
        </>
      )}

      {error && data && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Using cached data • Latest: {usage.used_gb?.toFixed(2) || '0'}GB used
        </div>
      )}
    </div>
  );
}