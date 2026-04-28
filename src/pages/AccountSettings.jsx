import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2, Save, Trash2, Smartphone, Monitor, Wifi, User,
  ArrowLeft, Check, CreditCard, ExternalLink, Shield, Bell,
  AlertCircle, Settings
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const deviceIcons = { windows: Monitor, macos: Monitor, linux: Monitor, ios: Smartphone, android: Smartphone, router: Wifi };
const deviceLabels = { windows: 'Windows', macos: 'macOS', linux: 'Linux', ios: 'iPhone/iPad', android: 'Android', router: 'Router' };

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'subscription', label: 'Subscription', icon: Shield },
  { id: 'devices', label: 'Devices', icon: Smartphone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function AccountSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifRenewal, setNotifRenewal] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setEmail(u.email || '');
        setNotifEmail(u.notif_email !== false);
        setNotifRenewal(u.notif_renewal !== false);
        const subs = await base44.entities.VPNSubscription.filter({ user_email: u.email });
        if (subs.length > 0) {
          setSubscription(subs[0]);
          const devs = await base44.entities.LinkedDevice.filter({ subscription_id: subs[0].id });
          setDevices(devs);
        }
      } catch {
        navigate('/vpn-login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ notif_email: notifEmail, notif_renewal: notifRenewal });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeDevice = async (deviceId) => {
    if (!window.confirm('Remove this device?')) return;
    await base44.entities.LinkedDevice.delete(deviceId);
    setDevices(devices.filter(d => d.id !== deviceId));
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await base44.functions.invoke('createStripePortal', {});
      if (res.data?.url) window.open(res.data.url, '_blank');
      else alert(res.data?.error || 'Could not open billing portal.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c18] flex items-center justify-center">
        <Loader2 size={32} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c18]">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors mb-4">
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Settings size={18} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Account Settings</h1>
              <p className="text-slate-400 text-sm">Manage your profile, subscription, and preferences.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <nav className="flex sm:flex-col gap-1 sm:w-48 flex-shrink-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 space-y-5">
                <h2 className="text-white font-bold text-lg">Profile Information</h2>

                <div className="flex items-center gap-4 pb-5 border-b border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{user?.full_name || 'VoxVPN User'}</p>
                    <p className="text-slate-500 text-sm">{subscription ? `${subscription.plan} Plan` : 'No active plan'}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" value={user?.full_name || ''} disabled
                      className="w-full px-4 py-3 rounded-xl bg-[#0a1020] border border-white/5 text-slate-500 text-sm cursor-not-allowed" />
                    <p className="text-slate-600 text-xs mt-1">Managed by your login provider.</p>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Contact Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl bg-[#0a1020] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  </div>
                  <button type="submit" disabled={saving || email === user?.email}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {!subscription ? (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-bold">No Active Subscription</p>
                        <p className="text-slate-400 text-sm">Subscribe to unlock VPN access.</p>
                      </div>
                    </div>
                    <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                      className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-xl text-sm transition-all">
                      View Plans →
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-cyan-500/20 bg-[#0d1120] p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Current Plan</p>
                        <h2 className="text-2xl font-black text-white">{subscription.plan}</h2>
                        <p className="text-slate-400 text-sm">{subscription.billing_cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'} · ${subscription.price}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        subscription.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>{subscription.status.toUpperCase()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Devices', value: `${devices.length} / ${subscription.max_devices}` },
                        { label: 'Renews', value: subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A' },
                        { label: 'Billing', value: subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly' },
                        { label: 'Price', value: `$${subscription.price}` },
                      ].map(item => (
                        <div key={item.label} className="bg-[#0a1020] rounded-xl p-3 border border-white/5">
                          <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-white font-bold text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                      <button onClick={openBillingPortal} disabled={portalLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-sm font-semibold transition-all disabled:opacity-50">
                        {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                        Manage Billing <ExternalLink size={12} />
                      </button>
                      <a href="/#pricing" onClick={(e) => { e.preventDefault(); window.location.assign('/#pricing'); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 text-sm font-semibold transition-all">
                        Upgrade Plan →
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Devices Tab */}
            {activeTab === 'devices' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-white font-bold text-lg">Connected Devices</h2>
                    {subscription && <p className="text-slate-500 text-sm">{devices.length} of {subscription.max_devices} slots used</p>}
                  </div>
                  <Link to="/download"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/15 transition-all">
                    + Add Device
                  </Link>
                </div>

                {devices.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-xl">
                    <Smartphone size={28} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No devices linked yet.</p>
                    <Link to="/download" className="text-cyan-400 text-xs hover:underline mt-1 inline-block">Download a config to get started →</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {devices.map((device) => {
                      const Icon = deviceIcons[device.device_type] || Smartphone;
                      return (
                        <div key={device.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a1020] group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                              <Icon size={17} className="text-cyan-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">{device.device_name}</p>
                              <p className="text-slate-500 text-xs">{deviceLabels[device.device_type]} · {device.last_connected ? new Date(device.last_connected).toLocaleDateString() : 'Never connected'}</p>
                            </div>
                          </div>
                          <button onClick={() => removeDevice(device.id)}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-[#0d1120] p-6 space-y-5">
                <h2 className="text-white font-bold text-lg">Notification Preferences</h2>

                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive subscription confirmations and updates via email.', value: notifEmail, set: setNotifEmail },
                    { key: 'renewal', label: 'Renewal Reminders', desc: 'Get reminded 3 days before your subscription renews.', value: notifRenewal, set: setNotifRenewal },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-white/5 bg-[#0a1020]">
                      <div>
                        <p className="text-white font-semibold text-sm">{item.label}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <button onClick={() => item.set(!item.value)}
                        className={`relative w-10 h-6 rounded-full transition-all flex-shrink-0 mt-0.5 ${item.value ? 'bg-cyan-400' : 'bg-white/10'}`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.value ? 'left-5' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveNotifications} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold rounded-xl text-sm transition-all">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
                  {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </motion.div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}