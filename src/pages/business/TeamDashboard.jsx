import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import BusinessLayout from '@/components/business/BusinessLayout';
import OverviewTab from '@/components/business/tabs/OverviewTab';
import DevicesTab from '@/components/business/tabs/DevicesTab';
import SecurityTab from '@/components/business/tabs/SecurityTab';
import InstallerTab from '@/components/business/tabs/InstallerTab';
import BillingTab from '@/components/business/tabs/BillingTab';
import TeamTableTab from '@/components/business/tabs/TeamTableTab';
import { Loader2, AlertCircle, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeamDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('team');
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
          {activeTab === 'team' && <TeamTableTab data={teamData} onRefresh={loadData} />}
          {activeTab === 'overview' && (
            <>
              {teamData?.client && (!teamData.client.domains || teamData.client.domains.length === 0) && (
                <Link to="/business/setup" className="block mb-6">
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 p-5 flex items-center gap-4 hover:border-cyan-500/40 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Rocket size={22} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Complete your business setup</p>
                      <p className="text-slate-400 text-xs mt-0.5">Register your domains and configure your VPN policy to activate protection.</p>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                </Link>
              )}
              <OverviewTab data={teamData} onNavigate={setActiveTab} />
            </>
          )}
          {activeTab === 'devices' && <DevicesTab data={teamData} />}
          {activeTab === 'security' && <SecurityTab client={teamData?.client} onRefresh={loadData} />}
          {activeTab === 'billing' && <BillingTab data={teamData} />}
          {activeTab === 'installer' && <InstallerTab client={teamData?.client} />}
        </motion.div>
      )}
    </BusinessLayout>
  );
}