import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const LOCAL_API = 'http://localhost:5000';

// Generate a stable device_id stored in localStorage
function getDeviceId() {
  let id = localStorage.getItem('voxvpn_device_id');
  if (!id) {
    const raw = [
      navigator.userAgent,
      navigator.hardwareConcurrency,
      screen.width, screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Math.random().toString(36).slice(2),
    ].join('|');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    id = 'win-' + Math.abs(hash).toString(16) + '-' + Date.now().toString(36);
    localStorage.setItem('voxvpn_device_id', id);
  }
  return id;
}

function getDeviceName() {
  return localStorage.getItem('voxvpn_device_name') || `Windows PC (${navigator.platform || 'Desktop'})`;
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');

    try {
      const device_id   = getDeviceId();
      const device_name = getDeviceName();

      const res = await fetch(`${LOCAL_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, device_id, device_name, device_type: 'windows' }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Invalid email or password.');
      }

      if (data.subscriptionActive === false) {
        throw new Error('No active subscription. Please renew at voxvpn.net.');
      }

      localStorage.setItem('voxvpn_device_name', device_name);

      login({
        email: data.email || email,
        token: data.token,
        device_id,
        device_name,
        name: data.name || email.split('@')[0],
        plan: data.subscription?.plan || data.plan || null,
        hasAccess: true,
      });

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c18] flex items-center justify-center px-4" style={gridBg}>
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <img
            src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
            alt="VoxVPN"
            className="h-16 w-auto mb-3"
          />
          <p className="text-slate-500 text-sm">Sign in to your VoxVPN account</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d1120] p-6 shadow-2xl shadow-black/50">
          <h2 className="text-white font-black text-xl mb-6">Welcome back</h2>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm mb-4">
              <AlertTriangle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-white/8 bg-[#080c18] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-white/8 bg-[#080c18] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-black text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            No account?{' '}
            <a
              href="https://voxvpn.net/#pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              Get a plan
            </a>
          </p>

          <p className="text-center text-slate-600 text-xs mt-3">
            <a
              href="https://voxvpn.net/auth-login"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              Forgot password?
            </a>
          </p>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">VoxVPN · Military-grade privacy</p>
      </div>
    </div>
  );
}

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)',
  backgroundSize: '40px 40px',
};