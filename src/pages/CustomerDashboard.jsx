import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, Loader2, Check, AlertCircle, Smartphone, Monitor, Wifi, CreditCard, ExternalLink, UserCircle, Gift, Globe, Zap, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UsageCharts from '@/components/dashboard/UsageCharts';
import RewardsSummary from '@/components/dashboard/RewardsSummary';

const deviceIcons = { windows: Monitor, macos: Monitor, linux: Monitor, ios: Smartphone, android: Smartphone, router: Wifi };
const deviceLabels = { windows: 'Windows', macos: 'macOS', linux: 'Linux', ios: 'iPhone/iPad', android: 'Android', router: 'Router' };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut', delay },
});

export default function CustomerDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [devices, setDevices] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [user, setUser] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin('/dashboard');
          return;
        }

        setUser(currentUser);
        const subs = await base44.entities.VPNSubscription.filter({ user_email: currentUser.email });
        const hasPaidSub = subs.some(s => s.status === 'active');

        if (hasPaidSub) {
          setSubscription(subs.find(s => s.status === 'active'));
          const devs = await base44.entities.LinkedDevice.filter({ subscription_id: subs.find(s => s.status === 'active').id });
          setDevices(devs);
        } else if (currentUser.role === 'admin') {
          // Admins bypass restriction
          setSubscription({ plan: 'Admin', status: 'active', billing_cycle: 'yearly', price: 0, max_devices: 999, renewal_date: null });
        } else {
          // Non-admin without paid subscription - deny access
          setAccessDenied(true);
          setLoading(false);
          return;
        }

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
      if (fileUrl) {
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileUrl.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const res = await base44.functions.invoke('downloadVpnConfig', { platform });
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
      alert('Failed to download: ' + error.message);
    } finally {
      setDownloading(null);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', {});
      if (res.data?.url) window.open(res.data.url, '_blank');
      else alert(res.data?.error || 'Could not open billing portal. Please contact support.');
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 size={32} className="text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#060910] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={64} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Access Restricted</h1>
            <p className="text-slate-400 text-lg">This dashboard is only available to paid subscribers.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <a href="https://voxvpn.net/#pricing"
              className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
              View Pricing Plans
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#060910] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div {...fadeUp()}>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">VPN Dashboard</h1>
            <p className="text-slate-400">Welcome, {user?.full_name}. Get started with a plan below.</p>
          </motion.div>
          <motion.div {...fadeUp(0.08)} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-bold">No Active Subscription</p>
                <p className="text-slate-400 text-sm">Activate a plan to unlock full VPN access.</p>
              </div>
            </div>
            <a href="https://voxvpn.net/#pricing"
              className="flex-shrink-0 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all text-sm">
              View Plans →
            </a>
          </motion.div>
          <motion.div {...fadeUp(0.16)} className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-2">Why VoxVPN?</h3>
            <p className="text-slate-400 text-sm mb-6">Everything you need to browse securely and privately.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🔒', title: 'AES-256 Encryption', desc: 'Military-grade encryption on all traffic.' },
                { icon: '🌍', title: '10+ Global Servers', desc: 'USA, UK, Germany, Singapore & more.' },
                { icon: '🚀', title: 'Blazing Fast Speeds', desc: 'Optimized for ultra-low latency.' },
                { icon: '📵', title: 'No-Logs Policy', desc: 'We never store or sell your data.' },
                { icon: '📱', title: 'Up to 5 Devices', desc: 'Protect phone, laptop, and tablet.' },
                { icon: '🛡️', title: 'Kill Switch', desc: 'Cuts internet if VPN drops.' },
              ].map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-[#0a1020] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <p className="text-white font-bold text-sm mb-1">{f.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.24)} className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-[#0d1120] p-8 text-center">
            <h3 className="text-2xl font-black text-white mb-2">Start protecting yourself today</h3>
            <p className="text-slate-400 text-sm mb-6">Plans from just $2.49/month. Cancel anytime.</p>
            <a href="https://voxvpn.net/#pricing"
              className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20">
              Get Protected Now
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  const platformIcons = { Windows: Monitor, macOS: Monitor, Linux: Monitor, iOS: Smartphone, Android: Smartphone, Router: Wifi };
  const platformColors = {
    Windows: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
    macOS: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
    Linux: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
    iOS: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    Android: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    Router: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
  };

  return (
    <div className="min-h-screen bg-[#060910] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div {...fadeUp()} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">VPN Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, <span className="text-white font-medium">{user?.full_name}</span>. Here's your VPN overview.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/referral"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-sm font-semibold transition-all">
              <Gift size={15} /> Refer & Earn
            </Link>
            <Link to="/profile"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-white text-sm font-semibold transition-all">
              <UserCircle size={15} /> My Profile
            </Link>
          </div>
        </motion.div>

        {/* Subscription Status */}
        <motion.div {...fadeUp(0.06)} className="rounded-2xl border border-cyan-500/20 bg-[#0d1120] p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-medium">Active Subscription</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">{subscription.plan} Plan</h2>
              <p className="text-slate-400 text-sm">{subscription.billing_cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}</p>
            </div>
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-pulse" />
              <div className="relative w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <Check size={26} className="text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Price', value: `$${subscription.price}/${subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}` },
              { label: 'Devices', value: `${devices.length} / ${subscription.max_devices}` },
              { label: 'Status', value: subscription.status.toUpperCase() },
              { label: 'Renews', value: subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A' },
            ].map((item) => (
              <div key={item.label} className="bg-[#0a1020] rounded-xl p-3 border border-white/5">
                <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-white font-bold text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            {/* Upgrade button */}
            <a href="https://voxvpn.net/#pricing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-sm font-bold transition-all shadow-lg shadow-cyan-500/20">
              <Zap size={14} /> Upgrade Plan
            </a>
            <button onClick={openBillingPortal} disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-sm font-semibold transition-all disabled:opacity-50">
              {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              Manage Billing & Invoices <ExternalLink size={12} />
            </button>
          </div>
        </motion.div>



        {/* Usage Charts */}
        <motion.div {...fadeUp(0.12)} className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8">
          <h3 className="text-lg font-bold text-white mb-1">Usage Overview</h3>
          <p className="text-slate-400 text-sm mb-6">Bandwidth and connection time for the past 7 days.</p>
          <UsageCharts subscription={subscription} />
        </motion.div>

        {/* Rewards Summary */}
        <RewardsSummary user={user} />

        {/* Downloads + Setup in 2 columns on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Downloads */}
          <motion.div {...fadeUp(0.18)} className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
            <h3 className="text-lg font-bold text-white mb-1">Download VPN Config</h3>
            <p className="text-slate-400 text-sm mb-5">Get the config file for your device.</p>
            <div className="space-y-3">
              {downloads.length === 0 ? (
                <p className="text-slate-500 text-sm">No downloads available at this time.</p>
              ) : (
                downloads.map((dl) => {
                  const Icon = platformIcons[dl.platform] || Download;
                  const colorClass = platformColors[dl.platform] || 'border-white/10 bg-white/5 text-slate-400';
                  return (
                    <motion.button key={dl.id} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                      onClick={() => downloadConfig(dl.platform?.toLowerCase() || 'windows', dl.file_url)}
                      disabled={downloading === dl.id || !dl.file_url}
                      className={`w-full p-3.5 rounded-xl border hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50 ${colorClass}`}>
                      <Icon size={20} />
                      <div className="text-left flex-1">
                        <p className="text-white font-semibold text-sm">{dl.name}</p>
                        <p className="text-slate-500 text-xs">{dl.version && `v${dl.version} · `}{dl.is_free ? 'Free' : `$${dl.price}`}</p>
                      </div>
                      {downloading === dl.id ? <Loader2 size={16} className="ml-auto animate-spin text-cyan-400" /> : <Download size={16} className="ml-auto text-slate-500" />}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Mobile Setup CTA */}
          <motion.div {...fadeUp(0.22)} className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-[#0d1120] p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1">Mobile Setup Guide</h3>
            <p className="text-slate-400 text-sm mb-5">Step-by-step instructions for iOS & Android.</p>
            <div className="space-y-3 flex-1">
              {['Download the VoxVPN app from the App Store or Play Store', 'Import your VPN config file into the app', 'Select a server and tap Connect'].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
            <Link to="/mobile-setup"
              className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold text-sm transition-all">
              <Smartphone size={15} /> Full Mobile Guide →
            </Link>
          </motion.div>
        </div>

        {/* Linked Devices */}
        <motion.div {...fadeUp(0.26)} className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-white">Linked Devices</h3>
              <p className="text-slate-500 text-sm">{devices.length} of {subscription.max_devices} slots used</p>
            </div>
          </div>
          {devices.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
              <Smartphone size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No devices linked yet. Download a config above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {devices.map((device) => {
                  const Icon = deviceIcons[device.device_type] || Smartphone;
                  return (
                    <motion.div key={device.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} layout
                      className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a1020] hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon size={17} className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{device.device_name}</p>
                          <p className="text-slate-500 text-xs">{deviceLabels[device.device_type]} · {device.last_connected ? new Date(device.last_connected).toLocaleDateString() : 'Never connected'}</p>
                        </div>
                        {/* Status badge */}
                        {device.status === 'active' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-500 text-[11px] font-semibold">
                            <Circle size={8} /> Offline
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeDevice(device.id)}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all">
                        <Trash2 size={15} />
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