import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, CheckCircle2, Shield, ShieldCheck, Bug as Virus, Lock, Zap, Globe } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: Virus, title: 'Real-Time Malware Shield', desc: 'Blocks viruses, ransomware, spyware, and zero-day threats before they execute.' },
  { icon: Zap, title: 'Lightning Fast Scans', desc: 'Cloud-powered scanning that never slows your device down.' },
  { icon: ShieldCheck, title: 'Web & Phishing Protection', desc: 'Stops malicious links and fake sites before you click.' },
  { icon: Globe, title: 'Wi-Fi Intrusion Guard', desc: 'Alerts you when someone tries to snoop on your network.' },
];

const PLANS = [
  {
    name: 'Antivirus Basic',
    price: 1.99,
    period: '/mo',
    devices: '1 Device',
    badge: null,
    features: ['Real-time malware protection', 'Web shield', 'Daily threat updates', 'Email support'],
    btn: 'border border-slate-700 hover:border-cyan-500 text-white',
  },
  {
    name: 'Antivirus Pro',
    price: 3.99,
    period: '/mo',
    devices: '5 Devices',
    badge: 'Most Popular',
    badgeColor: 'bg-cyan-500 text-black',
    features: ['Everything in Basic', 'Ransomware shield', 'Phishing protection', 'Wi-Fi intrusion guard', 'Priority support'],
    btn: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    highlight: true,
  },
  {
    name: 'Antivirus Family',
    price: 5.99,
    period: '/mo',
    devices: '10 Devices',
    badge: 'Best Value',
    badgeColor: 'bg-emerald-500 text-black',
    features: ['Everything in Pro', 'Parental controls', 'Identity theft monitoring', 'Password manager', '24/7 priority support'],
    btn: 'border border-slate-700 hover:border-emerald-500 text-white',
  },
];

export default function AntivirusSignup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Antivirus Pro');

  const passwordStrength = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordValid =
    Object.values(passwordStrength).every(Boolean) && password === confirmPassword;

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!isPasswordValid) {
      setError('Password requirements not met or passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await base44.functions.invoke('emailSignup', {
        full_name: fullName,
        email,
        password,
      });
      if (res.data?.success) {
        navigate('/pricing?new=1&product=antivirus');
      } else {
        setError(res.data?.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-5">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span className="text-cyan-300 text-xs font-semibold tracking-wide">VOXVPN ANTIVIRUS</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              Complete Protection for <span className="text-cyan-400">Every Device</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Award-winning malware protection that works alongside your VoxVPN subscription.
              Sign up today and secure your devices in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#0d1120] border border-white/5 rounded-xl p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
                <f.icon size={20} className="text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-2">Choose Your Protection</h2>
          <p className="text-center text-slate-500 text-sm mb-8">Select a plan, then create your account below.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl p-6 flex flex-col ${
                  selectedPlan === plan.name
                    ? 'border-2 border-cyan-500 bg-[#0d1a20] shadow-lg shadow-cyan-500/10'
                    : plan.highlight
                      ? 'border-2 border-cyan-500/40 bg-[#0d1120]'
                      : 'border border-white/5 bg-[#0d1120]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${plan.badgeColor}`}>{plan.badge}</span>
                  </div>
                )}
                <h3 className="text-white font-bold text-base mb-0.5">{plan.name}</h3>
                <p className="text-slate-500 text-xs mb-4">{plan.devices}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-400 text-xs">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${plan.btn}`}
                >
                  {selectedPlan === plan.name ? 'Selected ✓' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-md mx-auto">
          <div className="bg-[#0d1120] border border-white/5 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Shield size={24} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Create Your Account</h2>
              <p className="text-slate-400 text-sm">
                Signing up for <span className="text-cyan-400 font-semibold">{selectedPlan}</span>
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  {[
                    { ok: passwordStrength.length, label: 'At least 8 characters' },
                    { ok: passwordStrength.upper, label: 'One uppercase letter' },
                    { ok: passwordStrength.lower, label: 'One lowercase letter' },
                    { ok: passwordStrength.number, label: 'One number' },
                  ].map((r) => (
                    <div key={r.label} className={`flex items-center gap-2 ${r.ok ? 'text-green-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={14} /> {r.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="av-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="av-terms" className="text-xs text-slate-400">
                  I agree to the{' '}
                  <a href="/terms-of-service" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading || !agreeTerms || !isPasswordValid}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
              >
                {loading ? 'Creating account...' : `Get ${selectedPlan}`}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400 mt-5">
              Already have an account?{' '}
              <Link to="/auth-login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign in</Link>
            </div>

            <div className="flex items-center justify-center gap-2 mt-5 text-slate-500 text-xs">
              <Lock size={12} className="text-cyan-400" />
              <span>AES-256 Encrypted · No-Logs Policy</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}