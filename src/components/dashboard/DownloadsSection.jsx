import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Smartphone, Loader2, Key, Copy, CheckCircle2, Shield, RefreshCw, Tag, XCircle, Zap, LogIn, Terminal, Wifi, Router } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const platformIcons = {
  Windows: Monitor, macOS: Monitor, Linux: Terminal,
  iOS: Smartphone, Android: Smartphone, Router: Router,
};

const platformColors = {
  Windows: { color: '#00d4ff', borderColor: 'rgba(0,212,255,0.25)', bgColor: 'rgba(0,212,255,0.06)', hoverBg: 'rgba(0,212,255,0.12)', iconBg: 'rgba(0,212,255,0.12)', iconBorder: 'rgba(0,212,255,0.3)' },
  Android: { color: '#34A853', borderColor: 'rgba(52,168,83,0.25)', bgColor: 'rgba(52,168,83,0.06)', hoverBg: 'rgba(52,168,83,0.12)', iconBg: 'rgba(52,168,83,0.12)', iconBorder: 'rgba(52,168,83,0.3)' },
  iOS: { color: '#a78bfa', borderColor: 'rgba(167,139,250,0.25)', bgColor: 'rgba(167,139,250,0.06)', hoverBg: 'rgba(167,139,250,0.12)', iconBg: 'rgba(167,139,250,0.12)', iconBorder: 'rgba(167,139,250,0.3)' },
  macOS: { color: '#94a3b8', borderColor: 'rgba(148,163,184,0.25)', bgColor: 'rgba(148,163,184,0.06)', hoverBg: 'rgba(148,163,184,0.12)', iconBg: 'rgba(148,163,184,0.12)', iconBorder: 'rgba(148,163,184,0.3)' },
  Linux: { color: '#f97316', borderColor: 'rgba(249,115,22,0.25)', bgColor: 'rgba(249,115,22,0.06)', hoverBg: 'rgba(249,115,22,0.12)', iconBg: 'rgba(249,115,22,0.12)', iconBorder: 'rgba(249,115,22,0.3)' },
  Router: { color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.25)', bgColor: 'rgba(139,92,246,0.06)', hoverBg: 'rgba(139,92,246,0.12)', iconBg: 'rgba(139,92,246,0.12)', iconBorder: 'rgba(139,92,246,0.3)' },
};

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
  if (/macintosh|mac os x/.test(ua) && !/iphone|ipad|mobile/.test(ua)) return 'macOS';
  if (/windows/.test(ua) && !/iemobile|windows phone/.test(ua)) return 'Windows';
  if (/linux/.test(ua)) return 'Linux';
  if (/mobile|touch|tablet/.test(ua)) return 'Android';
  return 'Windows';
}

export default function DownloadsSection({ isAdmin = false }) {
  const detectedPlatform = detectPlatform();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dlState, setDlState] = useState({});
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiredError, setExpiredError] = useState(null);

  useEffect(() => {
    setLoading(true);
    base44.entities.Download.filter({ is_active: true })
      .then(records => {
        const filtered = isAdmin ? (records || []) : (records || []).filter(d => d.platform === detectedPlatform);
        setDownloads(filtered);
      })
      .catch(() => {
        // fallback: try list()
        base44.entities.Download.list()
          .then(records => {
            const active = (records || []).filter(d => d.is_active !== false);
            const filtered = isAdmin ? active : active.filter(d => d.platform === detectedPlatform);
            setDownloads(filtered);
          })
          .catch(() => setDownloads([]));
      })
      .finally(() => setLoading(false));
  }, [isAdmin, detectedPlatform]);

  const handleDownload = async (download) => {
    const key = download.id;
    setDlState(s => ({ ...s, [key]: 'loading' }));
    setExpiredError(null);
    try {
      const url = download.file_url;
      if (!url) throw new Error('No download URL available');
      window.open(url, '_blank', 'noopener,noreferrer');
      setDlState(s => ({ ...s, [key]: 'done' }));
      setTimeout(() => setDlState(s => ({ ...s, [key]: 'idle' })), 3000);
    } catch (err) {
      setDlState(s => ({ ...s, [key]: 'idle' }));
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

        {!isAdmin && (
          <p className="text-slate-500 text-xs text-center">
            Showing installer for your device: <span className="text-white font-semibold">{detectedPlatform}</span>
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span className="text-sm">Loading downloads...</span>
          </div>
        ) : downloads.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] py-12 text-center">
            <Download size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No downloads available for your platform.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {downloads.map((d) => {
              const Icon = platformIcons[d.platform] || Download;
              const colors = platformColors[d.platform] || platformColors.Windows;
              const state = dlState[d.id] || 'idle';
              const rawExt = d.file_url?.split('?')[0]?.split('.').pop()?.toUpperCase();
              const ext = rawExt && rawExt.length <= 5 ? rawExt : (d.platform === 'Android' ? 'APK' : d.platform === 'Windows' ? 'EXE' : 'FILE');

              return (
                <button
                  key={d.id}
                  onClick={() => handleDownload(d)}
                  disabled={state !== 'idle'}
                  className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all disabled:opacity-70 group"
                  style={{ border: `1px solid ${colors.borderColor}`, background: colors.bgColor }}
                  onMouseEnter={e => e.currentTarget.style.background = colors.hoverBg}
                  onMouseLeave={e => e.currentTarget.style.background = colors.bgColor}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.iconBg, border: `1px solid ${colors.iconBorder}` }}>
                    <Icon size={22} style={{ color: colors.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm">{d.name}</p>
                    {d.version && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded mt-1" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                        <Tag size={8} /> v{d.version}
                      </span>
                    )}
                    <p className="text-slate-500 text-xs mt-1">{d.platform} · {ext}</p>
                    {d.description && <p className="text-slate-600 text-[10px] mt-1 truncate">{d.description}</p>}
                  </div>

                  <div className="flex-shrink-0">
                    {state === 'loading' && <Loader2 size={18} style={{ color: colors.color }} className="animate-spin" />}
                    {state === 'done' && <CheckCircle2 size={18} className="text-emerald-400" />}
                    {state === 'idle' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover:scale-110" style={{ background: colors.iconBg, border: `1px solid ${colors.iconBorder}` }}>
                        <Download size={14} style={{ color: colors.color }} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Account Linking */}
        <div className="rounded-xl p-4" style={{ border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Key size={14} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm mb-0.5">
                {detectedPlatform === 'Android' ? 'Log In After Installation' : 'Link Desktop App to Your Account'}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {detectedPlatform === 'Android' 
                  ? 'After installing the APK, open VoxVPN and sign in with your email and password.'
                  : 'After installing, open the app and enter this one-time token to automatically sign in.'
                }
              </p>

              {detectedPlatform === 'Android' ? (
                <Link to="/auth-login"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold transition-all"
                  style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <LogIn size={12} /> Go to Login
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>

        <p className="text-slate-700 text-xs text-center">Downloads are secure, verified and tied to your active subscription</p>
      </div>
    </motion.div>
  );
}