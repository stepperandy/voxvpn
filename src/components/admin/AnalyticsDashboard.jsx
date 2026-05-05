import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await base44.functions.invoke('getAdminStats', {});
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="text-slate-500">Loading analytics...</div>;
  }

  // Mock data for charts
  const dailyData = [
    { day: 'Mon', users: 120, revenue: 1200 },
    { day: 'Tue', users: 150, revenue: 1500 },
    { day: 'Wed', users: 180, revenue: 1800 },
    { day: 'Thu', users: 220, revenue: 2200 },
    { day: 'Fri', users: 250, revenue: 2500 },
    { day: 'Sat', users: 200, revenue: 2000 },
    { day: 'Sun', users: 170, revenue: 1700 },
  ];

  const metrics = [
    { label: 'Total Users', value: data.overview?.total_users, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Subs', value: data.overview?.active_subscriptions, icon: Zap, color: 'bg-green-500' },
    { label: 'Revenue', value: `$${data.overview?.monthly_revenue}`, icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Connections', value: data.overview?.total_connections, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 rounded-lg border border-white/10 bg-white/3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{m.label}</p>
                  <p className="text-white font-bold text-2xl mt-1">{m.value}</p>
                </div>
                <Icon size={24} className="text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-4">Daily Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="users" stroke="#06b6d4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-lg border border-white/10 bg-white/3">
          <h3 className="text-white font-bold mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="revenue" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}