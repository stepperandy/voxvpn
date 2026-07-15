import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, RefreshCw, Users, CheckCircle2, AlertCircle, Clock, Zap, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#34A853', bg: 'rgba(52,168,83,0.1)', border: 'rgba(52,168,83,0.2)', icon: CheckCircle2 },
  trial: { label: 'Trial', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)', icon: Clock },
  pending_payment: { label: 'Pending Payment', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: AlertCircle },
  expired: { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', icon: AlertCircle },
  paused: { label: 'Paused', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', icon: Clock },
};

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function BillingTab({ data }) {
  const { subscriptions, teamMembers, client } = data;

  // Find primary subscription (admin's)
  const primarySub = subscriptions?.find(s => s.user_email === client?.contact_email) || subscriptions?.[0];
  const teamSubs = subscriptions?.filter(s => s.id !== primarySub?.id) || [];

  const statusConfig = primarySub ? STATUS_CONFIG[primarySub.status] || STATUS_CONFIG.pending_payment : null;
  const daysUntilRenewal = primarySub ? getDaysUntil(primarySub.renewal_date) : null;
  const isUrgent = daysUntilRenewal !== null && daysUntilRenewal <= 7 && daysUntilRenewal >= 0;
  const isExpired = daysUntilRenewal !== null && daysUntilRenewal < 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-white font-black text-xl">Billing & Subscriptions</h2>
        <p className="text-slate-500 text-xs mt-1">Monitor subscription status and renewal dates across your team.</p>
      </div>

      {/* Primary subscription card */}
      {primarySub ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6" style={{ borderColor: statusConfig.border, background: statusConfig.bg }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}>
                <statusConfig.icon size={22} style={{ color: statusConfig.color }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{primarySub.plan}</h3>
                <p className="text-slate-500 text-xs">{primarySub.user_email}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ color: statusConfig.color, background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}>
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Billing Cycle</p>
              <p className="text-white text-sm font-semibold capitalize">{primarySub.billing_cycle || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Price</p>
              <p className="text-white text-sm font-semibold">${primarySub.price || 0}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Max Devices</p>
              <p className="text-white text-sm font-semibold">{primarySub.max_devices || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Started</p>
              <p className="text-white text-sm font-semibold">
                {primarySub.start_date ? new Date(primarySub.start_date).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {/* Renewal date with countdown */}
          {primarySub.renewal_date && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: statusConfig.border }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} style={{ color: isExpired ? '#ef4444' : isUrgent ? '#f59e0b' : statusConfig.color }} />
                  <div>
                    <p className="text-slate-400 text-xs">Renewal Date</p>
                    <p className="text-white text-sm font-bold">
                      {new Date(primarySub.renewal_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                {daysUntilRenewal !== null && (
                  <div className="text-right">
                    {isExpired ? (
                      <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                        Expired {Math.abs(daysUntilRenewal)} days ago
                      </span>
                    ) : isUrgent ? (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        Renews in {daysUntilRenewal} days
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold">
                        {daysUntilRenewal} days remaining
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <Link to="/pricing"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all">
              <Zap size={13} /> Upgrade Plan
            </Link>
            {primarySub.stripe_subscription_id && (
              <Link to="/renew"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all">
                <RefreshCw size={13} /> Manage Billing
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <AlertCircle size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-sm mb-1">No Active Subscription</h3>
          <p className="text-slate-400 text-xs mb-4">Choose a plan to activate VPN access for your team.</p>
          <Link to="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold">
            <Zap size={13} /> View Plans
          </Link>
        </div>
      )}

      {/* Team subscriptions */}
      {teamSubs.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Users size={14} className="text-slate-500" /> Team Subscriptions ({teamSubs.length})
          </h3>
          <div className="space-y-2">
            {teamSubs.map((sub, i) => {
              const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_payment;
              const days = getDaysUntil(sub.renewal_date);
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#060910] border border-white/5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <cfg.icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{sub.user_email}</p>
                    <p className="text-slate-500 text-[10px]">{sub.plan} · {sub.billing_cycle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase" style={{ color: cfg.color }}>{cfg.label}</span>
                    {sub.renewal_date && (
                      <p className="text-slate-600 text-[10px] mt-0.5">
                        {days !== null && days < 0 ? `Expired ${Math.abs(days)}d ago` : `Renews ${new Date(sub.renewal_date).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/5 bg-[#0d1420] p-4 text-center">
          <CreditCard size={18} className="text-cyan-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-white">{subscriptions?.length || 0}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Total Subs</p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 text-center">
          <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-emerald-400">
            {subscriptions?.filter(s => s.status === 'active' || s.status === 'trial').length || 0}
          </p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Active</p>
        </div>
        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-center">
          <TrendingUp size={18} className="text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-amber-400">
            {subscriptions?.filter(s => s.status === 'pending_payment' || s.status === 'expired').length || 0}
          </p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">At Risk</p>
        </div>
      </div>
    </div>
  );
}