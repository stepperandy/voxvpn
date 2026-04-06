import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

const API_BASE = 'https://package-manager-setup.replit.app';

export default function VpnSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.message || 'Signup failed. Please try again.');
        return;
      }
      localStorage.setItem('auth_token', data.token);
      navigate('/vpn-dashboard');
    } catch {
      setError('Could not connect to VoxVPN server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Shield size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black text-white">VoxVPN</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#0d1120] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0d1120] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/vpn-login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}