import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  Shield, Download, RefreshCw, Loader2, AlertCircle, CheckCircle2,
  CreditCard, HeadphonesIcon, Clock, XCircle, Calendar, LogOut, User
} from 'lucide-react';

const INSTALLER_URL = 'https://github.com/stepperandy/VoxVPN-Setup-1.5/releases/download/v1.5/VoxVPN-Setup-v1.5.exe';

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
  trial:     { label: 'Trial',     color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/30',       dot: 'bg-cyan-400' },
  expired:   { label: 'Expired',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30',       dot: 'bg-rose-400' },
  cancelled: { label: 'Cancelled', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',     dot: 'bg-slate-500' },
  paused:    { label: 'Paused',    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     dot: 'bg-amber-400' },
};

function canDownload(sub) {
  return sub && ['active', 'trial'].includes(sub.status);
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.expired;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' || status === 'trial' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { base44.auth.redirectToLogin('/dashboard'); return; }
        setUser(me);

        if (me.role === 'admin') {
          setSubscription({ plan: 'Admin', status: 'active', renewal_date: null });
          setLoading(false);
          return;
        }

        const subs = await base44.entities.VPNSubscription.filter({ user_email: me.email });
        const best = subs?.find(s => s.status === 'active')
          || subs?.find(s => s.status === 'trial')
          || subs?.[0]
          || null;
        setSubscription(best);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', {});
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        // No Stripe customer found — redirect to pricing/renew page
        window.location.href = '/pricing';
      }
    } catch (err) {
      // Fallback: redirect to pricing page
      window.location.href = '/pricing';
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="animate-spin mx-auto" style={{ color: '#00d4ff' }} />
          <p className="text-slate-400 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const downloadUrl = subscription?.download_link || INSTALLER_URL;
  const hasAccess = canDownload(subscription);
  const renewalDate = subscription?.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-black text-white">My Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Welcome back, <span className="text-white font-medium">{user?.full_name || user?.email}</span></p>
            </div>
            <button onClick={() => base44.auth.logout('/')}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </motion.div>

        {/* Subscription card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/8 bg-[#0d1420] p-6 mb-5"
          style={{ borderColor: hasAccess ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)', boxShadow: hasAccess ? '0 0 30px rgba(0,212,255,0.05)' : 'none' }}>

          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Subscription</p>
              <h2 className="text-2xl font-black text-white">{subscription?.plan || 'No Plan'}</h2>
            </div>
            <StatusBadge status={subscription?.status || 'expired'} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl bg-[#0a1020] border border-white/5 p-3">
              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Plan</p>
              <p className="text-white font-bold text-sm">{subscription?.plan || '—'}</p>
            </div>
            <div className="rounded-xl bg-[#0a1020] border border-white/5 p-3">
              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">
                {subscription?.status === 'expired' || subscription?.status === 'cancelled' ? 'Expired' : 'Renews'}
              </p>
              <p className="text-white font-bold text-sm">{renewalDate || '—'}</p>
            </div>
            <div className="rounded-xl bg-[#0a1020] border border-white/5 p-3">
              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1">Billing</p>
              <p className="text-white font-bold text-sm capitalize">{subscription?.billing_cycle || '—'}</p>
            </div>
          </div>

          {/* Expiry warning */}
          {subscription?.renewal_date && hasAccess && (() => {
            const daysLeft = Math.ceil((new Date(subscription.renewal_date) - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7 && daysLeft > 0) {
              return (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
                  <Clock size={12} /> Your subscription expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Renew now to avoid interruption.
                </div>
              );
            }
            return null;
          })()}

          {/* Expired notice */}
          {!hasAccess && subscription && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
              <XCircle size={12} /> Download access is disabled until you renew your subscription.
            </div>
          )}

          {/* No subscription */}
          {!subscription && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
              <AlertCircle size={12} /> You don't have an active subscription. Choose a plan to get started.
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

          {/* Download button */}
          {hasAccess ? (
            <a href={downloadUrl} download="VoxVPN-Setup-v1.5.exe"
              className="flex items-center justify-center gap-3 py-4 rounded-xl font-black text-black text-base transition-all"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)', boxShadow: '0 6px 24px rgba(0,212,255,0.25)' }}>
              <Download size={20} />
              Download VoxVPN
            </a>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 rounded-xl font-black text-slate-600 text-base border border-white/5 bg-white/2 cursor-not-allowed select-none">
              <Download size={20} />
              Download VoxVPN
            </div>
          )}

          {/* Billing / Renew */}
          {subscription ? (
            <button onClick={openBillingPortal} disabled={portalLoading}
              className="flex items-center justify-center gap-2 py-4 rounded-xl border font-bold text-sm transition-all disabled:opacity-50"
              style={{ borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.05)' }}>
              {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {hasAccess ? 'Manage Billing' : 'Renew Subscription'}
            </button>
          ) : (
            <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
              className="flex items-center justify-center gap-2 py-4 rounded-xl border font-bold text-sm transition-all"
              style={{ borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.05)' }}>
              <RefreshCw size={16} /> Choose a Plan
            </a>
          )}
        </motion.div>

        {/* Secondary actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <Link to="/contact"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0d1420] hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon size={18} className="text-violet-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Support</p>
              <p className="text-slate-500 text-xs">Get help from our team</p>
            </div>
          </Link>

          <Link to="/account-settings"
            className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0d1420] hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Account Settings</p>
              <p className="text-slate-500 text-xs">Profile &amp; security</p>
            </div>
          </Link>
        </motion.div>

        {/* If not active — plan upsell */}
        {!hasAccess && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#00d4ff]/20 p-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,80,160,0.05))' }}>
            <Shield size={32} className="mx-auto mb-3" style={{ color: '#00d4ff' }} />
            <h3 className="text-white font-black text-lg mb-1">Get Protected Today</h3>
            <p className="text-slate-400 text-sm mb-4">Choose a plan and get instant access to VoxVPN for Windows, Android, iOS & macOS.</p>
            <Link to="/pricing"
              className="inline-block px-8 py-3 rounded-xl font-bold text-black text-sm transition-all"
              style={{ background: '#00d4ff' }}>
              View Plans →
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}