import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Shield, AlertCircle, XCircle, Loader2, TrendingUp } from 'lucide-react';

export default function SubscriberStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const subs = await base44.entities.VPNSubscription.list('-created_date', 500);
        const active = subs.filter(s => s.status === 'active').length;
        const trial = subs.filter(s => s.status === 'trial').length;
        const expired = subs.filter(s => s.status === 'expired').length;
        const cancelled = subs.filter(s => s.status === 'cancelled').length;

        const planCounts = {};
        subs.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] || 0) + 1; });

        setStats({ total: subs.length, active, trial, expired, cancelled, planCounts });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-cyan-400" /></div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total Active', value: stats.active, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
    { label: 'Free Trials', value: stats.trial, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/20' },
    { label: 'Expired', value: stats.expired, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/20' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-xl border p-4 ${c.bg}`}>
              <Icon size={16} className={`${c.color} mb-2`} />
              <p className="text-2xl font-black text-white">{c.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl border border-white/5 bg-[#0d1120] p-4">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">By Plan</p>
        <div className="space-y-1.5">
          {Object.entries(stats.planCounts).map(([plan, count]) => (
            <div key={plan} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{plan}</span>
              <span className="text-white font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}