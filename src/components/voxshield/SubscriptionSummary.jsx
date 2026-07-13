import { Calendar, CreditCard, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  active: { icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/20', label: 'Active' },
  trial: { icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', label: 'Trial' },
  pending_payment: { icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'Pending Payment' },
  expired: { icon: XCircle, color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Expired' },
  cancelled: { icon: XCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', label: 'Cancelled' },
  paused: { icon: Clock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Paused' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SubscriptionSummary({ subscriptions, clients }) {
  // Link subscriptions to client accounts via the notes field (clientId stored in notes)
  const clientNameFor = (sub) => {
    if (!sub.notes) return null;
    const client = clients.find((c) => sub.notes.includes(c.id));
    return client?.name || null;
  };

  // Subscriptions with upcoming renewals (next 30 days), sorted by soonest
  const upcoming = subscriptions
    .filter((s) => {
      const days = daysUntil(s.renewal_date);
      return days !== null && days >= 0 && days <= 30 && (s.status === 'active' || s.status === 'trial');
    })
    .sort((a, b) => new Date(a.renewal_date) - new Date(b.renewal_date));

  // Status breakdown counts
  const statusCounts = {};
  subscriptions.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const total = subscriptions.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Status breakdown */}
      <div className="rounded-2xl bg-[#0d1120] border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Subscription Statuses</h3>
        </div>
        {total === 0 ? (
          <p className="text-slate-600 text-xs py-6 text-center">No subscriptions found</p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(statusCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
                const Icon = cfg.icon;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cfg.color}`}>
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-xs font-medium">{cfg.label}</span>
                        <span className="text-white text-xs font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'currentColor', opacity: 0.5, color: cfg.color.split(' ')[0].replace('text-', '') === 'green' ? '#22c55e' : cfg.color.split(' ')[0].replace('text-', '') === 'amber' ? '#f59e0b' : cfg.color.split(' ')[0].replace('text-', '') === 'red' ? '#ef4444' : cfg.color.split(' ')[0].replace('text-', '') === 'orange' ? '#f97316' : cfg.color.split(' ')[0].replace('text-', '') === 'blue' ? '#3b82f6' : '#64748b' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Upcoming renewals */}
      <div className="lg:col-span-2 rounded-2xl bg-[#0d1120] border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-cyan-400" />
            <h3 className="text-white font-bold text-sm">Upcoming Renewals</h3>
            <span className="text-slate-600 text-xs">· Next 30 days</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={24} className="text-slate-700 mx-auto mb-2" />
            <p className="text-slate-600 text-xs">No renewals in the next 30 days</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {upcoming.map((sub) => {
              const days = daysUntil(sub.renewal_date);
              const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_payment;
              const Icon = cfg.icon;
              const clientName = clientNameFor(sub);
              const isUrgent = days <= 3;
              return (
                <div key={sub.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${cfg.color}`}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{sub.user_email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-[10px]">{sub.plan}</span>
                      {clientName && (
                        <>
                          <span className="text-slate-700 text-[10px]">·</span>
                          <span className="text-slate-500 text-[10px]">{clientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-bold ${isUrgent ? 'text-red-400' : 'text-slate-300'}`}>{formatDate(sub.renewal_date)}</p>
                    <p className={`text-[10px] ${isUrgent ? 'text-red-400/70' : 'text-slate-600'}`}>
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full subscriptions table */}
      <div className="lg:col-span-3 rounded-2xl bg-[#0d1120] border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-cyan-400" />
            <h3 className="text-white font-bold text-sm">All Client Subscriptions</h3>
          </div>
          <span className="text-slate-600 text-xs">{subscriptions.length} total</span>
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-slate-600 text-xs py-6 text-center">No subscriptions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-white/5">
                  <th className="text-left font-medium py-2 px-2">Client</th>
                  <th className="text-left font-medium py-2 px-2">Email</th>
                  <th className="text-left font-medium py-2 px-2">Plan</th>
                  <th className="text-left font-medium py-2 px-2">Status</th>
                  <th className="text-right font-medium py-2 px-2">Renewal Date</th>
                  <th className="text-right font-medium py-2 px-2">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {[...subscriptions]
                  .sort((a, b) => {
                    if (!a.renewal_date) return 1;
                    if (!b.renewal_date) return -1;
                    return new Date(a.renewal_date) - new Date(b.renewal_date);
                  })
                  .map((sub) => {
                    const days = daysUntil(sub.renewal_date);
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_payment;
                    const Icon = cfg.icon;
                    const clientName = clientNameFor(sub);
                    const isUrgent = days !== null && days >= 0 && days <= 7;
                    const isUpcoming = days !== null && days >= 0 && days <= 30;
                    const rowBg = isUrgent ? 'bg-red-500/5' : isUpcoming ? 'bg-amber-500/5' : '';
                    return (
                      <tr key={sub.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${rowBg}`}>
                        <td className="py-2.5 px-2">
                          <span className="text-white font-medium">{clientName || '—'}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="text-slate-400">{sub.user_email || '—'}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="text-slate-300">{sub.plan}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                            <Icon size={9} /> {cfg.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span className={isUrgent ? 'text-red-400 font-bold' : isUpcoming ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                            {formatDate(sub.renewal_date)}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {days === null ? (
                            <span className="text-slate-600">—</span>
                          ) : days < 0 ? (
                            <span className="text-slate-600 text-[10px]">expired</span>
                          ) : (
                            <span className={`font-bold ${isUrgent ? 'text-red-400' : isUpcoming ? 'text-amber-400' : 'text-slate-400'}`}>
                              {days === 0 ? 'Today' : `${days}d`}
                            </span>
                          )}
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