import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const API_BASE = 'https://voxvpn-backend.onrender.com';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (tab === 'login') {
        if (!res.ok || !data.token) {
          setError(data.message || 'Invalid credentials.');
          return;
        }
        localStorage.setItem('vpn_token', data.token);
        localStorage.setItem('vpn_email', email);
        navigate('/app/servers');
      } else {
        if (data.token) {
          localStorage.setItem('vpn_token', data.token);
          localStorage.setItem('vpn_email', email);
          navigate('/app/servers');
          return;
        }
        if (res.ok || (data.message && data.message.toLowerCase().includes('email'))) {
          setSuccess(data.message || 'Account created! Check your email to confirm.');
          return;
        }
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <img
          src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
          alt="VoxVPN"
          className="w-28 h-auto mb-2 drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]"
        />
        <p className="text-slate-500 text-sm mt-1">Your privacy, protected</p>
      </div>

      {/* Tab switcher */}
      <div className="mx-6 mb-6">
        <div className="flex bg-[#0d1120] rounded-2xl p-1 border border-white/5">
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? 'bg-cyan-400 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 space-y-4 flex-1">
        <div>
          <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3.5 rounded-2xl bg-[#0d1120] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
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
              className="w-full px-4 py-3.5 rounded-2xl bg-[#0d1120] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors pr-12"
            />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}

        {!success ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-black rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 mt-2"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Loading...</> : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ) : (
          <button type="button" onClick={() => { setTab('login'); setSuccess(''); }}
            className="w-full py-4 bg-cyan-400 text-black font-black rounded-2xl text-base">
            Go to Sign In
          </button>
        )}
      </form>

      <p className="text-center text-slate-600 text-xs pb-12 pt-6">
        By continuing, you agree to our{' '}
        <span className="text-cyan-400">Terms of Service</span>
      </p>
    </div>
  );
}