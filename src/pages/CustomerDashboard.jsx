import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, Loader2, Check, AlertCircle, Smartphone, Monitor, Wifi, CreditCard, ExternalLink, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UsageCharts from '@/components/dashboard/UsageCharts';

const deviceIcons = {
  windows: Monitor,
  macos: Monitor,
  linux: Monitor,
  ios: Smartphone,
  android: Smartphone,
  router: Wifi,
};

const deviceLabels = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  ios: 'iPhone/iPad',
  android: 'Android',
  router: 'Router',
};

export default function CustomerDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [devices, setDevices] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [user, setUser] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load subscription
        const subs = await base44.entities.VPNSubscription.filter({
          user_email: currentUser.email,
        });
        if (subs.length > 0) {
          setSubscription(subs[0]);

          // Load linked devices
          const devs = await base44.entities.LinkedDevice.filter({
            subscription_id: subs[0].id,
          });
          setDevices(devs);
        }

        // Load available downloads
        const dlList = await base44.entities.Download.filter({ is_active: true });
        setDownloads(dlList);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  const downloadConfig = async (platform, fileUrl) => {
    setDownloading(platform);
    try {
      // If there's a direct file_url from the Download entity, use it
      if (fileUrl) {
        window.open(fileUrl, '_blank');
        return;
      }
      // Otherwise generate a user-specific config on the fly
      const res = await base44.functions.invoke('downloadVpnConfig', { platform });
      // The response is a file blob — trigger browser download
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoxVPN-${platform.charAt(0).toUpperCase() + platform.slice(1)}.ovpn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download config: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', {});
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        alert(res.data?.error || 'Could not open billing portal. Please contact support.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const removeDevice = async (deviceId) => {
    if (!window.confirm('Remove this device from your VPN account?')) return;

    try {
      await base44.entities.LinkedDevice.delete(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
    } catch (error) {
      alert('Failed to remove device: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading your VPN dashboard...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#060910] pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">VPN Dashboard</h1>
            <p className="text-slate-400">Welcome, {user?.full_name}. Get started by choosing a plan below.</p>
          </div>

          {/* No subscription banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={22} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-bold">No Active Subscription</p>
                <p className="text-slate-400 text-sm">Activate a plan to unlock full VPN access across all your devices.</p>
              </div>
            </div>
            <a
              href="/#pricing"
              onClick={() => { window.location.href = '/#pricing'; }}
              className="flex-shrink-0 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all text-sm"
            >
              View Plans →
            </a>
          </motion.div>

          {/* Plan highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-white mb-2">Why get VoxVPN?</h3>
            <p className="text-slate-400 text-sm mb-6">Everything you need to browse securely and privately.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: 'AES-256 Encryption', desc: 'Military-grade encryption on all your traffic.' },
                { icon: '🌍', title: '10+ Global Servers', desc: 'Connect from USA, UK, Germany, Singapore & more.' },
                { icon: '🚀', title: 'Blazing Fast Speeds', desc: 'Optimized servers for ultra-low latency.' },
                { icon: '📵', title: 'No-Logs Policy', desc: 'We never store or sell your browsing data.' },
                { icon: '📱', title: 'Up to 5 Devices', desc: 'Protect your phone, laptop, and tablet simultaneously.' },
                { icon: '🛡️', title: 'Kill Switch', desc: 'Automatically cuts internet if VPN drops.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#0a1020] rounded-xl p-4 border border-white/5">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-white font-bold text-sm mb-1">{f.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-[#0d1120] p-8 text-center"
          >
            <h3 className="text-2xl font-black text-white mb-2">Start protecting yourself today</h3>
            <p className="text-slate-400 text-sm mb-6">Plans start from just $2.99/month. Cancel anytime.</p>
            <a
              href="/#pricing"
              onClick={() => { window.location.href = '/#pricing'; }}
              className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              Get Protected Now
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060910] pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">VPN Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user?.full_name}. Manage your VPN subscription and devices.</p>
          </div>
          <Link to="/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white text-sm font-semibold transition-all self-start sm:self-auto">
            <UserCircle size={16} /> My Profile
          </Link>
        </div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan-500/20 bg-[#0d1120] p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
                Active Subscription
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                {subscription.plan} Plan
              </h2>
              <p className="text-slate-400 text-sm">
                {subscription.billing_cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse" />
                <div className="relative w-20 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Price', value: `$${subscription.price}/${subscription.billing_cycle === 'yearly' ? 'year' : 'month'}` },
              { label: 'Devices', value: `${devices.length}/${subscription.max_devices}` },
              { label: 'Status', value: subscription.status.toUpperCase() },
              {
                label: 'Renews',
                value: subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A',
              },
            ].map((item) => (
              <div key={item.label} className="bg-[#0a1020] rounded-xl p-3">
                <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="text-white font-bold text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Manage Billing */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
            <button
              onClick={openBillingPortal}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {portalLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
              Manage Billing & Invoices
              <ExternalLink size={13} />
            </button>
          </div>
        </motion.div>

        {/* Usage Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8"
        >
          <h3 className="text-xl font-bold text-white mb-1">Usage Overview</h3>
          <p className="text-slate-400 text-sm mb-6">Your bandwidth and connection time for the past 7 days.</p>
          <UsageCharts subscription={subscription} />
        </motion.div>

        {/* Downloads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Download VPN for Your Device
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Download the official VoxVPN client for your device or configuration file.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {downloads.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-2">No downloads available at this time.</p>
            ) : (
              downloads.map((dl) => {
                const platformIcons = {
                  Windows: Monitor,
                  macOS: Monitor,
                  Linux: Monitor,
                  iOS: Smartphone,
                  Android: Smartphone,
                  Router: Wifi,
                };
                const platformColors = {
                  Windows: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
                  macOS: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
                  Linux: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
                  iOS: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
                  Android: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                  Router: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
                };
                const Icon = platformIcons[dl.platform] || Download;
                const colorClass = platformColors[dl.platform] || '';

                return (
                  <motion.button
                    key={dl.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => downloadConfig(dl.platform?.toLowerCase() || 'windows', dl.file_url)}
                    disabled={downloading === dl.id || !dl.file_url}
                    className={`p-4 rounded-xl border hover:opacity-80 transition-all flex items-center gap-3 disabled:opacity-50 ${colorClass}`}
                  >
                    <Icon size={24} />
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">{dl.name}</p>
                      <p className="text-slate-500 text-xs">{dl.version && `v${dl.version}`} {dl.is_free ? '• Free' : `• $${dl.price}`}</p>
                    </div>
                    {downloading === dl.id ? (
                      <Loader2 size={18} className="ml-auto text-cyan-400 animate-spin" />
                    ) : (
                      <Download size={18} className="ml-auto text-slate-500" />
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Windows Setup Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-cyan-500/10 bg-[#0d1120] p-6 md:p-8"
        >
          <h3 className="text-xl font-bold text-white mb-2">Windows Setup Guide</h3>
          <p className="text-slate-400 text-sm mb-6">Follow these 3 steps to get connected on Windows in under 2 minutes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Download VoxVPN',
                desc: 'Download the VoxVPN client for Windows using the button above.',
                action: null,
                href: null,
              },
              {
                step: '2',
                title: 'Install & Launch',
                desc: 'Run the installer and open the VoxVPN app on your Windows device.',
                action: null,
              },
              {
                step: '3',
                title: 'Connect',
                desc: 'Log in with your VoxVPN account, choose a server location, and click Connect.',
                action: null,
              },
            ].map((s) => (
              <div key={s.step} className="bg-[#0a1020] rounded-xl p-4 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-black text-sm mb-3">
                  {s.step}
                </div>
                <p className="text-white font-bold text-sm mb-1">{s.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                {s.action && s.href && (
                  <a href={s.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    {s.action} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Linked Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Linked Devices ({devices.length}/{subscription.max_devices})
          </h3>

          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">
                No devices linked yet. Download a configuration above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {devices.map((device) => {
                  const Icon = deviceIcons[device.device_type] || Smartphone;
                  return (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a1020] hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon size={20} className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {device.device_name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {deviceLabels[device.device_type]} •{' '}
                            {device.last_connected
                              ? new Date(device.last_connected).toLocaleDateString()
                              : 'Never connected'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeDevice(device.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}