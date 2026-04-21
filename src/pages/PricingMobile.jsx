import { useState, useEffect, Suspense } from 'react';
import MobileLayout from '@/mobile/MobileLayout';
import PullToRefresh from '@/mobile/PullToRefresh';
import MobileSelectSheet from '@/mobile/MobileSelectSheet';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PaymentMethodModal from '@/components/PaymentMethodModal';

const MONTHLY_PLANS = [
  {
    name: 'Basic',
    price: 3.99,
    billingLabel: 'billed monthly',
    priceId: 'price_basic_monthly',
    features: ['1 Device', '10+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'VoxVPN Protocol'],
  },
  {
    name: 'Standard',
    price: 6.99,
    billingLabel: 'billed monthly',
    priceId: 'price_standard_monthly',
    features: ['3 Devices', '30+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch'],
  },
  {
    name: 'Premium',
    price: 9.99,
    billingLabel: 'billed monthly',
    priceId: 'price_premium_monthly',
    popular: true,
    features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Split Tunneling', 'Priority Support'],
  },
  {
    name: 'Advanced',
    price: 14.99,
    billingLabel: 'billed monthly',
    priceId: 'price_advanced_monthly',
    savings: 'Best Value',
    features: ['10 Devices', '60+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Dedicated IP', '24/7 Support'],
  },
  {
    name: 'Enterprise',
    price: 29.99,
    billingLabel: 'billed monthly',
    priceId: 'price_enterprise_monthly',
    features: ['Unlimited Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Dedicated IP', 'Team Dashboard', 'SLA Guarantee'],
  },
];

const YEARLY_PLANS = [
  { name: 'Basic',      price: 2.49, yearlyTotal: 29.88,  priceId: 'price_basic_yearly',      popular: false, savings: 'Save 38%', features: ['1 Device', '10+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'VoxVPN Protocol'] },
  { name: 'Standard',   price: 4.49, yearlyTotal: 53.88,  priceId: 'price_standard_yearly',   popular: false, savings: 'Save 36%', features: ['3 Devices', '30+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch'] },
  { name: 'Premium',    price: 6.49, yearlyTotal: 77.88,  priceId: 'price_premium_yearly',    popular: true,  savings: 'Save 35%', features: ['5 Devices', '50+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Split Tunneling', 'Priority Support'] },
  { name: 'Advanced',   price: 9.99, yearlyTotal: 119.88, priceId: 'price_advanced_yearly',   popular: false, savings: 'Save 33%', features: ['10 Devices', '60+ Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Dedicated IP', '24/7 Support'] },
  { name: 'Enterprise', price: 19.99,yearlyTotal: 239.88, priceId: 'price_enterprise_yearly', popular: false, savings: 'Save 33%', features: ['Unlimited Devices', 'All Servers', 'Unlimited Bandwidth', 'AES-256 Encryption', 'No-Logs Policy', 'Kill Switch', 'Dedicated IP', 'Team Dashboard', 'SLA Guarantee'] },
];

const HUBTEL_BASE_LINK = 'https://paylink.hubtel.com/voxvpn';

function PlanCard({ plan, onCheckout, isLoading, yearly }) {
  const cedisPrice = (plan.price * 12.5).toFixed(2);
  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        plan.popular
          ? 'border-cyan-500 bg-[#0d1a20] ring-1 ring-cyan-500/20'
          : 'border-white/5 bg-[#0d1120]'
      }`}
    >
      {plan.popular && (
        <div className="mb-2 text-xs font-bold text-cyan-400">⭐ MOST POPULAR</div>
      )}
      {plan.savings && (
        <div className="mb-2 text-xs font-bold text-emerald-400">🏆 {plan.savings}</div>
      )}
      <h3 className="text-white font-bold text-lg">{plan.name}</h3>
      <div className="text-2xl font-black text-white mt-1">
        ${plan.price}<span className="text-xs text-slate-400">/mo</span>
      </div>
      <p className="text-slate-500 text-xs mb-1">{yearly ? `Billed $${plan.yearlyTotal}/year` : plan.billingLabel}</p>

      {/* Stripe button */}
      <button
        onClick={() => onCheckout(plan)}
        disabled={isLoading}
        className="w-full mt-3 py-3 rounded-lg font-bold text-sm transition-all select-none touch-target active:scale-95 disabled:opacity-60"
        style={{
          background: plan.popular ? 'linear-gradient(135deg, #0ea5ff, #4fd1ff)' : 'transparent',
          color: plan.popular ? '#000' : '#fff',
          border: plan.popular ? 'none' : '1px solid #223654',
        }}
      >
        {isLoading ? 'Processing...' : '💳 Pay with Card'}
      </button>

      {/* Hubtel button */}
      <a
        href={HUBTEL_BASE_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full mt-2 py-3 rounded-lg font-bold text-sm text-center transition-all select-none active:scale-95 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
      >
        🛒 Pay with Hubtel — GH₵{cedisPrice}
      </a>

      <ul className="mt-4 space-y-2">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
            <Check size={14} className="text-cyan-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingMobile() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPriceId, setSelectedPriceId] = useState(null);

  useEffect(() => {
    // Capture referral code
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) sessionStorage.setItem('referral_code', ref);

    // Check user auth
    base44.auth.me()
      .then(u => {
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      })
      .catch(() => {});
  }, []);

  const visiblePlans = yearly ? YEARLY_PLANS : MONTHLY_PLANS;

  const handleCheckout = (plan) => {
    const priceId = yearly ? plan.priceId : plan.priceId;
    setSelectedPlan(plan);
    setSelectedPriceId(priceId);
    setLoadingPlan(plan.name);
    setModalOpen(true);
  };

  const handlePaymentProceed = async (method) => {
    try {
      // Register referral if one was captured
      const refCode = sessionStorage.getItem('referral_code');
      if (refCode) {
        try {
          await base44.functions.invoke('referral', { action: 'register_referee', code: refCode });
          sessionStorage.removeItem('referral_code');
        } catch (e) {
          // Non-fatal
        }
      }

      if (isAdmin && method === 'admin-bypass') {
        // Admin bypass
        await base44.functions.invoke('grantSubscription', {
          plan: selectedPlan.name,
          email: user.email,
        });
        alert(`${selectedPlan.name} plan granted to ${user.email}`);
        setModalOpen(false);
        setLoadingPlan(null);
        return;
      }

      // Regular checkout via Stripe
      const res = await base44.functions.invoke('createStripeCheckout', {
        plan: selectedPlan.name,
        isBilledYearly: yearly,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing payment: ' + error.message);
    } finally {
      setModalOpen(false);
      setLoadingPlan(null);
    }
  };

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 800));
  };

  return (
    <MobileLayout headerTitle="Pricing" rootPath="/pricing-mobile">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-24 px-4 pt-6">
          <h1 className="text-white text-2xl font-black mb-1">Choose Your Plan</h1>
          <p className="text-slate-500 text-sm mb-4">All plans include AES-256 encryption & no-log policy</p>

          {/* Toggle */}
          <div className="flex items-center gap-1 bg-[#0d1120] border border-white/10 rounded-full p-1 mb-6 w-fit">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all select-none ${!yearly ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 select-none ${yearly ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
            >
              Yearly
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${yearly ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>-30%</span>
            </button>
          </div>

          <div className="space-y-4">
            {visiblePlans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                onCheckout={handleCheckout}
                isLoading={loadingPlan === plan.name}
                yearly={yearly}
              />
            ))}
          </div>

          {/* Payment Method Modal */}
          <PaymentMethodModal
            isOpen={modalOpen}
            onClose={() => { setModalOpen(false); setLoadingPlan(null); }}
            plan={selectedPlan}
            isAdmin={isAdmin}
            onProceed={handlePaymentProceed}
          />
        </div>
      </PullToRefresh>
    </MobileLayout>
  );
}