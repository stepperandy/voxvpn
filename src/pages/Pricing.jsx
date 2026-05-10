import { useState, useEffect } from 'react';
import { Check, Zap, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import PaymentMethodModal from '@/components/PaymentMethodModal';

const PLANS = [
  {
    name: 'Basic',
    monthlyPrice: 3.99,
    yearlyPrice: 2.49,
    yearlyTotal: 29.88,
    devices: 3,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      '1 Device',
      '20 Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
    ],
  },
  {
    name: 'Standard',
    monthlyPrice: 6.99,
    yearlyPrice: 4.49,
    yearlyTotal: 53.88,
    devices: 5,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      '3 Devices',
      '20+ Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
    ],
  },
  {
    name: 'Premium',
    monthlyPrice: 9.99,
    yearlyPrice: 6.49,
    yearlyTotal: 77.88,
    devices: 8,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    color: 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    features: [
      '5 Devices',
      '20+ Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
      'Split Tunneling',
      'DNS Leak Protection',
      'Priority Support',
    ],
  },
  {
    name: 'Advanced',
    monthlyPrice: 14.99,
    yearlyPrice: 9.99,
    yearlyTotal: 119.88,
    devices: 10,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    features: [
      '10 Devices',
      '20 Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
      'Split Tunneling',
      'DNS Leak Protection',
      'Dedicated IP Address',
      '24/7 Priority Support',
      'Double VPN (Multi-hop)',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: 29.99,
    yearlyPrice: 19.99,
    yearlyTotal: 239.88,
    devices: 'Unlimited',
    color: 'border-violet-500/30 bg-[#120d1a] shadow-lg shadow-violet-500/5',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white',
    features: [
      'Unlimited Devices',
      'All 20 Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
      'Split Tunneling',
      'DNS & IPv6 Leak Protection',
      'Static Dedicated IP',
      'Dedicated Account Manager',
      'Double VPN (Multi-hop)',
      'Custom DNS Settings',
      'Team Management Dashboard',
      'SLA Guarantee',
    ],
  },
];

function PlanCard({ plan, yearly, onSelectPlan }) {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className={`relative rounded-xl p-6 flex flex-col ${plan.color}`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-white font-bold text-base mb-0.5">{plan.name}</h3>
        <p className="text-slate-600 text-xs">{plan.devices} {typeof plan.devices === 'number' ? 'device' + (plan.devices > 1 ? 's' : '') : 'devices'}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-white">${price}</span>
        <span className="text-slate-500 text-xs">/mo</span>
      </div>
      <p className="text-slate-600 text-xs mb-5">
        {yearly ? `Billed $${plan.yearlyTotal}/year` : 'Billed monthly'}
        {yearly && <span className="ml-2 text-emerald-400 font-semibold">Save {Math.round((1 - plan.yearlyPrice / plan.monthlyPrice) * 100)}%</span>}
      </p>

      <button
        onClick={() => onSelectPlan(plan, yearly)}
        className={`w-full py-2.5 rounded-lg text-sm font-bold mb-5 transition-all ${plan.btnClass}`}
      >
        `Get ${plan.name}`
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
  const [yearly, setYearly] = useState(false);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedYearly, setSelectedYearly] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => {});
  }, []);

  const handleSelectPlan = (plan, isYearly) => {
    setSelectedPlan(plan);
    setSelectedYearly(isYearly);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h1>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">All plans include AES-256 encryption and a strict no-logs policy. Cancel anytime.</p>
          </motion.div>

          {/* Toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex justify-center mb-10">
            <div className="flex items-center gap-1 bg-[#0d1120] border border-white/10 rounded-full p-1">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!yearly ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${yearly ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                Yearly
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${yearly ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  <Zap size={10} className="inline mr-0.5" />Save up to 33%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                <PlanCard plan={plan} yearly={yearly} onSelectPlan={handleSelectPlan} />
              </motion.div>
            ))}
          </div>

          {/* Payment method modal */}
          <PaymentMethodModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            plan={selectedPlan}
            isBilledYearly={selectedYearly}
            isAdmin={user?.role === 'admin'}
            onProceed={() => setModalOpen(false)}
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