import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, ArrowLeft, CheckCircle2, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Token-based reset (user clicked the link in the email)
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('token') || params.get('resetToken') || params.get('t');
  const isTokenMode = !!resetToken;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await base44.functions.invoke('forgotPassword', { email });
      setSent(true);
    } catch (err) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and numbers.');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      setDone(true);
      setTimeout(() => navigate('/auth-login'), 2500);
    } catch (err) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
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
              className="w-16 h-16 mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isTokenMode ? 'Set New Password' : 'Reset Your Password'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isTokenMode
                ? 'Enter your new password below'
                : sent
                  ? 'Check your inbox for the reset link'
                  : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </div>

          {/* TOKEN MODE — set new password */}
          {isTokenMode && !done && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-xs">
                Must be at least 8 characters with uppercase, lowercase, and a number.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}

          {/* TOKEN MODE — success */}
          {isTokenMode && done && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <p className="text-gray-700 text-sm mb-2 font-medium">Password updated!</p>
              <p className="text-gray-500 text-sm mb-6">Redirecting you to sign in...</p>
            </div>
          )}

          {/* REQUEST MODE — success state */}
          {!isTokenMode && sent && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-600" />
              </div>
              <p className="text-gray-700 text-sm mb-2 font-medium">Reset link sent!</p>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists for <span className="font-semibold text-gray-700">{email}</span>,
                you'll receive an email with instructions to reset your password.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Didn't get the email? Check your spam folder, or{' '}
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  try a different email
                </button>
              </p>
              <Link
                to="/auth-login"
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm transition-colors"
              >
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          )}

          {/* REQUEST MODE — form state */}
          {!isTokenMode && !sent && (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', boxShadow: '0 4px 20px rgba(0,212,255,0.3)' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {(!isTokenMode && !sent) && (
            <div className="mt-6 text-center">
              <Link
                to="/auth-login"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} /> Back to sign in
              </Link>
            </div>
          )}
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-xs">
          <Shield size={11} style={{ color: '#00d4ff' }} />
          <span>Secure password reset · AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
}