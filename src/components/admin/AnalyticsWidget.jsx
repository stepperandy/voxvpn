import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsWidget() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await base44.functions.invoke('getSubscriptionAnalytics', {});
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-slate-500 text-sm">No analytics available</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <p className="text-slate-500 text-xs">MRR</p>
          <p className="text-white font-bold">${analytics.revenue?.mrr}</p>
        </div>
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <p className="text-slate-500 text-xs">Active Subs</p>
          <p className="text-white font-bold">{analytics.metrics?.active_subscriptions}</p>
        </div>
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <p className="text-slate-500 text-xs">Churn Rate (30d)</p>
          <p className="text-white font-bold">{analytics.metrics?.churn_rate_30d}</p>
        </div>
        <div className="p-3 rounded-lg border border-white/10 bg-white/5">
          <p className="text-slate-500 text-xs">LTV</p>
          <p className="text-white font-bold">${analytics.metrics?.lifetime_value}</p>
        </div>
      </div>
    </div>
  );
}