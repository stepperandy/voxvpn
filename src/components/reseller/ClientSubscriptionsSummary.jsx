import React, { useState, useMemo } from 'react';
import {
  CalendarClock, CheckCircle2, AlertTriangle, XCircle, PauseCircle,
  Clock, RefreshCw, Wifi, Phone, Package, Search
} from 'lucide-react';

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: 'text-green-400',  bg: 'bg-green-500/15',   border: 'border-green-500/30',  icon: CheckCircle2 },
  pending:   { label: 'Pending',    color: 'text-blue-400',   bg: 'bg-blue-500/15',    border: 'border-blue-500/30',   icon: Clock },
  past_due:  { label: 'Past Due',  color: 'text-yellow-400', bg: 'bg-yellow-500/15',  border: 'border-yellow-500/30', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'text-red-400',   bg: 'bg-red-500/15',     border: 'border-red-500/30',    icon: XCircle },
  paused:    { label: 'Paused',    color: 'text-gray-400',   bg: 'bg-gray-500/15',    border: 'border-gray-500/30',   icon: PauseCircle },
};

const SERVICE_ICON = {
  virtual_number: Phone,
  esim: Wifi,
  bundle: Package,
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ClientSubscriptionsSummary({ subscriptions, loading }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = subscriptions || [];
    if (filter !== 'all') {
      result = result.filter(s => s.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.user_email?.toLowerCase().includes(q) ||
        s.plan_name?.toLowerCase().includes(q) ||
        s.phone_number?.toLowerCase().includes(q)
      );
    }
    // Sort by renewal date ascending (soonest first), nulls last
    return [...result].sort((a, b) => {
      const da = a.current_period_end ? new Date(a.current_period_end).getTime() : Infinity;
      const db = b.current_period_end ? new Date(b.current_period_end).getTime() : Infinity;
      return da - db;
    });
  }, [subscriptions, filter, search]);

  // Summary stats
  const stats = useMemo(() => {
    const all = subscriptions || [];
    const active = all.filter(s => s.status === 'active');
    const now = new Date();
    const in7 = active.filter(s => {
      const days = daysUntil(s.current_period_end);
      return days !== null && days >= 0 && days <= 7;
    });
    const in30 = active.filter(s => {
      const days = daysUntil(s.current_period_end);
      return days !== null && days >= 0 && days <= 30;
    });
    const monthlyRevenue = active.reduce((sum, s) => {
      const monthly = s.billing_cycle === 'yearly' ? (s.amount || 0) / 12 : (s.amount || 0);
      return sum + monthly;
    }, 0);
    return {
      total: all.length,
      active: active.length,
      pastDue: all.filter(s => s.status === 'past_due').length,
      renewing7: in7.length,
      renewing30: in30.length,
      monthlyRevenue,
    };
  }, [subscriptions]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading client subscriptions…
        </div>
      </div>
    );
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'past_due', label: 'Past Due' },
    { key: 'paused', label: 'Paused' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 font-medium">Active Subs</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.active}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400 font-medium">Renew ≤ 7 days</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.renewing7}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-400 font-medium">Past Due</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.pastDue}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400 font-medium">Est. Monthly Rev</span>
          </div>
          <p className="text-2xl font-bold text-cyan-400">${stats.monthlyRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-cyan-400" />
            Client Subscriptions
          </h2>

          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search client, plan, number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-40 sm:w-52"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f.key
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Package className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {subscriptions?.length === 0
                ? 'No client subscriptions linked to your agency yet.'
                : 'No subscriptions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Renewal Date</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.paused;
                  const StatusIcon = statusCfg.icon;
                  const ServiceIcon = SERVICE_ICON[sub.service_type] || Package;
                  const days = daysUntil(sub.current_period_end);
                  const renewingSoon = days !== null && days >= 0 && days <= 7 && sub.status === 'active';
                  const overdue = days !== null && days < 0;

                  return (
                    <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-white font-medium text-sm truncate max-w-[180px]">{sub.user_email || '—'}</p>
                        {sub.phone_number && (
                          <p className="text-xs text-slate-500">{sub.phone_number}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-slate-300 capitalize text-xs">
                            {sub.service_type?.replace('_', ' ') || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{sub.plan_name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className={`text-sm ${renewingSoon ? 'text-orange-400 font-medium' : overdue ? 'text-red-400' : 'text-slate-300'}`}>
                            {formatDate(sub.current_period_end)}
                          </span>
                          {days !== null && sub.status === 'active' && (
                            <span className={`text-[10px] ${renewingSoon ? 'text-orange-400' : 'text-slate-500'}`}>
                              {days === 0 ? 'Today' : days < 0 ? `${Math.abs(days)}d overdue` : `in ${days} day${days === 1 ? '' : 's'}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-white font-medium text-sm">${(sub.amount || 0).toFixed(2)}</span>
                        <span className="text-xs text-slate-500">/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}