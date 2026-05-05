import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Zap, TrendingUp, Wifi } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await base44.functions.invoke('getAdminStats', {});
      setStats(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/3">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  const metrics = [
    { label: 'Total Users', value: stats?.overview?.total_users || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Active Subs', value: stats?.overview?.active_subscriptions || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Connections', value: stats?.overview?.total_connections || 0, icon: Wifi, color: 'text-cyan-400' },
    { label: 'Revenue', value: `$${stats?.overview?.monthly_revenue || '0'}`, icon: Zap, color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <Icon size={18} className={m.color} />
            </div>
            <p className="text-white font-bold text-lg">{m.value}</p>
            <p className="text-slate-500 text-xs">{m.label}</p>
          </div>
        );
      })}
    </div>
  );
}