import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Download, Monitor, Bug, Shield, Loader2, CheckCircle2, Terminal, Copy, Users, Lock } from 'lucide-react';
import { FaWindows, FaAndroid } from 'react-icons/fa';

export default function InstallerTab({ client }) {
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (platform) => {
    setDownloading(platform);
    try {
      const res = await base44.functions.invoke('secureDownload', { platform });
      const url = res.data?.url;
      if (!url) throw new Error(res.data?.error || 'No download URL available');
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

  const installers = [
    {
      platform: 'Windows',
      icon: FaWindows,
      color: '#00d4ff',
      desc: 'VPN + Vox Antivirus + DNS filtering',
      size: '~45 MB',
      requirements: 'Windows 10/11 · 64-bit',
    },
    {
      platform: 'Android',
      icon: FaAndroid,
      color: '#34A853',
      desc: 'VPN + DNS filtering (APK)',
      size: '~18 MB',
      requirements: 'Android 8.0+',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-white font-black text-xl">Team Installer</h2>
        <p className="text-slate-500 text-xs mt-1">Download and deploy VoxShield with built-in Vox Antivirus to your team.</p>
      </div>

      {/* Installer cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {installers.map((inst, i) => {
          const Icon = inst.icon;
          return (
            <motion.div key={inst.platform} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border p-6" style={{ borderColor: `${inst.color}30`, background: `${inst.color}08` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${inst.color}15`, border: `1px solid ${inst.color}30` }}>
                  <Icon size={28} style={{ color: inst.color }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">VoxShield for {inst.platform}</h3>
                  <p className="text-slate-500 text-xs">{inst.requirements}</p>
                </div>
              </div>

              <p className="text-slate-400 text-xs mb-4">{inst.desc}</p>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Bug size={11} style={{ color: inst.color }} /> Vox Antivirus</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Shield size={11} style={{ color: inst.color }} /> AES-256</span>
                <span>·</span>
                <span>{inst.size}</span>
              </div>

              <button onClick={() => handleDownload(inst.platform)} disabled={downloading === inst.platform}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${inst.color}, ${inst.color}bb)` }}>
                {downloading === inst.platform ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {downloading === inst.platform ? 'Preparing...' : `Download ${inst.platform}`}
              </button>
            </motion.div>
          );
        })}
      </div>

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