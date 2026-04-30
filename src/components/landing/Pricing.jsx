import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaymentMethodModal from '../PaymentMethodModal';

const PLANS = [
  {
    name: 'Basic',
    monthlyPrice: 3.99,
    yearlyPrice: 2.49,
    yearlyTotal: 29.88,
    devices: 1,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    features: [
      '1 Device',
      '10+ Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
    ],
    priceId: { monthly: 'price_basic_monthly', yearly: 'price_basic_yearly' },
  },
  {
    name: 'Standard',
    monthlyPrice: 6.99,
    yearlyPrice: 4.49,
    yearlyTotal: 53.88,
    devices: 3,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    features: [
      '3 Devices',
      '30+ Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
    ],
    priceId: { monthly: 'price_standard_monthly', yearly: 'price_standard_yearly' },
  },
  {
    name: 'Premium',
    monthlyPrice: 9.99,
    yearlyPrice: 6.49,
    yearlyTotal: 77.88,
    devices: 5,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    color: 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    popular: true,
    features: [
      '5 Devices',
      '50+ Server Locations',
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'VoxVPN Protocol',
      'Kill Switch',
      'Split Tunneling',
      'DNS Leak Protection',
      'Priority Support',
    ],
    priceId: { monthly: 'price_premium_monthly', yearly: 'price_premium_yearly' },
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
    popular: false,
    features: [
      '10 Devices',
      '60+ Server Locations',
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
    priceId: { monthly: 'price_advanced_monthly', yearly: 'price_advanced_yearly' },
  },
  {
    name: 'Enterprise',
    monthlyPrice: 29.99,
    yearlyPrice: 19.99,
    yearlyTotal: 239.88,
    devices: 'Unlimited',
    badge: null,
    color: 'border-violet-500/30 bg-[#120d1a] shadow-lg shadow-violet-500/5',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-white',
    popular: false,
    features: [
      'Unlimited Devices',
      'All 60+ Server Locations',
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
    priceId: { monthly: 'price_enterprise_monthly', yearly: 'price_enterprise_yearly' },
  },
];

function PlanCard({ plan, yearly, isAdmin, onPaymentMethodSelect }) {
  const [loading, setLoading] = useState(false);
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const priceId = yearly ? plan.priceId.yearly : plan.priceId.monthly;

  const handleCheckout = () => {
    onPaymentMethodSelect(plan, priceId, yearly);
  };

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
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-bold mb-5 transition-all disabled:opacity-50 ${plan.btnClass}`}
      >
        {loading ? 'Processing...' : `Get ${plan.name}`}
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [selectedYearly, setSelectedYearly] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      })
      .catch(() => {});
  }, []);

  const handlePaymentMethodSelect = (plan, priceId, isYearly) => {
    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
    setSelectedYearly(isYearly);
    setModalOpen(true);
  };

  const handlePaymentProceed = async (method) => {
    try {
      if (isAdmin && method === 'admin-bypass') {
        await base44.functions.invoke('grantSubscription', {
          plan: selectedPlan.name,
          target_email: user.email,
        });
        alert(`${selectedPlan.name} plan granted to ${user.email}`);
        setModalOpen(false);
        return;
      }

      // Regular Stripe checkout
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: selectedPlan.name,
        isBilledYearly: selectedYearly,
      });
      if (res.data?.url) {
        setModalOpen(false);
        window.location.href = res.data.url;
      } else {
        alert('Failed to create checkout session: ' + (res.data?.error || 'Unknown error'));
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error: ' + error.message);
      setModalOpen(false);
    }
  };

  return (
    <section id="pricing" className="bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm">All plans include AES-256 encryption and a strict no-logs policy. Cancel anytime.</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
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
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <PlanCard 
              key={plan.name} 
              plan={plan} 
              yearly={yearly}
              isAdmin={isAdmin}
              onPaymentMethodSelect={handlePaymentMethodSelect}
            />
          ))}
        </div>

        {/* Payment Method Modal */}
        <PaymentMethodModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={selectedPlan}
          isAdmin={isAdmin}
          isBilledYearly={selectedYearly}
          onProceed={handlePaymentProceed}
        />

        {/* Trust bar */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Live Support */}
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
            <div className="text-3xl flex-shrink-0">💬</div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">Live, 24-hour customer support</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">Real support from real people. We're available through instant live chat and email to help you set up and troubleshoot.</p>
              <a href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold rounded-lg transition-all">
                Contact Support →
              </a>
            </div>
          </div>

          {/* Money-back */}
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/5 bg-[#0d1120]">
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-4 border-cyan-400 flex items-center justify-center">
              <span className="text-cyan-400 font-black text-sm">30</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1">30-day money-back guarantee</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">Our VPN is easy to use. So is our guarantee. If you're not satisfied, just ask Support for a full refund. No hassle, no risk.</p>
              <a href="#pricing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-lg transition-all">
                Get VoxVPN →
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          All prices in USD. 30-day money-back guarantee. Secure payment via Stripe.
        </p>
      </div>
    </section>
  );
}