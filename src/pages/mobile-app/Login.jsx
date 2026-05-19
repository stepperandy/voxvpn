import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await base44.functions.invoke('authLogin', {
        email,
        password,
        device_id: getDeviceId(),
        device_name: 'VoxVPN Android',
        device_type: 'android',
      });
      const data = res.data;
      if (!data?.success || !data?.token) {
        setError(data?.message || 'Invalid credentials.');
        return;
      }
      localStorage.setItem('vpn_token', data.token);
      localStorage.setItem('vpn_email', email);
      navigate('/app/servers');
    } catch (err) {
      setError(err?.response?.data?.message || 'Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden select-none" style={styles.bg}>
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={styles.grid} />

      {/* Top cyan glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[380px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* ── Logo ── */}
      <div className="flex flex-col items-center pt-16 pb-8 z-10 relative px-6">
        <div className="relative flex items-center justify-center mb-5">
          {/* Pulse rings */}
          <div className="absolute w-32 h-32 rounded-full border border-cyan-400/15 animate-ping" style={{ animationDuration: '2.6s' }} />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '2.6s', animationDelay: '0.4s' }} />
          {/* Orb */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(0,212,255,0.15), rgba(0,40,80,0.3))',
              border: '1.5px solid rgba(0,212,255,0.45)',
              boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.06)',
            }}
          >
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png"
              alt="VoxVPN"
              className="w-12 h-auto"
              style={{ filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.85))' }}
            />
          </div>
        </div>
        <h1 className="text-white font-black text-2xl" style={{ textShadow: '0 0 20px rgba(0,212,255,0.4)', letterSpacing: '-0.02em' }}>
          Welcome Back
        </h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your VoxVPN account</p>
      </div>

      {/* ── Card ── */}
      <div className="flex-1 px-5 z-10 relative overflow-y-auto pb-8">
        <div className="rounded-3xl p-6" style={styles.card}>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-5" style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle size={14} className="text-rose-400 flex-shrink-0" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none"
                style={styles.input}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 focus:outline-none"
                  style={styles.input}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black rounded-2xl text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all mt-2 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #00c47a 100%)',
                boxShadow: '0 8px 32px rgba(0,212,255,0.35), 0 2px 8px rgba(0,0,0,0.3)',
                color: '#000',
              }}
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Authenticating…</>
                : <><Shield size={16} /> Sign In Securely</>}
            </button>
          </form>

          <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-center text-slate-600 text-xs mb-3">New to VoxVPN?</p>
            <button
              onClick={() => navigate('/vpn-signup')}
              className="w-full py-3.5 font-bold rounded-2xl text-sm active:scale-[0.97] transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        <p className="text-center text-slate-700 text-[11px] mt-6">VoxVPN · Military-grade encryption</p>
      </div>
    </div>
  );
}

function getDeviceId() {
  let id = localStorage.getItem('voxvpn_device_id');
  if (!id) {
    id = 'android-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('voxvpn_device_id', id);
  }
  return id;
}

const styles = {
  bg: {
    background: 'radial-gradient(ellipse at 50% 0%, #0b1a2e 0%, #060b16 55%, #030609 100%)',
  },
  grid: {
    backgroundImage:
      'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
    backgroundSize: '44px 44px',
  },
  card: {
    background: 'rgba(10,14,26,0.88)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.07)',
    boxShadow: '0 12px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    color: 'white',
    transition: 'border-color 0.2s',
  },
};