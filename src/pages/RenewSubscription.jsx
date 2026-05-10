import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
  RefreshCw, Shield, Check, Loader2, CreditCard, Zap, AlertCircle, CheckCircle2
} from 'lucide-react';

const PLANS = [
  {
    name: 'Free Trial',
    priceLabel: 'Free',
    period: '7 days',
    features: ['Windows installer access', '7-day trial', 'Limited bandwidth', '3 server locations'],
    badge: null,
    btnClass: 'border border-slate-600 hover:border-cyan-500 text-white',
    cardClass: 'border-white/5 bg-[#0d1420]',
    isFree: true,
  },
  {
    name: 'Pro Monthly',
    priceLabel: '$9.99',
    period: '/month',
    features: ['Windows installer download', 'All 20+ server locations', 'Unlimited bandwidth', 'Kill Switch & DNS protection', 'Up to 5 devices', 'Priority support'],
    badge: null,
    btnClass: 'border border-slate-600 hover:border-cyan-500 text-white',
    cardClass: 'border-white/5 bg-[#0d1420]',
    stripePlan: 'Premium',
    yearly: false,
  },
  {
    name: 'Pro Annual',
    priceLabel: '$6.49',
    period: '/month',
    subLabel: 'Billed $77.88/year',
    features: ['Everything in Pro Monthly', 'Save 35% vs monthly', 'Windows installer download', 'All 20+ server locations', 'Unlimited bandwidth', 'Priority support'],
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    btnClass: 'bg-[#00d4ff] hover:bg-[#00c4ee] text-black',
    cardClass: 'border-2 border-[#00d4ff]/40 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    popular: true,
    stripePlan: 'Premium',
    yearly: true,
  },
  {
    name: 'Business',
    priceLabel: 'Custom',
    period: 'contact us',
    features: ['Team & multi-user access', 'Centralized billing', 'Dedicated IP options', 'SLA guarantee', 'Dedicated account manager', 'Custom onboarding'],
    badge: null,
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white',
    cardClass: 'border-violet-500/30 bg-[#120d1a]',
    isBusiness: true,
  },
];

export default function RenewSubscription() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) { base44.auth.redirectToLogin('/renew'); return; }
        setUser(me);
        const subs = await base44.entities.VPNSubscription.filter({ user_email: me.email });
        const current = subs?.find(s => s.status === 'active') || subs?.[0] || null;
        setSubscription(current);
      } catch {}
      finally { setLoading(false); }
    };
    init();
  }, []);

  const handleCheckout = async (plan) => {
    if (plan.isBusiness) {
      window.location.href = '/contact';
      return;
    }
    if (plan.isFree) {
      alert('Free trial is available during signup. Contact support if you need a trial extension.');
      return;
    }
    setCheckoutLoading(plan.name);
    try {
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: plan.stripePlan,
        isBilledYearly: !!plan.yearly,
      });
      if (res.data?.url) window.location.href = res.data.url;
      else alert('Error: ' + (res.data?.error || 'Unknown error'));
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: '#00d4ff' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          {subscription?.status === 'expired' || subscription?.status === 'cancelled' ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/5 text-rose-400 text-xs font-semibold mb-4">
                <AlertCircle size={12} /> Subscription {subscription.status}
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Renew Your Subscription</h1>
              <p className="text-slate-400">Reactivate your plan to regain access to the VoxVPN Windows installer.</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-[#00d4ff] text-xs font-semibold mb-4">
                <Zap size={12} /> Choose Your Plan
              </div>
              <h1 className="text-4xl font-black text-white mb-2">Get VoxVPN Protection</h1>
              <p className="text-slate-400">Choose a plan and get instant access to the Windows installer.</p>
            </>
          )}
        </motion.div>

        {/* Current sub notice */}
        {subscription?.status === 'active' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 mb-8">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-bold text-sm">You already have an active {subscription.plan} subscription.</p>
              <p className="text-emerald-300/60 text-xs">You can switch plans below or manage your billing from the dashboard.</p>
            </div>
            <Link to="/dashboard" className="ml-auto flex-shrink-0 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition-all">
              Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${plan.cardClass}`}>

              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 text-xs font-black rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-white font-black text-base mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{plan.priceLabel}</span>
                  <span className="text-slate-500 text-xs">{plan.period}</span>
                </div>
                {plan.subLabel && <p className="text-slate-500 text-xs mt-0.5">{plan.subLabel}</p>}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check size={11} className="text-[#00d4ff] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={checkoutLoading === plan.name}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all disabled:opacity-50 ${plan.btnClass}`}>
                {checkoutLoading === plan.name ? (
                  <Loader2 size={14} className="animate-spin mx-auto" />
                ) : plan.isBusiness ? 'Contact Sales' : plan.isFree ? 'Start Free Trial' : `Get ${plan.name}`}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trust */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 text-xs">
          {['30-day money-back guarantee', 'Cancel anytime', 'AES-256 Encryption', 'No-logs policy', 'Secure payment via Stripe'].map(t => (
            <span key={t} className="flex items-center gap-1.5"><Shield size={10} className="text-[#00d4ff]" /> {t}</span>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}