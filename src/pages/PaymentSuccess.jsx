import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Download, Loader2, Monitor, Apple, Package, Smartphone, Router, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  const devices = [
    { id: 'windows', name: 'Windows', icon: Monitor, description: 'Windows 10/11 Desktop' },
    { id: 'macos', name: 'macOS', icon: Apple, description: 'Mac OS X 10.12+' },
    { id: 'linux', name: 'Linux', icon: Package, description: 'Linux (AppImage)' },
    { id: 'ios', name: 'iOS', icon: Smartphone, description: 'iPhone/iPad' },
    { id: 'android', name: 'Android', icon: Smartphone, description: 'Android 5.0+' },
    { id: 'router', name: 'Router', icon: Router, description: 'OpenWrt/DD-WRT' },
  ];

  useEffect(() => {
    // Redirect to dashboard with success flag so they see the welcome banner
    window.location.href = '/dashboard?payment=success';
  }, []);

  const handleDownload = async (deviceId) => {
    setDownloading(prev => ({ ...prev, [deviceId]: true }));
    try {
      // Generate fresh OpenVPN config
      const res = await base44.functions.invoke('downloadVpnConfig', {
        platform: deviceId,
        proto: 'udp',
      });

      const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      const blob = new Blob([content], { type: 'application/x-openvpn-profile' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VoxVPN-${deviceId}.ovpn`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download ${deviceId}:`, err);
      alert(`Failed to download config for ${deviceId}. Please try from your dashboard.`);
    } finally {
      setDownloading(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Preparing your setup files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0d1120] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12 pt-8">
          <CheckCircle2 size={64} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Payment Successful! 🎉</h1>
          <p className="text-slate-400 text-lg">
            Thank you, {user?.full_name}! Your subscription is now active.
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
          <ol className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">1</span>
              <span>Download VoxVPN for your device(s)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">2</span>
              <span>Install the application</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">3</span>
              <span>Log in with your VoxVPN account</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">4</span>
              <span>Select a server and connect</span>
            </li>
          </ol>
        </div>

        {/* Device Downloads */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Download VoxVPN for Your Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => {
              const Icon = device.icon;
              return (
                <div
                  key={device.id}
                  className="p-6 rounded-lg border border-white/10 bg-white/3 hover:bg-white/5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon size={32} className="text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-lg">{device.name}</h3>
                      <p className="text-slate-500 text-xs">{device.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(device.id)}
                    disabled={downloading[device.id]}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
                  >
                    {downloading[device.id] ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={14} /> Download
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-white/10 bg-white/3">
            <h3 className="font-bold text-lg mb-3">✅ Your Account Details</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Plan:</strong> Premium</p>
              <p><strong>Devices:</strong> 6 simultaneous connections</p>
              <p><strong>Renewal:</strong> Automatic monthly billing</p>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-white/10 bg-white/3">
            <h3 className="font-bold text-lg mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Enable Kill Switch for maximum security</li>
              <li>Use Auto-Select Fastest for best speed</li>
              <li>Enable 2FA in Account Settings</li>
              <li>Check our blog for tutorials</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-center transition-all"
          >
            Go to User Dashboard
          </a>
          <a
            href="/help-center"
            className="px-6 py-3 rounded-lg border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-bold text-center transition-all"
          >
            View Help Center
          </a>
          <a
            href="/contact"
            className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 font-bold text-center transition-all"
          >
            Contact Support
          </a>
        </div>

        {/* Confirmation Email */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>A confirmation email has been sent to <strong>{user?.email}</strong></p>
          <p>Check your inbox for setup instructions and next steps</p>
        </div>
      </div>
    </div>
  );
}