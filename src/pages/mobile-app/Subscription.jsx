import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Check, Zap, Lock, Globe, Wifi, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    features: ['4 Server Locations', '5 Devices', 'Unlimited Bandwidth', 'Kill Switch', 'AES-256'],
    popular: false,
    glow: 'rgba(124,58,237,0.3)',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.1)',
    accentBorder: 'rgba(124,58,237,0.3)',
  },
  {
    name: 'Yearly',
    price: '$4.99',
    period: '/month',
    badge: 'Save 50%',
    features: ['All Locations', '10 Devices', 'Unlimited Bandwidth', 'Kill Switch', 'Priority Support', 'Ad Blocker', 'Dedicated IP'],
    popular: true,
    glow: 'rgba(0,212,255,0.3)',
    accent: '#00d4ff',
    accentBg: 'rgba(0,212,255,0.08)',
    accentBorder: 'rgba(0,212,255,0.35)',
  },
];

export default function Subscription() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10" style={{ background: 'radial-gradient(ellipse, #00d4ff 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3 z-10 relative">
        <button onClick={() => navigate('/app/servers')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl leading-none">Choose a Plan</h1>
          <p className="text-slate-500 text-xs mt-0.5">Premium protection at any budget</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-4 overflow-y-auto z-10 relative">

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Shield, label: 'No Logs', color: 'text-cyan-400', glow: 'rgba(0,212,255,0.15)' },
            { icon: Zap, label: 'Ultra Fast', color: 'text-yellow-400', glow: 'rgba(250,204,21,0.15)' },
            { icon: Lock, label: 'AES-256', color: 'text-violet-400', glow: 'rgba(124,58,237,0.15)' },
          ].map(({ icon: Icon, label, color, glow }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl"
              style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', boxShadow: `0 0 20px ${glow}` }}>
              <Icon size={18} className={color} style={{ filter: `drop-shadow(0 0 4px currentColor)` }} />
              <span className="text-white text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        {PLANS.map((plan) => (
          <div key={plan.name} className="relative rounded-3xl p-5"
            style={{
              background: 'rgba(13,17,32,0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${plan.accentBorder}`,
              boxShadow: plan.popular
                ? `0 0 40px ${plan.glow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`
                : `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}>

            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 px-4 py-1 text-black text-xs font-black rounded-full" style={{ background: '#00d4ff', boxShadow: '0 0 16px rgba(0,212,255,0.6)' }}>
                  <Star size={10} fill="black" /> Most Popular
                </span>
              </div>
            )}
            {plan.badge && !plan.popular && (
              <div className="absolute -top-3 right-5">
                <span className="px-3 py-1 bg-emerald-400 text-black text-xs font-black rounded-full" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="flex items-center justify-between mb-4 mt-1">
              <div>
                <h3 className="text-white font-black text-lg leading-none">{plan.name}</h3>
                <p className="text-slate-500 text-xs mt-1">Billed {plan.name === 'Yearly' ? 'annually' : 'monthly'}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-3xl" style={{ color: plan.accent, textShadow: `0 0 20px ${plan.glow}` }}>{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                {plan.name === 'Yearly' && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">$59.88/yr · Save $60</p>}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: plan.accentBg, border: `1px solid ${plan.accentBorder}` }}>
                    <Check size={10} style={{ color: plan.accent }} />
                  </div>
                  <span className="text-slate-300">{f}</span>
                </li>
              ))}
            </ul>

            <Link to="/pricing">
              <button className="w-full py-4 font-black rounded-2xl text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                style={plan.popular
                  ? { background: 'linear-gradient(135deg, #00d4ff, #0066cc)', color: '#000', boxShadow: '0 8px 32px rgba(0,212,255,0.35)' }
                  : { background: plan.accentBg, border: `1px solid ${plan.accentBorder}`, color: plan.accent, boxShadow: `0 4px 16px ${plan.glow}` }
                }>
                <CreditCard size={16} />
                Get {plan.name} Plan
              </button>
            </Link>
          </div>
        ))}

        <p className="text-center text-slate-600 text-xs pb-4">
          🔒 Secure payment · Cancel anytime · 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 60%, #030609 100%)',
};