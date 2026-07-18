import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Bell, Moon, LogOut, ChevronRight,
  Info, FileText, HelpCircle, Zap, Lock, Globe, Wifi
} from 'lucide-react';

function CyberToggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className="flex-shrink-0 relative transition-all duration-300"
      style={{ width: 48, height: 26 }}
    >
      <div className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          background: value ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${value ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: value ? '0 0 12px rgba(0,212,255,0.3)' : 'none',
        }} />
      <div className="absolute top-[3px] w-[20px] h-[20px] rounded-full transition-all duration-300"
        style={{
          left: value ? 'calc(100% - 23px)' : '3px',
          background: value ? '#00d4ff' : '#475569',
          boxShadow: value ? '0 0 8px rgba(0,212,255,0.8)' : 'none',
        }} />
    </button>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange, iconColor = 'text-cyan-400' }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-none">{label}</p>
        {desc && <p className="text-slate-600 text-xs mt-1">{desc}</p>}
      </div>
      <CyberToggle value={value} onChange={onChange} />
    </div>
  );
}

function LinkRow({ icon: Icon, label, color = 'text-slate-400', iconBg = 'rgba(255,255,255,0.05)', onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3.5 text-left transition-all active:opacity-70">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, border: '1px solid rgba(255,255,255,0.07)' }}>
        <Icon size={16} className={color} />
      </div>
      <span className="flex-1 text-sm font-semibold text-white">{label}</span>
      <ChevronRight size={14} className="text-slate-600" />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const email = localStorage.getItem('vpn_email') || 'Not signed in';
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [splitTunnel, setSplitTunnel] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('vpn_token');
    localStorage.removeItem('vpn_email');
    navigate('/app/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bg}>
      {/* BG glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center gap-3 z-10 relative">
        <button onClick={() => navigate('/app/servers')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl leading-none">Settings</h1>
          <p className="text-slate-600 text-xs mt-0.5">Configure your VPN</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8 flex flex-col gap-3 overflow-y-auto z-10 relative">

        {/* Account card */}
        <div className="p-4 rounded-3xl" style={card}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}>
              <Shield size={24} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.8))' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm">VoxVPN Account</p>
              <p className="text-slate-500 text-xs truncate mt-0.5">{email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00d4ff' }} />
                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">Premium Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* VPN Settings */}
        <div className="rounded-3xl" style={card}>
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">VPN Protection</p>
          </div>
          <div className="px-4 pb-3 divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <ToggleRow icon={Lock} label="Kill Switch" desc="Block traffic if VPN drops" value={killSwitch} onChange={setKillSwitch} iconColor="text-cyan-400" />
            <ToggleRow icon={Wifi} label="Auto-Connect" desc="Connect on app launch" value={autoConnect} onChange={setAutoConnect} iconColor="text-violet-400" />
            <ToggleRow icon={Zap} label="Split Tunneling" desc="Route select apps through VPN" value={splitTunnel} onChange={setSplitTunnel} iconColor="text-amber-400" />
          </div>
        </div>

        {/* App Settings */}
        <div className="rounded-3xl" style={card}>
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">App Preferences</p>
          </div>
          <div className="px-4 pb-3 divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <ToggleRow icon={Bell} label="Notifications" desc="Connection alerts" value={notifications} onChange={setNotifications} iconColor="text-emerald-400" />
            <ToggleRow icon={Moon} label="Dark Mode" value={darkMode} onChange={setDarkMode} iconColor="text-indigo-400" />
          </div>
        </div>

        {/* About */}
        <div className="rounded-3xl" style={card}>
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">About</p>
          </div>
          <div className="px-4 pb-3 divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <LinkRow icon={Info} label="Version 2.0.0" onClick={() => {}} />
            <LinkRow icon={Globe} label="Privacy Policy" onClick={() => window.open('/privacy-policy', '_blank')} />
            <LinkRow icon={HelpCircle} label="Support" onClick={() => window.open('/contact', '_blank')} />
            <LinkRow icon={FileText} label="Terms of Service" onClick={() => window.open('/terms-of-service', '_blank')} />
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout}
          className="w-full py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-slate-700 text-xs pb-4">VoxVPN v2.0 · voxdigits.com</p>
      </div>
    </div>
  );
}

const bg = {
  background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #060a14 60%, #030609 100%)',
};

const card = {
  background: 'rgba(13,17,32,0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
};