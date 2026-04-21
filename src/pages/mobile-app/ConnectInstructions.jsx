import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { VPN_SERVERS } from '@/lib/vpnServers';

const STEPS = [
  { num: 1, title: 'Download VoxVPN Profile', desc: 'Tap the button below to download your VoxVPN config file.' },
  { num: 2, title: 'Open OpenVPN Connect', desc: 'Launch the OpenVPN Connect app on your device.' },
  { num: 3, title: 'Import into OpenVPN Connect', desc: 'Tap "+" → "Import from Files" and select your VoxVPN profile.' },
  { num: 4, title: 'Connect with VoxVPN', desc: 'Enable the profile to start your VoxVPN encrypted session.' },
];

const STATUS = { IDLE: 'idle', READY: 'ready', DOWNLOADED: 'downloaded' };

export default function ConnectInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.IDLE);

  const server = VPN_SERVERS.find(s => s.id === id) || null;

  const triggerDownload = () => {
    if (!server) return;
    if (!server.config?.trim()) {
      setStatus(STATUS.READY); // shows "config not available" message
      return;
    }
    const blob = new Blob([server.config], { type: 'application/x-openvpn-profile' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoxVPN-${server.name}.ovpn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus(STATUS.DOWNLOADED);
  };

  const openOpenVPN = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    window.location.href = 'openvpn://';
    setTimeout(() => {
      window.open(isAndroid
        ? 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn'
        : 'https://apps.apple.com/app/openvpn-connect/id590379981', '_blank');
    }, 1500);
  };

  // No server found
  if (!server) {
    return (
      <div className="min-h-screen bg-[#060d1a] flex flex-col items-center justify-center px-5 gap-4">
        <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="w-24 h-auto mb-2" />
        <AlertCircle size={32} className="text-amber-400" />
        <p className="text-white font-bold text-lg">Select a VoxVPN server first</p>
        <button onClick={() => navigate('/app/servers')}
          className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-2xl">
          Back to Servers
        </button>
      </div>
    );
  }

  const hasConfig = !!server.config?.trim();

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/app/servers')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <img src="https://media.base44.com/images/public/69c84f61d5543b54fe26e1e5/5e71f2d6f_image.png" alt="VoxVPN" className="h-8 w-auto" />
        <div className="ml-1">
          <h1 className="text-white font-black text-lg leading-none">VoxVPN Secure Access</h1>
          <p className="text-slate-500 text-xs mt-0.5">{server.name}</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-5">
        {/* Server card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Shield size={24} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-black text-xl">{server.name}</p>
            <p className="text-slate-400 text-sm font-mono">VoxVPN-{server.name}.ovpn</p>
          </div>
          <div className="ml-auto">
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${hasConfig ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {hasConfig ? 'Config Ready' : 'No Config'}
            </span>
          </div>
        </div>

        {/* Status feedback */}
        {status === STATUS.DOWNLOADED && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300 text-sm leading-relaxed">
              <strong>VoxVPN-{server.name}.ovpn</strong> downloaded. Open this profile in OpenVPN Connect to start your VoxVPN session.
            </p>
          </div>
        )}

        {!hasConfig && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-rose-300 text-sm">Config not available for this server yet. Try another location.</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">How to Connect with VoxVPN</p>
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3 p-4 rounded-2xl bg-[#0d1120] border border-white/5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                status === STATUS.DOWNLOADED && step.num === 1 ? 'bg-emerald-400 text-black' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {status === STATUS.DOWNLOADED && step.num === 1 ? <CheckCircle2 size={14} /> : step.num}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{step.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={triggerDownload}
            disabled={!hasConfig}
            className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            {status === STATUS.DOWNLOADED
              ? <><CheckCircle2 size={18} /> Download VoxVPN Profile Again</>
              : <><Download size={18} /> {hasConfig ? 'Download VoxVPN Profile' : 'Config Not Available'}</>
            }
          </button>

          <button
            onClick={openOpenVPN}
            className="w-full py-4 bg-[#0d1120] hover:bg-[#0d1a20] border border-white/10 hover:border-cyan-500/30 text-white font-black rounded-2xl text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ExternalLink size={18} className="text-cyan-400" />
            Open OpenVPN Connect
          </button>
        </div>
      </div>
    </div>
  );
}