import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Smartphone, Loader2, Key, Copy, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

async function triggerDownload(platform) {
  const res = await base44.functions.invoke('secureDownload', { platform });
  const url = res.data?.url;
  if (!url) throw new Error('No download URL returned');
  // Open in new tab — bypasses React router and works for external/direct URLs
  window.open(url, '_blank');
}

export default function DownloadsSection() {
  const [dlState, setDlState] = useState({ Windows: 'idle', Android: 'idle' });
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (platform) => {
    setDlState(s => ({ ...s, [platform]: 'loading' }));
    try {
      await triggerDownload(platform);
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
      className="rounded-2xl border border-white/5 bg-[#0d1420] overflow-hidden mb-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
        <Download size={16} className="text-cyan-400" />
        <h3 className="text-white font-bold text-base">Download VoxVPN</h3>
        <span className="ml-auto text-xs text-slate-600 font-mono">v2.0</span>
      </div>

      <div className="p-6 space-y-4">
        {/* Download buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Windows */}
          <button
            onClick={() => handleDownload('Windows')}
            disabled={dlState.Windows !== 'idle'}
            className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all group text-left disabled:opacity-70"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Monitor size={18} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Windows</p>
              <p className="text-slate-500 text-xs">Windows 10 / 11 · .exe</p>
            </div>
            {dlState.Windows === 'loading' && <Loader2 size={16} className="text-cyan-400 animate-spin flex-shrink-0" />}
            {dlState.Windows === 'done' && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
            {dlState.Windows === 'idle' && <Download size={14} className="text-cyan-400 group-hover:scale-110 transition-transform flex-shrink-0" />}
          </button>

          {/* Android */}
          <button
            onClick={() => handleDownload('Android')}
            disabled={dlState.Android !== 'idle'}
            className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group text-left disabled:opacity-70"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Android</p>
              <p className="text-slate-500 text-xs">Android 8.0+ · .apk</p>
            </div>
            {dlState.Android === 'loading' && <Loader2 size={16} className="text-emerald-400 animate-spin flex-shrink-0" />}
            {dlState.Android === 'done' && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />}
            {dlState.Android === 'idle' && <Download size={14} className="text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />}
          </button>
        </div>

        {/* Account Linking */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Key size={14} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm mb-0.5">Link Desktop App to Your Account</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                After installing, open the app and enter this one-time token to automatically sign in — no password needed.
              </p>

              {/* Token display */}
              {tokenData && !tokenExpired && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-[#060910] border border-violet-500/20 text-violet-300 text-xs font-mono tracking-wider truncate">
                      {tokenData.token}
                    </code>
                    <button onClick={copyToken}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-all flex-shrink-0">
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
                  className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-semibold hover:bg-violet-500/25 transition-all disabled:opacity-50"
                >
                  {tokenLoading ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
                  {tokenLoading ? 'Generating...' : 'Generate Login Token'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-slate-700 text-xs text-center">Downloads are secure, verified and tied to your subscription</p>
      </div>
    </motion.div>
  );
}