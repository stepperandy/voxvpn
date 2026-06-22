import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaymentMethodModal from '../PaymentMethodModal';

const PLANS = [
  {
    name: '1 Month',
    period: '1 Month',
    days: '30 Days Unlimited',
    price: 2.59,
    pricePerMonth: 2.59,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 0,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
    ],
    priceId: 'price_1month',
  },
  {
    name: '3 Months',
    period: '3 Months',
    days: '90 Days Unlimited',
    price: 6.99,
    pricePerMonth: 2.33,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 10,
    features: [
      'Unlimited Bandwidth',
      'AES-256 Encryption',
      'No-Logs Policy',
      'All Server Locations',
      'Kill Switch',
      'Split Tunneling',
    ],
    priceId: 'price_3months',
  },
  {
    name: '6 Months',
    period: '6 Months',
    days: '180 Days Unlimited',
    price: 13.99,
    pricePerMonth: 2.33,
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    color: 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10',
    btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    popular: true,
    savingsPercent: 10,
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
    priceId: 'price_6months',
  },
  {
    name: '1 Year',
    period: '1 Year',
    days: '365 Days Unlimited',
    price: 24.99,
    pricePerMonth: 2.08,
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 20,
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
    priceId: 'price_1year',
  },
  {
    name: '2 Years',
    period: '2 Years',
    days: '730 Days Unlimited',
    price: 45.99,
    pricePerMonth: 1.92,
    badge: null,
    color: 'border-white/5 bg-[#0d1120]',
    btnClass: 'border border-slate-700 hover:border-cyan-500 text-white hover:text-cyan-400',
    popular: false,
    savingsPercent: 26,
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
    priceId: 'price_2years',
  },
];

function PlanCard({ plan, isAdmin, onPaymentMethodSelect }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    onPaymentMethodSelect(plan, plan.priceId, false);
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
        <p className="text-slate-600 text-xs">{plan.days}</p>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-white">${plan.price}</span>
      </div>
      <p className="text-slate-600 text-xs mb-5">
        ${plan.pricePerMonth}/mo
        {plan.savingsPercent > 0 && <span className="ml-2 text-cyan-400 font-semibold">Save {plan.savingsPercent}% vs monthly</span>}
      </p>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-bold mb-5 transition-all disabled:opacity-50 ${plan.btnClass}`}
      >
        {loading ? 'Processing...' : `Get ${plan.period}`}
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      })
      .catch(() => {});
  }, []);

  const handlePaymentMethodSelect = (plan, priceId) => {
    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
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
        price: selectedPlan.price,
        period: selectedPlan.period,
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
    <section id="pricing" className="relative bg-[#080c18] py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background world map image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/2f2ad398a_image.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          opacity: 0.18,
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm">All plans include AES-256 encryption and a strict no-logs policy. Cancel anytime.</p>
        </div>

        {/* Pricing info */}
        <div className="text-center mb-10">
          <p className="text-slate-400 text-sm">Prices shown in <span className="font-semibold text-white">USD</span> <a href="#" className="text-cyan-400 hover:underline">(refresh)</a></p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <PlanCard 
              key={plan.name} 
              plan={plan} 
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
          onProceed={handlePaymentProceed}
          currency={{ code: 'USD' }}
          countryCode="US"
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
          All prices in USD. 30-day money-back guarantee. Secure payment via Stripe · Hubtel · Alipay · WeChat Pay.
        </p>
      </div>
    </section>
  );
}