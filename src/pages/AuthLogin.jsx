import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, EyeOff, Shield, Wifi, Lock, Zap, Globe, Server, Key, Cpu, Network, Database, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

// Flying tech particle component
function TechParticle({ icon: Icon, size, color, top, left, delay, blinkClass }) {
  return (
    <div 
      className={`absolute pointer-events-none ${blinkClass}`}
      style={{ top, left, animationDelay: delay }}
    >
      <Icon size={size} color={color} />
    </div>
  );
}

const PARTICLES = [
  { icon: Shield,  top: '10%', left: '8%',  size: 28, color: '#00d4ff', delay: '0s', blink: 'blink-1' },
  { icon: Wifi,    top: '20%', left: '88%', size: 22, color: '#8b5cf6', delay: '1s', blink: 'blink-2' },
  { icon: Lock,    top: '75%', left: '10%', size: 26, color: '#06b6d4', delay: '2s', blink: 'blink-3' },
  { icon: Zap,     top: '85%', left: '85%', size: 20, color: '#fbbf24', delay: '0.5s', blink: 'blink-1' },
  { icon: Globe,   top: '50%', left: '5%',  size: 32, color: '#3b82f6', delay: '1.5s', blink: 'blink-2' },
  { icon: Server,  top: '40%', left: '90%', size: 24, color: '#10b981', delay: '2.5s', blink: 'blink-3' },
  { icon: Key,     top: '65%', left: '82%', size: 22, color: '#f59e0b', delay: '0.3s', blink: 'blink-1' },
  { icon: Cpu,     top: '30%', left: '15%', size: 26, color: '#ef4444', delay: '1.2s', blink: 'blink-2' },
  { icon: Network, top: '70%', left: '92%', size: 24, color: '#14b8a6', delay: '2.2s', blink: 'blink-3' },
  { icon: Database,top: '15%', left: '50%', size: 28, color: '#6366f1', delay: '0.8s', blink: 'blink-1' },
  { icon: Cloud,   top: '80%', left: '25%', size: 30, color: '#06b6d4', delay: '1.8s', blink: 'blink-2' },
  { icon: Shield,  top: '45%', left: '85%', size: 22, color: '#8b5cf6', delay: '2.8s', blink: 'blink-3' },
];

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('next') || '/dashboard';
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await base44.auth.resetPasswordRequest(email);
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(10deg); }
          66% { transform: translateY(12px) rotate(-6deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          40% { transform: translateY(-25px) translateX(15px) rotate(-12deg); }
          70% { transform: translateY(10px) translateX(-10px) rotate(8deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-18px) rotate(15deg) scale(1.15); }
        }
        @keyframes blink-1 {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes blink-2 {
          0%, 100% { opacity: 0.5; }
          60% { opacity: 0.95; }
        }
        @keyframes blink-3 {
          0%, 100% { opacity: 0.55; }
          40% { opacity: 1; }
        }
        .float-1 { animation: float-1 8s ease-in-out infinite; }
        .float-2 { animation: float-2 10s ease-in-out infinite; }
        .float-3 { animation: float-3 7s ease-in-out infinite; }
        .blink-1 { animation: blink-1 3s ease-in-out infinite; }
        .blink-2 { animation: blink-2 4s ease-in-out infinite; }
        .blink-3 { animation: blink-3 3.5s ease-in-out infinite; }
      `}</style>

      {/* Floating tech particles */}
      {PARTICLES.map((p, i) => (
        <TechParticle
          key={i}
          icon={p.icon}
          size={p.size}
          color={p.color}
          top={p.top}
          left={p.left}
          delay={p.delay}
          blinkClass={p.blink}
        />
      ))}

      {/* Glow orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} 
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} 
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} 
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ boxShadow: '0 0 80px rgba(0,212,255,0.2), 0 20px 60px rgba(0,0,0,0.4)' }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
              alt="VoxVPN"
              className="w-20 h-20 mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to VoxVPN</h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                <path d="M12.0001 2.91675V11.2918H18.8751L17.6376 15.8543H12.0001V22.0834H6.70841V15.8543H2.08341V11.2918H6.70841V5.45841C6.70841 3.33341 7.83341 2.08341 9.87508 2.08341C10.8542 2.08341 12.0001 2.25008 12.0001 2.25008V2.91675Z" fill="url(#microsoft-gradient)"/>
                <defs>
                  <linearGradient id="microsoft-gradient" x1="10.4584" y1="2.08341" x2="10.4584" y2="22.0834" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F35322"/>
                    <stop offset="0.33" stopColor="#81BC06"/>
                    <stop offset="0.67" stopColor="#05A6F0"/>
                    <stop offset="1" stopColor="#FFBA08"/>
                  </linearGradient>
                </defs>
              </svg>
              Continue with Microsoft
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
            <div className="text-gray-500">
              Need an account?{' '}
              <Link
                to="/auth-signup"
                className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom trust badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-slate-400 text-xs">
          <Lock size={10} style={{ color: '#00d4ff' }} />
          <span>AES-256 Encrypted · No-Logs Policy</span>
        </div>
      </div>
    </div>
  );
}