import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const LOGO_URL = 'https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/9d3567c74_image.png';

export default function BusinessLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await base44.functions.invoke('authLogin', { email, password });
      const data = response?.data || response;

      if (!data?.success) {
        setError(data?.message || 'Invalid email or password.');
        return;
      }

      // Check if user has a business role
      const role = data.user?.role;
      if (!['client_admin', 'agency_admin', 'super_admin', 'admin'].includes(role)) {
        setError('This login is for business accounts. Please use the standard login page.');
        return;
      }

      await base44.auth.loginViaEmailPassword(email, password);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('next') || '/business/dashboard';
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Invalid email or password.';
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1a]">
      <Navbar />

      <div className="pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#0d1420] to-[#060c1a] p-8"
            style={{ boxShadow: '0 0 60px rgba(0,212,255,0.06)' }}>

            {/* Logo */}
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="VoxVPN Business Shield" className="w-28 h-auto mx-auto mb-4" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-3">
                <Building2 size={12} /> Business Portal
              </div>
              <h1 className="text-white font-black text-2xl mb-1">Welcome Back</h1>
              <p className="text-slate-500 text-sm">Sign in to your business dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Work Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    placeholder="john@acme.com"
                    className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#060910] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/reset-password" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base text-black transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #00b8e6)', boxShadow: '0 8px 30px rgba(0,212,255,0.3)' }}>
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                {loading ? 'Signing in...' : 'Sign In to Dashboard'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="text-slate-600 text-xs text-center mt-6">
              Don't have a business account?{' '}
              <Link to="/business" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Create one
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
              <Lock size={12} className="text-cyan-400" />
              <span>AES-256 Encrypted · No-Logs Policy</span>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}