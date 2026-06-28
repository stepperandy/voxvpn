import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, EyeOff, CheckCircle2, Shield, Lock, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Password requirements not met');
      setLoading(false);
      return;
    }

    try {
      const res = await base44.functions.invoke('emailSignup', {
        full_name: fullName,
        email: email,
        password: password,
      });

      if (res.data?.success) {
        navigate('/pricing?new=1');
      } else {
        setError(res.data?.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8"
          style={{ boxShadow: '0 0 80px rgba(0,212,255,0.2), 0 20px 60px rgba(0,0,0,0.4)' }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <img
              src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/13431de73_VoxICON.png"
              alt="VoxVPN"
              className="w-20 h-20 mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h1>
            <p className="text-gray-500 text-sm">Join VoxVPN and secure your connection</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center gap-1.5 ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 size={13} /> 8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.upper ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 size={13} /> Uppercase
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.lower ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 size={13} /> Lowercase
                </div>
                <div className={`flex items-center gap-1.5 ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 size={13} /> Number
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms-signup"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="terms-signup" className="text-xs text-gray-500">
                I agree to the{' '}
                <Link to="/terms-of-service" className="text-cyan-600 hover:text-cyan-700">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-cyan-600 hover:text-cyan-700">Privacy Policy</Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms || !isPasswordValid}
              className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/auth-login" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-5 text-gray-400 text-xs">
          <span className="flex items-center gap-1"><Lock size={11} style={{ color: '#00d4ff' }} /> AES-256</span>
          <span className="flex items-center gap-1"><Shield size={11} style={{ color: '#00d4ff' }} /> No-Logs</span>
          <span className="flex items-center gap-1"><Zap size={11} style={{ color: '#00d4ff' }} /> Fast Servers</span>
        </div>
      </div>
    </div>
  );
}