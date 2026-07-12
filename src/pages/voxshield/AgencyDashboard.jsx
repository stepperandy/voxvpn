import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Users, Smartphone, Activity, Plus, UserPlus, Loader2, RefreshCw, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddClientModal from '@/components/voxshield/AddClientModal';
import AssignVpnModal from '@/components/voxshield/AssignVpnModal';
import DevicesTable from '@/components/voxshield/DevicesTable';
import SecurityLogsSection from '@/components/voxshield/SecurityLogsSection';
import SubscriptionSummary from '@/components/voxshield/SubscriptionSummary';

const planColor = {
  basic: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  standard: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  premium: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  enterprise: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};
const statusColor = {
  active: 'text-green-400 bg-green-500/10 border-green-500/20',
  trial: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-4 rounded-2xl bg-[#0d1120] border border-white/5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-slate-500 text-xs">{label}</p>
    </div>
  );
}

export default function AgencyDashboard() {
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [devices, setDevices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAssignVpn, setShowAssignVpn] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [clientData, deviceData, subData] = await Promise.all([
        base44.entities.Client.list('-created_date', 200).catch(() => []),
        base44.entities.LinkedDevice.list('-created_date', 500).catch(() => []),
        base44.entities.VPNSubscription.list('-created_date', 500).catch(() => []),
      ]);
      setClients(clientData);
      setDevices(deviceData);
      setSubscriptions(subData);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeDevices = devices.filter((d) => d.status === 'active').length;
  const totalUsers = subscriptions.filter((s) => s.status === 'active').length;

  const deviceCountFor = (clientId) => devices.filter((d) => d.subscription_id === clientId).length;
  const subCountFor = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return 0;
    return subscriptions.filter((s) => s.notes?.includes(clientId)).length;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl font-black">Agency Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage clients, assign VPN access, and monitor connected devices</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 text-sm transition-all">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAssignVpn(true)} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg text-sm transition-all border border-white/10">
            <UserPlus size={14} /> Assign VPN
          </button>
          <Link to="/shield/onboarding" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-cyan-500/10">
            <Rocket size={14} /> Guided Setup
          </Link>
          <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm transition-all">
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Clients" value={clients.length} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard icon={Users} label="VPN Users" value={totalUsers} color="bg-violet-500/10 text-violet-400" />
        <StatCard icon={Smartphone} label="Total Devices" value={devices.length} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={Activity} label="Active Now" value={activeDevices} color="bg-green-500/10 text-green-400" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-400" /></div>
      ) : (
        <>
          {/* Client cards */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3">Client Accounts</h2>
            {clients.length === 0 ? (
              <div className="p-10 rounded-2xl bg-[#0d1120] border border-white/5 text-center">
                <Building2 size={32} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm mb-4">No clients yet. Add your first client account.</p>
                <button onClick={() => setShowAddClient(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold rounded-lg text-sm">
                  <Plus size={14} /> Add Client
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-[#0d1120] border border-white/5 hover:border-cyan-500/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Building2 size={18} className="text-violet-400" />
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${planColor[c.vpn_plan] || planColor.standard}`}>{c.vpn_plan}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColor[c.status] || statusColor.trial}`}>{c.status}</span>
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{c.name}</h3>
                    {c.contact_email && <p className="text-slate-500 text-xs mb-3">{c.contact_email}</p>}
                    <div className="flex gap-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-slate-600" />
                        <div>
                          <p className="text-white font-bold text-sm">{subCountFor(c.id)}/{c.max_users}</p>
                          <p className="text-slate-600 text-[10px]">Users</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone size={12} className="text-slate-600" />
                        <div>
                          <p className="text-white font-bold text-sm">{deviceCountFor(c.id)}/{c.max_devices}</p>
                          <p className="text-slate-600 text-[10px]">Devices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscription summary */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3">Subscription Overview</h2>
            <SubscriptionSummary subscriptions={subscriptions} clients={clients} />
          </div>

          {/* Security logs & threat reports */}
          <SecurityLogsSection clients={clients} />

          {/* Devices table */}
          <DevicesTable devices={devices} clients={clients} onRefresh={load} />
        </>
      )}

      {showAddClient && (
        <AddClientModal
          agencyId={user?.agency_id || 'unassigned'}
          onClose={() => setShowAddClient(false)}
          onCreated={() => { setShowAddClient(false); load(); }}
        />
      )}
      {showAssignVpn && (
        <AssignVpnModal
          clients={clients}
          onClose={() => setShowAssignVpn(false)}
          onAssigned={() => { setShowAssignVpn(false); load(); }}
        />
      )}
    </div>
  );
}