import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Zap, DollarSign, MousePointerClick, Eye, Target, Trophy, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLANS = [
  { value: "all", label: "All Plans", color: "#06b6d4" },
  { value: "us", label: "US Virtual Number", color: "#3b82f6" },
  { value: "canada", label: "Canada Virtual Number", color: "#8b5cf6" },
  { value: "uk", label: "UK Virtual Number", color: "#ec4899" },
  { value: "australia", label: "Australia Virtual Number", color: "#f59e0b" },
];

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-300 border-green-500/30",
  paused: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function MarketingDashboard() {
  const [seoCampaigns, setSeoCampaigns] = useState([]);
  const [ppcCampaigns, setPpcCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [seo, ppc] = await Promise.all([
      base44.entities.SEOCampaign.list().catch(() => []),
      base44.entities.PPCCampaign.list().catch(() => []),
    ]);
    setSeoCampaigns(seo || []);
    setPpcCampaigns(ppc || []);
    setLoading(false);
  };

  const filteredSeo = useMemo(() => {
    if (planFilter === "all") return seoCampaigns;
    return seoCampaigns.filter(c => !c.plan || c.plan === "all" || c.plan === planFilter);
  }, [seoCampaigns, planFilter]);

  const filteredPpc = useMemo(() => {
    if (planFilter === "all") return ppcCampaigns;
    return ppcCampaigns.filter(c => !c.plan || c.plan === "all" || c.plan === planFilter);
  }, [ppcCampaigns, planFilter]);

  const stats = useMemo(() => {
    const seoBudget = filteredSeo.reduce((sum, c) => sum + (c.budget || 0), 0);
    const ppcDailyBudget = filteredPpc.reduce((sum, c) => sum + (c.daily_budget || 0), 0);
    const totalImpressions = filteredPpc.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = filteredPpc.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalConversions = filteredPpc.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const avgCtr = filteredPpc.length > 0 ? filteredPpc.reduce((sum, c) => sum + (c.ctr || 0), 0) / filteredPpc.length : 0;
    const avgRoi = filteredPpc.length > 0 ? filteredPpc.reduce((sum, c) => sum + (c.roi || 0), 0) / filteredPpc.length : 0;
    const activeSeo = filteredSeo.filter(c => c.status === "active").length;
    const activePpc = filteredPpc.filter(c => c.status === "active").length;

    return {
      seoBudget,
      ppcMonthlyBudget: ppcDailyBudget * 30,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr,
      avgRoi,
      activeSeo,
      activePpc,
      totalCampaigns: filteredSeo.length + filteredPpc.length,
    };
  }, [filteredSeo, filteredPpc]);

  // Per-plan breakdown data
  const perPlanData = useMemo(() => {
    return PLANS.filter(p => p.value !== "all").map(plan => {
      const seo = seoCampaigns.filter(c => !c.plan || c.plan === "all" || c.plan === plan.value);
      const ppc = ppcCampaigns.filter(c => !c.plan || c.plan === "all" || c.plan === plan.value);
      const seoBudget = seo.reduce((sum, c) => sum + (c.budget || 0), 0);
      const ppcBudget = ppc.reduce((sum, c) => sum + (c.daily_budget || 0), 0) * 30;
      const impressions = ppc.reduce((sum, c) => sum + (c.impressions || 0), 0);
      const clicks = ppc.reduce((sum, c) => sum + (c.clicks || 0), 0);
      const conversions = ppc.reduce((sum, c) => sum + (c.conversions || 0), 0);
      const ctr = ppc.length > 0 ? ppc.reduce((sum, c) => sum + (c.ctr || 0), 0) / ppc.length : 0;
      const roi = ppc.length > 0 ? ppc.reduce((sum, c) => sum + (c.roi || 0), 0) / ppc.length : 0;
      return {
        name: plan.label.split(" ")[0],
        plan: plan.label,
        color: plan.color,
        seoBudget,
        ppcBudget,
        totalBudget: seoBudget + ppcBudget,
        impressions,
        clicks,
        conversions,
        ctr: parseFloat(ctr.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        seoCount: seo.length,
        ppcCount: ppc.length,
      };
    });
  }, [seoCampaigns, ppcCampaigns]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const all = [...filteredSeo, ...filteredPpc];
    const active = all.filter(c => c.status === "active").length;
    const paused = all.filter(c => c.status === "paused").length;
    const completed = all.filter(c => c.status === "completed").length;
    return [
      { name: "Active", value: active, color: "#22c55e" },
      { name: "Paused", value: paused, color: "#f59e0b" },
      { name: "Completed", value: completed, color: "#3b82f6" },
    ].filter(d => d.value > 0);
  }, [filteredSeo, filteredPpc]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" /> Marketing Performance
        </h2>
        <div className="w-full sm:w-64">
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {PLANS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={DollarSign} label="Total Budget" value={`$${stats.seoBudget + stats.ppcMonthlyBudget.toFixed(0)}`} sub={`SEO $${stats.seoBudget.toFixed(0)} + PPC $${stats.ppcMonthlyBudget.toFixed(0)}/mo`} color="cyan" />
        <SummaryCard icon={Eye} label="Impressions" value={stats.totalImpressions.toLocaleString()} sub={`${stats.activePpc} active PPC campaigns`} color="blue" />
        <SummaryCard icon={MousePointerClick} label="Clicks" value={stats.totalClicks.toLocaleString()} sub={`Avg CTR: ${stats.avgCtr.toFixed(2)}%`} color="purple" />
        <SummaryCard icon={Target} label="Conversions" value={stats.totalConversions.toLocaleString()} sub={`Avg ROI: ${stats.avgRoi.toFixed(1)}%`} color="amber" />
      </div>

      {/* Per-Plan Budget Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" /> Budget by Plan (Monthly USD)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={perPlanData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="seoBudget" name="SEO Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ppcBudget" name="PPC Budget" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column: PPC metrics + Status pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> PPC Performance by Plan
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perPlanData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="impressions" name="Impressions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" name="Clicks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" name="Conversions" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" /> Campaign Status
          </h3>
          {statusData.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-12">No campaigns</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-Plan ROI & CTR table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Plan Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-slate-700">
                <th className="pb-2 pr-4">Plan</th>
                <th className="pb-2 pr-4 text-right">SEO</th>
                <th className="pb-2 pr-4 text-right">PPC</th>
                <th className="pb-2 pr-4 text-right">Budget/mo</th>
                <th className="pb-2 pr-4 text-right">Impressions</th>
                <th className="pb-2 pr-4 text-right">Clicks</th>
                <th className="pb-2 pr-4 text-right">Conv.</th>
                <th className="pb-2 pr-4 text-right">CTR</th>
                <th className="pb-2 text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {perPlanData.map(row => (
                <tr key={row.name} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-2 pr-4">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-white font-medium">{row.plan}</span>
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-300">{row.seoCount}</td>
                  <td className="py-2 pr-4 text-right text-gray-300">{row.ppcCount}</td>
                  <td className="py-2 pr-4 text-right text-cyan-300 font-medium">${row.totalBudget.toFixed(0)}</td>
                  <td className="py-2 pr-4 text-right text-gray-300">{row.impressions.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right text-gray-300">{row.clicks.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right text-green-300">{row.conversions}</td>
                  <td className="py-2 pr-4 text-right text-purple-300">{row.ctr}%</td>
                  <td className="py-2 text-right text-amber-300 font-medium">{row.roi}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}