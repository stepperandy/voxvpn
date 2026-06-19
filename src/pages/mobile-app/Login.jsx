import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

function getDeviceId() {
  let id = localStorage.getItem('voxvpn_device_id');
  if (!id) {
    id = 'android-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('voxvpn_device_id', id);
  }
  return id;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/functions/authLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          device_id: getDeviceId(),
          device_name: 'Android App',
          device_type: 'android',
        }),
      });
      const data = await res.json();
      if (data?.success === true) {
        if (data.token) localStorage.setItem('vpn_token', data.token);
        if (data.subscription) localStorage.setItem('subscription', JSON.stringify(data.subscription));
        navigate('/app/servers');
      } else {
        setError(data?.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email above, then tap Forgot password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const baseUrl = import.meta.env.VITE_BASE44_APP_BASE_URL || window.location.origin;
      await fetch(`${baseUrl}/api/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      alert('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f0f4f8' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
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

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10"
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
            style={{ background: '#141a24' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Forgot password?
          </button>
          <div className="text-gray-500">
            Need an account?{' '}
            <button
              onClick={() => navigate('/app/signup')}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}