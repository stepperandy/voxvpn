import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaymentMethodModal from '../PaymentMethodModal';
import { useCurrencyDetection } from '@/hooks/useCurrencyDetection';

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

function PlanCard({ plan, isAdmin, onPaymentMethodSelect, currency, convertPrice }) {
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
        <span className="text-3xl font-extrabold text-white">{currency.symbol}{convertPrice(plan.price)}</span>
      </div>
      <p className="text-slate-600 text-xs mb-5">
        {currency.symbol}{convertPrice(plan.pricePerMonth)}/mo
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
  const { currency, countryCode } = useCurrencyDetection();
  const convertPrice = (usdPrice) => (usdPrice * currency.rate).toFixed(currency.rate >= 100 ? 0 : 2);

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

  // Only admin-bypass is handled here — all Stripe/Hubtel/Alipay/WeChat checkout
  // is handled inside PaymentMethodModal, which passes the detected currency,
  // country, live exchange rate, and billing cycle to createStripeCheckout.
  const handlePaymentProceed = async (method) => {
    if (isAdmin && method === 'admin-bypass') {
      try {
        await base44.functions.invoke('grantSubscription', {
          plan: selectedPlan.name,
          target_email: user.email,
        });
        alert(`${selectedPlan.name} plan granted to ${user.email}`);
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        setModalOpen(false);
      }
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
          <p className="text-slate-400 text-sm">Prices shown in <span className="font-semibold text-white">{currency.code}</span> · Detected: <span className="text-cyan-400 font-semibold">{countryCode}</span></p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <PlanCard 
              key={plan.name} 
              plan={plan} 
              isAdmin={isAdmin}
              onPaymentMethodSelect={handlePaymentMethodSelect}
              currency={currency}
              convertPrice={convertPrice}
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
          currency={currency}
          countryCode={countryCode}
          isBilledYearly={selectedPlan?.name === '1 Year' || selectedPlan?.name === '2 Years'}
          isSixMonths={selectedPlan?.name === '6 Months'}
          userEmail={user?.email}
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

        {/* Payment trust section */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-[#0d1120] p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path d="M13.5 6H5.5C4.4 6 3.5 6.9 3.5 8v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h2v2c0 1.1.9 2 2 2s2-.9 2-2v-3c0-.55-.22-1.05-.59-1.41L18.5 10h-3c-1.1 0-2-.9-2-2V6z" fill="#635BFF"/>
            </svg>
            <h3 className="text-white font-bold text-sm">Secure Payment by Stripe</h3>
            <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ background: 'rgba(99,91,255,0.15)', color: '#8b80ff', border: '1px solid rgba(99,91,255,0.3)' }}>
              PCI-DSS Compliant
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'Payment Processor', value: 'Stripe (PCI-DSS Level 1)' },
              { label: 'Accepted Cards', value: 'Visa, Mastercard, Amex, Discover' },
              { label: 'Alternative Methods', value: 'Apple Pay, Google Pay, Hubtel, Alipay' },
              { label: 'Billing Cycle', value: 'One-time per period (1mo–2yr)' },
              { label: 'Auto-Renewal', value: 'Optional — cancel anytime' },
              { label: 'Cancellation Policy', value: 'Cancel anytime, no fees' },
              { label: 'Money-Back Guarantee', value: '30-day full refund' },
              { label: 'Currency', value: `${currency.code} (auto-converted from USD)` },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                <span className="text-slate-500 text-xs">{item.label}</span>
                <span className="text-white font-semibold text-xs text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-[10px] mt-4 leading-relaxed">
            Payments are processed securely by Stripe. VoxVPN never stores your full card details. Subscriptions can be cancelled at any time from your account dashboard. See our <a href="/refund-policy" className="text-cyan-400 hover:underline">Refund Policy</a> for full details. Taxes may apply based on your jurisdiction and are calculated at checkout. Invoices are available for download from your account dashboard after purchase.
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          All prices auto-converted to your local currency ({currency.code}). 30-day money-back guarantee. Secure payment via Stripe · Hubtel · Alipay · WeChat Pay.
        </p>
      </div>
    </section>
  );
}