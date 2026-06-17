import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Smartphone, Loader2, Key, Copy, CheckCircle2, Shield, RefreshCw, Tag, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

async function fetchInstallerMeta(platform) {
  const res = await base44.functions.invoke('secureDownload', { platform });
  const { url, filename, version } = res.data;
  if (!url) throw new Error('No download URL');
  // Try to get file size via HEAD request
  let fileSize = null;
  try {
    const head = await fetch(url, { method: 'HEAD' });
    const bytes = parseInt(head.headers.get('content-length') || '0', 10);
    if (bytes > 0) {
      fileSize = bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
        : `${(bytes / 1024).toFixed(0)} KB`;
    }
  } catch (_) { /* size optional */ }
  return { url, filename, version, fileSize };
}

async function triggerDownload(platform) {
  const { url, filename } = await fetchInstallerMeta(platform);
  // Open in new tab — works for all URL types (external CDN, GitHub, signed URLs) without CORS issues
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const INSTALLERS = [
  {
    platform: 'Windows',
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
    directUrl: 'https://github.com/stepperandy/voxvpn/releases/download/V1.0/VoxVPN-v1.0.apk',
    directFilename: 'VoxVPN-v1.0-APK.apk',
    directVersion: '1.0',
  },
];

export default function DownloadsSection() {
  const [dlState, setDlState] = useState({ Windows: 'idle', Android: 'idle' });
  const [meta, setMeta] = useState({ Windows: null, Android: null });
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-fetch metadata (version + size) for both installers on mount
  useEffect(() => {
    INSTALLERS.forEach(({ platform }) => {
      fetchInstallerMeta(platform)
        .then(m => setMeta(prev => ({ ...prev, [platform]: m })))
        .catch(() => {});
    });
  }, []);

  const handleDownload = async (platform) => {
    setDlState(s => ({ ...s, [platform]: 'loading' }));
    try {
      const installer = INSTALLERS.find(i => i.platform === platform);
      // Android: direct URL, no backend needed
      if (installer?.directUrl) {
        const a = document.createElement('a');
        a.href = installer.directUrl;
        a.download = installer.directFilename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        await triggerDownload(platform);
      }
      setDlState(s => ({ ...s, [platform]: 'done' }));
      setTimeout(() => setDlState(s => ({ ...s, [platform]: 'idle' })), 3000);
    } catch (err) {
      setDlState(s => ({ ...s, [platform]: 'idle' }));
      alert('Download failed: ' + (err.message || 'Please try again.'));
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
        {/* Installer buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INSTALLERS.map(({ platform, label, subtitle, ext, icon: Icon, color, borderColor, bgColor, hoverBg, iconBg, iconBorder, directVersion }) => {
            const m = meta[platform];
            const state = dlState[platform];
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
                      <Tag size={8} /> v{m?.version || directVersion || '2.0.0'}
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

        {/* Account Linking */}
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

        <p className="text-slate-700 text-xs text-center">Downloads are secure, verified and tied to your active subscription</p>
      </div>
    </motion.div>
  );
}