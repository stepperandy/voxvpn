import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, Building2, Users, Lock, Mail, User, Phone, Loader2, CheckCircle2, AlertCircle, Antenna, Bug, Eye, ArrowRight } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const TEAM_SIZES = [
  { value: '5', label: '1–5 employees' },
  { value: '10', label: '6–10 employees' },
  { value: '25', label: '11–25 employees' },
  { value: '50', label: '26–50 employees' },
  { value: '100', label: '51–100 employees' },
  { value: '250', label: '100+ employees' },
];

const FEATURES = [
  { icon: Shield, title: 'VPN for Every Device', desc: 'Military-grade encryption across Windows, macOS, Android & iOS' },
  { icon: Bug, title: 'Vox Antivirus Built-in', desc: 'Real-time malware scanning embedded in the desktop installer' },
  { icon: Eye, title: 'DNS Threat Filtering', desc: 'Block malware, phishing & custom domains at the network level' },
  { icon: Users, title: 'Team Management', desc: 'Invite members, manage devices & enforce security policies' },
];

export default function BusinessSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company_name: '', full_name: '', email: '', password: '',
    team_size: '10', contact_phone: '', plan: 'standard',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await base44.functions.invoke('businessSignup', form);
      if (res.data?.error) throw new Error(res.data.error);
      // Log the user in so they can access the dashboard immediately
      await base44.auth.loginViaEmailPassword(form.email, form.password);
      window.location.href = res.data?.redirect || '/business/dashboard';
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/9d3567c74_image.png"
              alt="VoxVPN Business Shield"
              className="w-40 h-auto mx-auto mb-4"
            />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-4">
              <Building2 size={12} /> VoxShield Business
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Secure Your Entire Team
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              VPN + Antivirus + DNS filtering for businesses. One dashboard, one login, total control.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Left: Features */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="text-white font-bold text-xl mb-6">Everything your team needs</h2>
              {FEATURES.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-[#0d1420]">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 mt-6">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm mb-2">
                  <Lock size={14} /> One Login Everywhere
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The same credentials work on the web dashboard, desktop app, and mobile.
                  Team members use their email & password — no separate accounts.
                </p>
              </div>
            </motion.div>

            {/* Right: Signup Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0d1420] to-[#060c1a] p-8"
              style={{ boxShadow: '0 0 60px rgba(0,212,255,0.06)' }}>

              <h2 className="text-white font-black text-2xl mb-1">Create Business Account</h2>
              <p className="text-slate-500 text-sm mb-6">Start your 14-day trial — no credit card required.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Company Name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input value={form.company_name} onChange={e => set('company_name', e.target.value)} required
                      placeholder="Acme Corporation"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Your Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input value={form.full_name} onChange={e => set('full_name', e.target.value)} required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Work Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                      placeholder="john@acme.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} required
                      placeholder="Min 8 chars, upper + lower + number"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Team Size</label>
                    <select value={form.team_size} onChange={e => set('team_size', e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50">
                      {TEAM_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Phone (optional)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                        placeholder="+1 555 0100"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base text-black transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #00b8e6)', boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}>
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                  {loading ? 'Creating Account...' : 'Create Business Account'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <p className="text-slate-600 text-xs text-center mt-4">
                Already have an account?{' '}
                <Link to="/business/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}