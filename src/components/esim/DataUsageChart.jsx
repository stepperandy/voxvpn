import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wifi } from 'lucide-react';

export default function DataUsageChart({ esims }) {
  const usageData = esims
    .filter(e => e.status === 'active')
    .map(e => ({
      name: e.product_name?.substring(0, 12) || 'Plan',
      used: e.data_used_gb || 0,
      total: e.data_gb || 0,
      remaining: Math.max(0, (e.data_gb || 0) - (e.data_used_gb || 0))
    }));

  const totalData = usageData.reduce((sum, item) => sum + item.total, 0);
  const totalUsed = usageData.reduce((sum, item) => sum + item.used, 0);
  const usagePercentage = totalData > 0 ? Math.round((totalUsed / totalData) * 100) : 0;

  const pieData = [
    { name: 'Used', value: totalUsed, color: '#06b6d4' },
    { name: 'Remaining', value: Math.max(0, totalData - totalUsed), color: '#0f172a' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Usage Summary */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            Overall Data Usage
          </h3>
          <span className="text-3xl font-bold text-cyan-400">{usagePercentage}%</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total Data</p>
              <p className="text-2xl font-bold text-white">{totalData.toFixed(1)} GB</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Used</p>
              <p className="text-2xl font-bold text-cyan-400">{totalUsed.toFixed(2)} GB</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-green-400">{(totalData - totalUsed).toFixed(2)} GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Plan Breakdown */}
      {usageData.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Usage by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={usageData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="used" fill="#06b6d4" name="Used (GB)" />
              <Bar dataKey="remaining" fill="#0f172a" name="Remaining (GB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}