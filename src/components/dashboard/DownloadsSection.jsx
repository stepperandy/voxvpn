import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { Download, Monitor, Smartphone, Loader2, Key, Copy, CheckCircle2, Shield, RefreshCw, Tag, HardDrive, XCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

async function fetchInstallerMeta(platform) {
  // Use direct fetch since secureDownload returns binary, not JSON
  const token = localStorage.getItem('base44_access_token');
  const appUrl = window.location.origin;
  const res = await fetch(`${appUrl}/functions/secureDownload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ platform }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch metadata');
  }
  // Just return metadata - the actual download happens separately
  return { filename: platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe', version: '2.0.0' };
}

async function trackDownload(platform, status, errorMessage = null) {
  try {
    await base44.functions.invoke('trackDownload', {
      platform, status, source: 'dashboard',
      ...(errorMessage && { error_message: errorMessage }),
    });
  } catch {}
}

async function triggerDownload(platform) {
  // Direct fetch to get binary stream (base44.functions.invoke expects JSON)
  const token = localStorage.getItem('base44_access_token');
  const appUrl = window.location.origin;
  const res = await fetch(`${appUrl}/functions/secureDownload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ platform }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (errData.expired) {
      const err = new Error(errData.error || 'Subscription expired.');
      err.expired = true;
      throw err;
    }
    throw new Error(errData.error || `Download failed: ${res.status}`);
  }
  // Stream the binary blob and trigger download
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const filename = platform === 'Android' ? 'VoxVPN.apk' : 'VoxVPN-Setup.exe';
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

const ALL_INSTALLERS = [
  {
    platform: 'Windows',
    osKeys: ['win'],
    label: 'Windows',
    subtitle: 'Windows 10 / 11 · 64-bit',
    ext: '.exe',
    icon: Monitor,
    color: '#00d4ff',
    borderColor: 'rgba(0,212,255,0.25)',
    bgColor: 'rgba(0,212,255,0.06)',
    hoverBg: 'rgba(0,212,255,0.12)',
    iconBg: 'rgba(0,212,255,0.12)',
    iconBorder: 'rgba(0,212,255,0.3)',
  },
  {
    platform: 'Android',
    osKeys: ['android'],
    label: 'Android',
    subtitle: 'Android 8.0+ · All devices',
    ext: '.apk',
    icon: Smartphone,
    color: '#34A853',
    borderColor: 'rgba(52,168,83,0.25)',
    bgColor: 'rgba(52,168,83,0.06)',
    hoverBg: 'rgba(52,168,83,0.12)',
    iconBg: 'rgba(52,168,83,0.12)',
    iconBorder: 'rgba(52,168,83,0.3)',

  },
  {
    platform: 'iOS',
    osKeys: ['iphone', 'ipad', 'ios'],
    label: 'iOS',
    subtitle: 'iPhone & iPad · iOS 14+',
    ext: '.ipa',
    icon: Smartphone,
    color: '#a78bfa',
    borderColor: 'rgba(167,139,250,0.25)',
    bgColor: 'rgba(167,139,250,0.06)',
    hoverBg: 'rgba(167,139,250,0.12)',
    iconBg: 'rgba(167,139,250,0.12)',
    iconBorder: 'rgba(167,139,250,0.3)',
    comingSoon: true,
  },
  {
    platform: 'macOS',
    osKeys: ['mac'],
    label: 'macOS',
    subtitle: 'macOS 12+ · Apple Silicon & Intel',
    ext: '.dmg',
    icon: Monitor,
    color: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.25)',
    bgColor: 'rgba(148,163,184,0.06)',
    hoverBg: 'rgba(148,163,184,0.12)',
    iconBg: 'rgba(148,163,184,0.12)',
    iconBorder: 'rgba(148,163,184,0.3)',
    comingSoon: true,
  },
];

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
  if (/macintosh|mac os x/.test(ua) && !/iphone|ipad/.test(ua)) return 'macOS';
  if (/win/.test(ua)) return 'Windows';
  return null; // unknown / desktop fallback
}

export default function DownloadsSection() {
  const detectedPlatform = detectPlatform();
  // Show only the detected platform's installer; fall back to all if unknown
  const INSTALLERS = detectedPlatform
    ? ALL_INSTALLERS.filter(i => i.platform === detectedPlatform)
    : ALL_INSTALLERS.filter(i => !i.comingSoon);

  const [dlState, setDlState] = useState({});
  const [meta, setMeta] = useState({});
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiredError, setExpiredError] = useState(null);

  // Pre-fetch metadata (version + size) — skip coming-soon installers
  useEffect(() => {
    INSTALLERS.forEach(({ platform, comingSoon }) => {
      if (comingSoon) return;
      fetchInstallerMeta(platform)
        .then(m => setMeta(prev => ({ ...prev, [platform]: m })))
        .catch(() => {});
    });
  }, []);

  const handleDownload = async (platform) => {
    setDlState(s => ({ ...s, [platform]: 'loading' }));
    setExpiredError(null);
    await trackDownload(platform, 'attempted');
    try {
      await triggerDownload(platform);
      await trackDownload(platform, 'success');
      setDlState(s => ({ ...s, [platform]: 'done' }));
      setTimeout(() => setDlState(s => ({ ...s, [platform]: 'idle' })), 3000);
    } catch (err) {
      await trackDownload(platform, 'failed', err.message);
      setDlState(s => ({ ...s, [platform]: 'idle' }));
      if (err.expired) {
        setExpiredError(err.message);
      } else {
        alert('Download failed: ' + (err.message || 'Please try again.'));
      }
    }
  };

  const generateToken = async () => {
    setTokenLoading(true);
    setTokenData(null);
    try {
      const res = await base44.functions.invoke('generateAppToken', {});
      setTokenData(res.data);
    } catch (err) {
      alert('Failed to generate token: ' + err.message);
    } finally {
      setTokenLoading(false);
    }
  };

  const copyToken = () => {
    if (!tokenData?.token) return;
    navigator.clipboard.writeText(tokenData.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenExpired = tokenData?.expires_at && new Date(tokenData.expires_at) < new Date();
  const minutesLeft = tokenData?.expires_at
    ? Math.max(0, Math.round((new Date(tokenData.expires_at) - Date.now()) / 60000))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl overflow-hidden mb-5"
      style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'linear-gradient(135deg, #0d1420, #060c1a)', boxShadow: '0 0 40px rgba(0,212,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <Download size={14} style={{ color: '#00d4ff' }} />
        </div>
        <h3 className="text-white font-bold text-base">Download VoxVPN</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
            <Tag size={9} /> LATEST
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Expired subscription block */}
        {expiredError && (
          <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-rose-400 font-bold text-sm mb-1">Subscription Expired</p>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{expiredError}</p>
              <Link to="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-black text-xs font-bold transition-all"
                style={{ background: '#00d4ff' }}>
                <Zap size={12} /> Renew Plan
              </Link>
            </div>
          </div>
        )}

        {/* Platform notice */}
        {detectedPlatform && (
          <p className="text-slate-500 text-xs text-center">
            Showing installer for your device: <span className="text-white font-semibold">{detectedPlatform}</span>
          </p>
        )}

        {/* Installer buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INSTALLERS.map(({ platform, label, subtitle, ext, icon: Icon, color, borderColor, bgColor, hoverBg, iconBg, iconBorder, directVersion, comingSoon }) => {
            const m = meta[platform];
            const state = dlState[platform] || 'idle';

            if (comingSoon) {
              return (
                <div key={platform}
                  className="flex items-center gap-4 p-4 rounded-2xl opacity-50 cursor-not-allowed"
                  style={{ border: `1px solid ${borderColor}`, background: bgColor }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm">{label} <span className="font-mono text-[10px] opacity-50">{ext}</span></p>
                    <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}>Coming Soon</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={platform}
                onClick={() => handleDownload(platform)}
                disabled={state !== 'idle'}
                className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all disabled:opacity-70 group"
                style={{ border: `1px solid ${borderColor}`, background: bgColor }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = bgColor}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                  <Icon size={22} style={{ color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm">{label} <span className="font-mono text-[10px] opacity-50">{ext}</span></p>
                  <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>

                  {/* Version + size badges */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                      <Tag size={8} /> v{m?.version || '2.0.0'}
                    </span>
                    {m?.fileSize && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                        <HardDrive size={8} /> {m.fileSize}
                      </span>
                    )}
                  </div>
                </div>

                {/* State icon */}
                <div className="flex-shrink-0">
                  {state === 'loading' && <Loader2 size={18} style={{ color }} className="animate-spin" />}
                  {state === 'done' && <CheckCircle2 size={18} className="text-emerald-400" />}
                  {state === 'idle' && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                      <Download size={14} style={{ color }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Account Linking — desktop only */}
        {(!detectedPlatform || detectedPlatform === 'Windows' || detectedPlatform === 'macOS') && (
          <div className="rounded-xl p-4" style={{ border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <Key size={14} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm mb-0.5">Link Desktop App to Your Account</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  After installing, open the app and enter this one-time token to automatically sign in — no password needed.
                </p>

                {tokenData && !tokenExpired && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg text-violet-300 text-xs font-mono tracking-wider truncate" style={{ background: '#060c1a', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {tokenData.token}
                      </code>
                      <button onClick={copyToken}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-violet-300 text-xs font-semibold transition-all flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                        {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Shield size={10} className="text-violet-400" />
                      <span className="text-violet-400/70">Single-use · expires in {minutesLeft} min</span>
                      <button onClick={generateToken} className="ml-auto text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                        <RefreshCw size={10} /> New token
                      </button>
                    </div>
                  </div>
                )}

                {tokenExpired && (
                  <p className="text-amber-400 text-xs mt-2">Token expired. Generate a new one.</p>
                )}

                {!tokenData && (
                  <button
                    onClick={generateToken}
                    disabled={tokenLoading}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-violet-300 text-xs font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    {tokenLoading ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
                    {tokenLoading ? 'Generating...' : 'Generate Login Token'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-slate-700 text-xs text-center">Downloads are secure, verified and tied to your active subscription</p>
      </div>
    </motion.div>
  );
}