import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Bug, Shield, Loader2, CheckCircle2, Terminal, Copy, Users, Lock, Tag } from 'lucide-react';
import { FaWindows, FaAndroid } from 'react-icons/fa';


const platformIcons = {
  Windows: FaWindows,
  Android: FaAndroid,
};

const platformColors = {
  Windows: '#00d4ff',
  Android: '#34A853',
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

// Display-only rename: Firebase mirror installers shown as "VoxFire Mirror"
const displayLabel = (text) => (text ? text.replace(/firebase\s*mirror/gi, 'VoxFire mirror').replace(/firebase/gi, 'VoxFire') : text);

export default function InstallerTab({ client }) {
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false);
  const [installers, setInstallers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const detectedPlatform = detectPlatform();

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setIsAdmin(me?.role === 'admin' || me?.role === 'super_admin');
      } catch { /* ignore */ }

      try {
        const records = await base44.entities.Download.list();
        const active = (records || []).filter(d => d.is_active !== false);
        const business = active.filter(d => /voxshield|voxvpn releases/i.test(d.name));
        setInstallers(business);
      } catch {
        setInstallers([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDownload = async (installer) => {
    const key = installer.id || installer.platform;
    setDownloading(key);
    try {
      const url = installer.file_url;
      if (!url) throw new Error('No download URL available');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  const deployCommand = `VoxShield-Setup.exe /SILENT /TEAM_TOKEN=${client?.id || 'YOUR_TEAM_ID'} /AUTO_LOGIN`;

  const copyCommand = () => {
    navigator.clipboard.writeText(deployCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // OS filtering: admins see all, non-admins see only their detected platform
  const visibleInstallers = isAdmin
    ? installers
    : installers.filter(d => d.platform === detectedPlatform);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-white font-black text-xl">Team Installer</h2>
        <p className="text-slate-500 text-xs mt-1">Download and deploy VoxShield with built-in Vox Antivirus to your team.</p>
      </div>

      {!isAdmin && (
        <p className="text-slate-500 text-xs text-center">
          Showing installer for your device: <span className="text-white font-semibold">{detectedPlatform}</span>
        </p>
      )}

      {/* Installer cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span className="text-sm">Loading installers...</span>
        </div>
      ) : visibleInstallers.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#0d1120] py-12 text-center">
          <Download size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No installer available for your platform.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visibleInstallers.map((inst, i) => {
            const Icon = platformIcons[inst.platform] || Download;
            const color = platformColors[inst.platform] || '#00d4ff';
            const key = inst.id || inst.platform;
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border p-6" style={{ borderColor: `${color}30`, background: `${color}08` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={28} style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">{displayLabel(inst.name)}</h3>
                    <p className="text-slate-500 text-xs">{inst.platform}</p>
                  </div>
                </div>

                {inst.version && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded mb-3"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                    <Tag size={8} /> v{inst.version}
                  </span>
                )}

                <p className="text-slate-400 text-xs mb-4">{displayLabel(inst.description) || 'VoxShield security suite installer'}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Bug size={11} style={{ color }} /> Antivirus</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Shield size={11} style={{ color }} /> AES-256</span>
                  {inst.file_size && (<><span>·</span><span>{inst.file_size}</span></>)}
                </div>

                <button onClick={() => handleDownload(inst)} disabled={downloading === key}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                  {downloading === key ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {downloading === key ? 'Preparing...' : `Download ${inst.platform}`}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Silent deployment */}
      <div className="rounded-2xl border border-violet-500/20 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
          <Terminal size={14} className="text-violet-400" /> Silent Deployment (IT Admins)
        </h3>
        <p className="text-slate-400 text-xs mb-4">
          Deploy VoxShield to multiple machines silently. The team token auto-links devices to your business.
        </p>

        <div className="rounded-xl bg-[#060910] border border-white/10 p-4 font-mono text-xs">
          <div className="flex items-center justify-between gap-2">
            <code className="text-cyan-400 break-all flex-1">{deployCommand}</code>
            <button onClick={copyCommand} className="flex items-center gap-1 px-2 py-1 rounded text-violet-400 hover:bg-white/5 flex-shrink-0">
              {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
            <Users size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-semibold">Auto-Team Link</p>
              <p className="text-slate-500 text-[10px]">Devices auto-join your business</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
            <Lock size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-semibold">Policy Enforced</p>
              <p className="text-slate-500 text-[10px]">DNS filtering applied on install</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
            <Bug size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-xs font-semibold">Antivirus Active</p>
              <p className="text-slate-500 text-[10px]">Real-time scanning on boot</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1420] p-6">
        <h3 className="text-white font-bold text-sm mb-4">What's in the Installer</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Shield, label: 'VoxVPN Client', desc: 'OpenVPN tunnel with kill switch' },
            { icon: Bug, label: 'Vox Antivirus Engine', desc: 'Real-time malware scanning & quarantine' },
            { icon: Lock, label: 'DNS Threat Filter', desc: 'Network-level domain blocking' },
            { icon: Terminal, label: 'System Tray Agent', desc: 'Auto-start, heartbeat, auto-update' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <item.icon size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-xs font-semibold">{item.label}</p>
                <p className="text-slate-500 text-[10px]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}