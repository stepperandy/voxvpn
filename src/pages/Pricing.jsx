import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import PaymentMethodModal from '@/components/PaymentMethodModal';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';

const PLANS = [
  {
    name: '1 Month',
    duration: '30 Days',
    stripePlanName: 'Basic',
    totalPrice: 2.59,
    perMonthPrice: 2.59,
    months: 1,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
    ],
  },
  {
    name: '3 Months',
    duration: '90 Days',
    stripePlanName: 'Standard',
    totalPrice: 6.99,
    perMonthPrice: 2.33,
    months: 3,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
    ],
  },
  {
    name: '6 Months',
    duration: '180 Days',
    stripePlanName: 'Premium',
    totalPrice: 13.99,
    perMonthPrice: 2.33,
    months: 6,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    color: 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS Leak Protection',
      'Priority Support',
    ],
  },
  {
    name: '1 Year',
    duration: '365 Days',
    stripePlanName: 'Advanced',
    totalPrice: 24.99,
    perMonthPrice: 2.08,
    months: 12,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS & IPv6 Leak Protection',
      'Dedicated IP Address',
      '24/7 Priority Support',
    ],
  },
  {
    name: '2 Years',
    duration: '730 Days',
    stripePlanName: 'Enterprise',
    totalPrice: 45.99,
    perMonthPrice: 1.92,
    months: 24,
    color: 'border-violet-500/30 bg-[#120d1a] shadow-lg shadow-violet-500/5',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white',
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
      'DNS & IPv6 Leak Protection',
      'Static Dedicated IP',
      'Double VPN (Multi-hop)',
      'Dedicated Account Manager',
    ],
  },
];

function PlanCard({ plan, onSelectPlan, currency, convertPrice }) {
  const convertedTotal = convertPrice(plan.totalPrice);
  const convertedPerMonth = convertPrice(plan.perMonthPrice);
  const savePct = Math.round((1 - plan.perMonthPrice / PLANS[0].perMonthPrice) * 100);

  return (
    <div className={`relative rounded-xl p-6 flex flex-col ${plan.color}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-white font-bold text-base mb-0.5">{plan.name}</h3>
        <p className="text-slate-500 text-xs">{plan.duration} Unlimited</p>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-white">{currency.symbol}{convertedTotal}</span>
      </div>
      <p className="text-slate-600 text-xs mb-1">
        {currency.symbol}{convertedPerMonth}/mo
      </p>
      {savePct > 0 && (
        <p className="text-emerald-400 text-xs font-semibold mb-4">Save {savePct}% vs monthly</p>
      )}
      {savePct === 0 && <div className="mb-4" />}

      <button
        onClick={() => onSelectPlan(plan)}
        className={`w-full py-2.5 rounded-lg text-sm font-bold mb-5 transition-all ${plan.btnClass}`}
      >
        Get {plan.name}
      </button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f, fi) => (
          <li key={fi} className="flex items-center gap-2">
            <Check size={13} className="text-cyan-400 flex-shrink-0" />
            <span className="text-slate-400 text-xs">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { currency, countryCode, refresh } = useCurrencyDetection();

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => {});
  }, []);

  const handleSelectPlan = (plan) => {
    // Map duration plan to a stripe plan name
    setSelectedPlan({ ...plan, name: plan.stripePlanName });
    setModalOpen(true);
  };

  const convertPrice = (usdPrice) => {
    return (usdPrice * currency.rate).toFixed(currency.rate >= 100 ? 0 : 2);
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {new URLSearchParams(window.location.search).get('new') === '1' && (
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <p className="text-cyan-300 text-sm font-semibold">🎉 Your account is ready! Choose a plan below to activate your VPN access.</p>
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">All plans include AES-256 encryption and a strict no-logs policy. Cancel anytime.</p>
          </motion.div>

          {/* Currency Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 }}
            className="text-center mb-10 flex items-center justify-center gap-2">
            <p className="text-slate-500 text-xs">Prices shown in <span className="text-cyan-400 font-semibold">{currency.code}</span></p>
            <button
              onClick={refresh}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold ml-1"
            >
              (refresh)
            </button>
          </motion.div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                <PlanCard plan={plan} onSelectPlan={handleSelectPlan} currency={currency} convertPrice={convertPrice} />
              </motion.div>
            ))}
          </div>

          {/* Payment method modal */}
          <PaymentMethodModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            plan={selectedPlan}
            isBilledYearly={selectedPlan?.stripePlanName === 'Advanced' || selectedPlan?.stripePlanName === 'Enterprise'}
            isSixMonths={selectedPlan?.stripePlanName === 'Premium'}
            isAdmin={user?.role === 'admin'}
            userEmail={user?.email}
            onProceed={async (method) => {
              if (method === 'admin-bypass') {
                const plan = selectedPlan;
                setModalOpen(false);
                // Find the matching duration plan for months
                const durationPlan = PLANS.find(p => p.stripePlanName === plan.name);
                await base44.functions.invoke('grantSubscription', {
                  target_email: user.email,
                  plan: plan.name,
                  billing_cycle: 'monthly',
                  months: durationPlan?.months || 1,
                });
                alert('Subscription granted successfully!');
              } else {
                setModalOpen(false);
              }
            }}
            currency={currency}
            countryCode={countryCode}
          />

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 text-xs">
            {['30-day money-back guarantee', 'Cancel anytime', 'AES-256 Encryption', 'No-logs policy', 'Secure payment via Stripe'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}