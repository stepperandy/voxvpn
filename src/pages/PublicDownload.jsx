import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Smartphone, Loader2, CheckCircle2, Shield, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORMS = [
  {
    platform: 'Windows',
    label: 'Windows',
    subtitle: 'Windows 10 / 11 · 64-bit',
    ext: '.exe',
    icon: Monitor,
    color: '#00d4ff',
    border: 'rgba(0,212,255,0.25)',
    bg: 'rgba(0,212,255,0.06)',
    hover: 'rgba(0,212,255,0.12)',
    iconBg: 'rgba(0,212,255,0.1)',
  },
  {
    platform: 'Android',
    label: 'Android',
    subtitle: 'Android 8.0+ · All devices',
    ext: '.apk',
    icon: Smartphone,
    color: '#34A853',
    border: 'rgba(52,168,83,0.25)',
    bg: 'rgba(52,168,83,0.06)',
    hover: 'rgba(52,168,83,0.12)',
    iconBg: 'rgba(52,168,83,0.1)',
  },
];

async function trackDownload(platform, status, source = 'public_page', error_message = null) {
  try {
    await base44.functions.invoke('trackDownload', { platform, status, source, error_message });
  } catch {}
}

async function doDownload(platform) {
  const res = await base44.functions.invoke('secureDownload', { platform });
  if (res.data?.expired) {
    const err = new Error(res.data.error || 'Subscription expired.');
    err.expired = true;
    throw err;
  }
  if (res.data?.error) throw new Error(res.data.error);
  const { url, filename } = res.data;
  if (!url) throw new Error('No download URL returned.');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || (platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe');
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function PublicDownload() {
  const [dlState, setDlState] = useState({});
  const [error, setError] = useState(null);

  const handleDownload = async (platform) => {
    setDlState(s => ({ ...s, [platform]: 'loading' }));
    setError(null);
    await trackDownload(platform, 'attempted', 'public_page');
    try {
      await doDownload(platform);
      await trackDownload(platform, 'success', 'public_page');
      setDlState(s => ({ ...s, [platform]: 'done' }));
      setTimeout(() => setDlState(s => ({ ...s, [platform]: 'idle' })), 3000);
    } catch (err) {
      await trackDownload(platform, 'failed', 'public_page', err.message);
      setDlState(s => ({ ...s, [platform]: 'idle' }));
      if (err.expired) {
        setError('Your subscription has expired. Please renew to download.');
      } else if (err.message?.includes('subscription') || err.message?.includes('403') || err.message?.includes('Unauthorized')) {
        setError('A VoxVPN subscription is required to download. Please sign in or purchase a plan.');
      } else {
        setError('Download failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060c1a' }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.15)' }}>
            <Shield size={16} style={{ color: '#00d4ff' }} />
          </div>
          <span className="text-white font-bold text-lg">VoxVPN</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/auth-login" className="text-slate-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link to="/pricing" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-black" style={{ background: '#00d4ff' }}>Get Plan</Link>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <Download size={28} style={{ color: '#00d4ff' }} />
        </div>
        <h1 className="text-white text-3xl md:text-4xl font-black text-center mb-3">Download VoxVPN</h1>
        <p className="text-slate-400 text-center max-w-md mb-2">Get the latest version for your device. A valid subscription is required to download.</p>
        <div className="flex items-center gap-4 mb-10 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Shield size={11} className="text-cyan-500" /> AES-256 Encrypted</span>
          <span className="flex items-center gap-1"><Lock size={11} className="text-cyan-500" /> No-Logs Policy</span>
          <span className="flex items-center gap-1"><Zap size={11} className="text-cyan-500" /> Lightning Fast</span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="w-full max-w-md mb-6 rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-rose-400 text-sm">{error}</p>
            {error.includes('subscription') && (
              <Link to="/pricing" className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-black" style={{ background: '#00d4ff' }}>Get Plan</Link>
            )}
          </div>
        )}

        {/* Download cards */}
        <div className="w-full max-w-md space-y-3">
          {PLATFORMS.map(({ platform, label, subtitle, ext, icon: Icon, color, border, bg, hover, iconBg }) => {
            const state = dlState[platform] || 'idle';
            return (
              <button
                key={platform}
                onClick={() => handleDownload(platform)}
                disabled={state !== 'idle'}
                className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all disabled:opacity-70 group"
                style={{ border: `1px solid ${border}`, background: bg }}
                onMouseEnter={e => e.currentTarget.style.background = hover}
                onMouseLeave={e => e.currentTarget.style.background = bg}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, border: `1px solid ${border}` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base">{label} <span className="font-mono text-xs opacity-40">{ext}</span></p>
                  <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
                </div>
                <div className="flex-shrink-0">
                  {state === 'loading' && <Loader2 size={20} style={{ color }} className="animate-spin" />}
                  {state === 'done' && <CheckCircle2 size={20} className="text-emerald-400" />}
                  {state === 'idle' && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{ background: iconBg, border: `1px solid ${border}` }}>
                      <Download size={15} style={{ color }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-slate-700 text-xs mt-8 text-center">Downloads are secure and verified. Requires an active VoxVPN subscription.</p>
        <Link to="/dashboard" className="mt-3 text-cyan-500 hover:text-cyan-400 text-xs transition-colors">Go to Dashboard →</Link>
      </div>
    </div>
  );
}