import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { Link } from 'react-router-dom';

export default function AuthSignup() {
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
      console.log('Email signup:', { fullName, email, password });
      alert('Email signup coming soon! Use social login for now.');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-400">Join VoxVPN and secure your connection</p>
        </div>

        {/* Social Login */}
        <div className="mb-6">
          <SocialLoginButtons />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0d1120] text-slate-400">or sign up with email</span>
          </div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
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

            {/* Password Strength Indicator */}
            <div className="mt-2 space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${passwordStrength.length ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={14} />
                At least 8 characters
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.upper ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={14} />
                One uppercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.lower ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={14} />
                One lowercase letter
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.number ? 'text-green-400' : 'text-slate-500'}`}>
                <CheckCircle2 size={14} />
                One number
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="terms" className="text-xs text-slate-400">
              I agree to the{' '}
              <a href="/terms-of-service" className="text-cyan-400 hover:text-cyan-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !agreeTerms || !isPasswordValid}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/auth-login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}