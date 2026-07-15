import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import BusinessLayout from '@/components/business/BusinessLayout';
import OverviewTab from '@/components/business/tabs/OverviewTab';
import MembersTab from '@/components/business/tabs/MembersTab';
import DevicesTab from '@/components/business/tabs/DevicesTab';
import SecurityTab from '@/components/business/tabs/SecurityTab';
import InstallerTab from '@/components/business/tabs/InstallerTab';
import { Loader2, AlertCircle } from 'lucide-react';

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getTeamData', {});
      if (res.data?.error) throw new Error(res.data.error);
      setTeamData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <BusinessLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-sm">Loading team data...</span>
        </div>
      ) : error ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center max-w-md mx-auto mt-12">
          <AlertCircle size={36} className="text-rose-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-sm mb-1">Couldn't load dashboard</h3>
          <p className="text-slate-400 text-xs mb-4">{error}</p>
          <button onClick={loadData} className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold">
            Retry
          </button>
        </motion.div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'overview' && <OverviewTab data={teamData} onNavigate={setActiveTab} />}
          {activeTab === 'members' && <MembersTab data={teamData} onRefresh={loadData} />}
          {activeTab === 'devices' && <DevicesTab data={teamData} />}
          {activeTab === 'security' && <SecurityTab client={teamData?.client} onRefresh={loadData} />}
          {activeTab === 'installer' && <InstallerTab client={teamData?.client} />}
        </motion.div>
      )}
    </BusinessLayout>
  );
}