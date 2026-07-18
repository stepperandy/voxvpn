import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, RefreshCw, CalendarClock, Wifi, Phone, Package,
} from 'lucide-react';

const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b'];

function monthlyEquivalent(sub) {
  const amt = sub.amount || 0;
  return sub.billing_cycle === 'yearly' ? amt / 12 : amt;
}

export default function RevenueTrendsSummary({ subscriptions, loading }) {
  const stats = useMemo(() => {
    const all = subscriptions || [];
    const active = all.filter(s => s.status === 'active');

    const totalMRR = active.reduce((sum, s) => sum + monthlyEquivalent(s), 0);
    const totalARR = totalMRR * 12;

    // Revenue by service type
    const byService = { virtual_number: 0, esim: 0, bundle: 0 };
    for (const s of active) {
      const key = s.service_type || 'bundle';
      byService[key] = (byService[key] || 0) + monthlyEquivalent(s);
    }
    const pieData = [
      { name: 'Virtual Numbers', value: +byService.virtual_number.toFixed(2) },
      { name: 'eSIM', value: +byService.esim.toFixed(2) },
      { name: 'Bundles', value: +byService.bundle.toFixed(2) },
    ].filter(d => d.value > 0);

    // Renewals by month (next 6 months)
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: 0,
        revenue: 0,
      });
    }

    for (const s of active) {
      if (!s.current_period_end) continue;
      const endDate = new Date(s.current_period_end);
      const key = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
      const monthEntry = months.find(m => m.key === key);
      if (monthEntry) {
        monthEntry.count += 1;
        monthEntry.revenue += monthlyEquivalent(s);
      }
    }

    // Renewals by status
    const statusBreakdown = {
      active: all.filter(s => s.status === 'active').length,
      past_due: all.filter(s => s.status === 'past_due').length,
      cancelled: all.filter(s => s.status === 'cancelled').length,
      paused: all.filter(s => s.status === 'paused').length,
    };

    return { totalMRR, totalARR, pieData, months, statusBreakdown, activeCount: active.length };
  }, [subscriptions]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading revenue trends…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 font-medium">Monthly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">${stats.totalMRR.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-400 font-medium">Annual Run-Rate</span>
          </div>
          <p className="text-2xl font-bold text-cyan-400">${stats.totalARR.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400 font-medium">Renewals (30d)</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.months[0]?.count || 0}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 font-medium">Active Subs</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeCount}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Renewal trend bar chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Upcoming Renewals by Month</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.months} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" name="Renewals" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by service type pie */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-bold text-white">Revenue by Service Type</h3>
          </div>
          {stats.pieData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-slate-500">No active revenue yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => `$${v.toFixed(2)}`}
                />
                <Legend
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-400">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Renewal revenue projection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Projected Renewal Revenue</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.months} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(v) => `$${v.toFixed(2)}`}
            />
            <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}