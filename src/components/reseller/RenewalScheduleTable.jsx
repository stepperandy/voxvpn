import React, { useMemo } from 'react';
import { CalendarClock, AlertCircle, RefreshCw } from 'lucide-react';

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

const URGENCY_LEVELS = {
  critical: { label: '≤ 3 days',  bg: 'bg-red-500/10',    border: 'border-red-500/40',    text: 'text-red-400',    dot: 'bg-red-500' },
  urgent:   { label: '≤ 7 days',  bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-500' },
  soon:     { label: '≤ 14 days', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  upcoming: { label: '≤ 30 days', bg: 'bg-blue-500/10',  border: 'border-blue-500/40',  text: 'text-blue-400',   dot: 'bg-blue-500' },
};

function getUrgency(days) {
  if (days === null) return null;
  if (days < 0) return 'critical';
  if (days <= 3) return 'critical';
  if (days <= 7) return 'urgent';
  if (days <= 14) return 'soon';
  if (days <= 30) return 'upcoming';
  return null;
}

export default function RenewalScheduleTable({ subscriptions, loading }) {
  const upcomingRenewals = useMemo(() => {
    const active = (subscriptions || []).filter(s => s.status === 'active');
    return active
      .map(s => ({ ...s, _days: daysUntil(s.current_period_end) }))
      .filter(s => s._days !== null && s._days >= 0 && s._days <= 30)
      .sort((a, b) => a._days - b._days);
  }, [subscriptions]);

  const counts = useMemo(() => {
    return {
      critical: upcomingRenewals.filter(s => getUrgency(s._days) === 'critical').length,
      urgent: upcomingRenewals.filter(s => getUrgency(s._days) === 'urgent').length,
      soon: upcomingRenewals.filter(s => getUrgency(s._days) === 'soon').length,
      upcoming: upcomingRenewals.filter(s => getUrgency(s._days) === 'upcoming').length,
    };
  }, [upcomingRenewals]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading renewal schedule…
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-cyan-400" />
          Upcoming Renewal Schedule
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(URGENCY_LEVELS).map(([key, cfg]) => (
            <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className={`text-xs font-medium ${cfg.text}`}>{counts[key]}</span>
              <span className="text-xs text-slate-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {upcomingRenewals.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <CalendarClock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No renewals in the next 30 days.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Client</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Service</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Renewal Date</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Urgency</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {upcomingRenewals.map((sub) => {
                const urgency = getUrgency(sub._days);
                const cfg = URGENCY_LEVELS[urgency] || URGENCY_LEVELS.upcoming;
                return (
                  <tr key={sub.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${cfg.bg}`}>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium text-sm truncate max-w-[180px]">{sub.user_email || '—'}</p>
                      {sub.phone_number && <p className="text-xs text-slate-500">{sub.phone_number}</p>}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs capitalize">{sub.service_type?.replace('_', ' ') || '—'}</td>
                    <td className="py-3 px-4 text-slate-300 text-xs">{sub.plan_name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${cfg.text}`}>{formatDate(sub.current_period_end)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {sub._days === 0 ? 'Today' : `${sub._days} day${sub._days === 1 ? '' : 's'}`}
                      </span>
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
  );
}