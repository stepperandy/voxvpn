import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, Trash2, Smartphone, Monitor, Wifi, User, ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import { motion } from 'framer-motion';

const deviceIcons = { windows: Monitor, macos: Monitor, linux: Monitor, ios: Smartphone, android: Smartphone, router: Wifi };
const deviceLabels = { windows: 'Windows', macos: 'macOS', linux: 'Linux', ios: 'iPhone/iPad', android: 'Android', router: 'Router' };

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setEmail(u.email || '');
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

  const handleSave = async (e) => {
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

  const removeDevice = async (deviceId) => {
    if (!window.confirm('Remove this device from your VPN account?')) return;
    try {
      await base44.entities.LinkedDevice.delete(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
    } catch (err) {
      alert('Failed to remove device: ' + err.message);
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
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors mb-2">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-black text-white mb-1">My Profile</h1>
          <p className="text-slate-400 text-sm">Update your contact information and manage your devices.</p>
        </div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user?.full_name || 'VoxVPN User'}</p>
              <p className="text-slate-500 text-sm">{subscription ? `${subscription.plan} Plan` : 'No active plan'}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={user?.full_name || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-[#0a1020] border border-white/5 text-slate-500 text-sm cursor-not-allowed"
              />
              <p className="text-slate-600 text-xs mt-1">Name is managed by your login provider.</p>
            </div>

            <div>
              <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#0a1020] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={saving || email === user?.email}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Linked Devices */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 bg-[#0d1120] p-6">
          <h2 className="text-white font-bold text-lg mb-1">
            Connected Devices
            {subscription && <span className="text-slate-500 font-normal text-sm ml-2">({devices.length}/{subscription.max_devices})</span>}
          </h2>
          <p className="text-slate-400 text-sm mb-5">Devices currently linked to your VPN subscription.</p>

          {devices.length === 0 ? (
            <div className="text-center py-10">
              <Smartphone size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No devices linked yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const Icon = deviceIcons[device.device_type] || Smartphone;
                return (
                  <div key={device.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a1020]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{device.device_name}</p>
                        <p className="text-slate-500 text-xs">
                          {deviceLabels[device.device_type]} · {device.last_connected ? new Date(device.last_connected).toLocaleDateString() : 'Never connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDevice(device.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Subscription summary */}
        {subscription && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-cyan-500/10 bg-[#0d1120] p-6">
            <h2 className="text-white font-bold text-lg mb-4">Subscription</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Plan', value: subscription.plan },
                { label: 'Status', value: subscription.status.toUpperCase() },
                { label: 'Billing', value: subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly' },
                { label: 'Renews', value: subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString() : 'N/A' },
              ].map(item => (
                <div key={item.label} className="bg-[#0a1020] rounded-xl p-3 border border-white/5">
                  <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a href="/#pricing"
                className="inline-block text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Upgrade or change plan →
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}