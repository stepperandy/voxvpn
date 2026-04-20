import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, CheckCircle2, Shield, Loader2 } from 'lucide-react';

const API_BASE = 'https://voxvpn-backend.onrender.com';

const SERVERS = [
  { id: 1, city: 'Amsterdam', country: 'Netherlands',  flag: '🇳🇱' },
  { id: 2, city: 'London',    country: 'UK',           flag: '🇬🇧' },
  { id: 3, city: 'USA',       country: 'United States', flag: '🇺🇸' },
  { id: 4, city: 'Singapore', country: 'Singapore',    flag: '🇸🇬' },
];

const STEPS = [
  { num: 1, title: 'Download Config', desc: 'Tap the button below to download your VPN profile.' },
  { num: 2, title: 'Open OpenVPN Connect', desc: 'Launch the OpenVPN Connect app on your device.' },
  { num: 3, title: 'Import Profile', desc: 'Tap "+" → "Import from Files" and select the downloaded profile.' },
  { num: 4, title: 'Tap Connect', desc: 'Enable the profile to start your encrypted VPN session.' },
];

export default function ConnectInstructions() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const server = location.state?.server || SERVERS.find(s => s.id === parseInt(id)) || SERVERS[0];

  const handleDownload = () => {
    setLoading(true);
    const url = `${API_BASE}/download-config/${server.id}`;
    window.open(url, '_blank');
    setTimeout(() => {
      setLoading(false);
      setDownloaded(true);
    }, 1200);
  };

  const openOpenVPN = () => {
    // Try deep link first, fallback to app store
    const deepLink = 'openvpn://';
    const iosStore = 'https://apps.apple.com/app/openvpn-connect/id590379981';
    const androidStore = 'https://play.google.com/store/apps/details?id=net.openvpn.openvpn';
    const isAndroid = /android/i.test(navigator.userAgent);
    window.location.href = deepLink;
    setTimeout(() => {
      window.open(isAndroid ? androidStore : iosStore, '_blank');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060d1a] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/app/servers')}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-black text-lg leading-none">Connect to VPN</h1>
          <p className="text-slate-500 text-xs mt-0.5">{server.flag} {server.city}, {server.country}</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-5">
        {/* Server card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 flex items-center gap-4">
          <span className="text-5xl">{server.flag}</span>
          <div>
            <p className="text-white font-black text-xl">{server.city}</p>
            <p className="text-slate-400 text-sm">{server.country}</p>
          </div>
          <div className="ml-auto flex flex-col items-center">
            <Shield size={28} className="text-cyan-400" />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">How to Connect</p>
          {STEPS.map((step) => (
            <div key={step.num} className="flex gap-3 p-4 rounded-2xl bg-[#0d1120] border border-white/5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                downloaded && step.num === 1 ? 'bg-emerald-400 text-black' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {downloaded && step.num === 1 ? <CheckCircle2 size={14} /> : step.num}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{step.title}</p>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status note */}
        {downloaded && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-300 text-sm leading-relaxed">
              Your profile has been downloaded. Import it into OpenVPN Connect to connect securely.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-60 text-black font-black rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Downloading...</>
              : downloaded
              ? <><CheckCircle2 size={18} /> Download Again</>
              : <><Download size={18} /> Download Config</>
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