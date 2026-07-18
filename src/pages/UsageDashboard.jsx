import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Wifi, Phone, MessageSquare, TrendingUp, RefreshCw, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";

export default function UsageDashboard() {
  const [user, setUser] = useState(null);
  const [esims, setEsims] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const containerRef = useRef(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      const [sims, nums, callLogs, msgs] = await Promise.all([
        base44.entities.ESim.filter({ user_email: u.email }, "-created_date"),
        base44.entities.VirtualNumber.filter({ customer_email: u.email }, "-created_date"),
        base44.entities.CallLog.filter({ user_email: u.email }, "-created_date", 200),
        base44.entities.Message.filter({ our_number: { $exists: true } }, "-created_date", 200),
      ]);

      setEsims(sims || []);
      setNumbers(nums || []);
      setCalls(callLogs || []);
      // filter messages belonging to user's numbers
      const userNums = new Set((nums || []).map(n => n.phone_number));
      setMessages((msgs || []).filter(m => userNums.has(m.our_number)));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-time subscriptions
    const unsubCalls = base44.entities.CallLog.subscribe((event) => {
      setCalls(prev => {
        if (event.type === "create") return [event.data, ...prev];
        if (event.type === "update") return prev.map(c => c.id === event.id ? event.data : c);
        if (event.type === "delete") return prev.filter(c => c.id !== event.id);
        return prev;
      });
      setLastUpdated(new Date());
    });

    const unsubMsgs = base44.entities.Message.subscribe((event) => {
      setMessages(prev => {
        if (event.type === "create") return [event.data, ...prev];
        if (event.type === "update") return prev.map(m => m.id === event.id ? event.data : m);
        if (event.type === "delete") return prev.filter(m => m.id !== event.id);
        return prev;
      });
      setLastUpdated(new Date());
    });

    const unsubEsims = base44.entities.ESim.subscribe((event) => {
      setEsims(prev => {
        if (event.type === "create") return [event.data, ...prev];
        if (event.type === "update") return prev.map(e => e.id === event.id ? event.data : e);
        if (event.type === "delete") return prev.filter(e => e.id !== event.id);
        return prev;
      });
      setLastUpdated(new Date());
    });

    return () => {
      unsubCalls();
      unsubMsgs();
      unsubEsims();
    };
  }, []);

  usePullToRefresh(() => loadData(true), containerRef);

  // --- Derived stats ---
  const totalDataUsed = esims.reduce((sum, e) => sum + (e.data_used_gb || 0), 0);
  const totalDataAvailable = esims.reduce((sum, e) => sum + (e.data_gb || 0), 0);
  const dataPercentage = totalDataAvailable > 0 ? Math.round((totalDataUsed / totalDataAvailable) * 100) : 0;

  const totalCalls = calls.length;
  const totalMessages = messages.length;
  const inboundCalls = calls.filter(c => c.direction === "inbound").length;
  const outboundCalls = calls.filter(c => c.direction === "outbound").length;
  const inboundMsgs = messages.filter(m => m.direction === "inbound").length;
  const outboundMsgs = messages.filter(m => m.direction === "outbound").length;

  // Calls + SMS by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  const activityByDay = last7Days.map((day, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    const dayCalls = calls.filter(c => c.created_date && new Date(c.created_date).toDateString() === dateStr).length;
    const dayMsgs = messages.filter(m => m.created_date && new Date(m.created_date).toDateString() === dateStr).length;
    return { day, calls: dayCalls, sms: dayMsgs };
  });

  // Comm breakdown pie
  const commBreakdown = [
    { category: "Inbound Calls", value: inboundCalls, color: "#06b6d4" },
    { category: "Outbound Calls", value: outboundCalls, color: "#3b82f6" },
    { category: "Inbound SMS", value: inboundMsgs, color: "#8b5cf6" },
    { category: "Outbound SMS", value: outboundMsgs, color: "#ec4899" },
  ].filter(d => d.value > 0);

  // eSIM usage per plan
  const esimUsageData = esims
    .filter(e => e.data_gb)
    .map(e => ({
      name: e.product_name?.split(" ").slice(0, 2).join(" ") || "Plan",
      used: parseFloat((e.data_used_gb || 0).toFixed(2)),
      remaining: parseFloat((e.data_gb - (e.data_used_gb || 0)).toFixed(2)),
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Usage Analytics</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span className="text-green-400 font-medium">Live</span>
              <span>· Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-gray-400 font-medium">Data Used</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400">{totalDataUsed.toFixed(2)} GB</p>
            <p className="text-xs text-gray-500 mt-0.5">of {totalDataAvailable.toFixed(2)} GB</p>
            <div className="mt-2 w-full bg-gray-900/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${dataPercentage >= 80 ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}
                style={{ width: `${dataPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{dataPercentage}% used</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400 font-medium">Total Calls</p>
            </div>
            <p className="text-2xl font-bold text-purple-400">{totalCalls}</p>
            <p className="text-xs text-gray-500 mt-0.5">{inboundCalls} in · {outboundCalls} out</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <p className="text-xs text-gray-400 font-medium">Total SMS</p>
            </div>
            <p className="text-2xl font-bold text-pink-400">{totalMessages}</p>
            <p className="text-xs text-gray-500 mt-0.5">{inboundMsgs} in · {outboundMsgs} out</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-gray-400 font-medium">Active Services</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {esims.filter(e => e.status === "active").length + numbers.filter(n => n.status === "active").length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {esims.filter(e => e.status === "active").length} eSIMs · {numbers.filter(n => n.status === "active").length} numbers
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Calls + SMS by day */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4">Calls & SMS — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="calls" fill="#8b5cf6" name="Calls" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sms" fill="#06b6d4" name="SMS" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* eSIM data usage per plan */}
          {esimUsageData.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">eSIM Data by Plan</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={esimUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} unit=" GB" />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="used" fill="#06b6d4" name="Used" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining" fill="#1f2937" name="Remaining" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Communication breakdown pie */}
          {commBreakdown.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Communication Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={commBreakdown}
                    cx="50%" cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ category, value }) => `${category}: ${value}`}
                    labelLine={false}
                  >
                    {commBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Services Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* eSIMs */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5 text-cyan-400" /> eSIM Plans
            </h3>
            {esims.length === 0 ? (
              <p className="text-gray-500 text-sm">No eSIM plans</p>
            ) : (
              <div className="space-y-3">
                {esims.map(sim => {
                  const pct = sim.data_gb ? Math.min(100, Math.round(((sim.data_used_gb || 0) / sim.data_gb) * 100)) : 0;
                  return (
                    <div key={sim.id} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white text-sm">{sim.product_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sim.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{sim.status}</span>
                      </div>
                      {sim.data_gb ? (
                        <>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{(sim.data_used_gb || 0).toFixed(2)} GB used</span>
                            <span>{sim.data_gb} GB total</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-yellow-500" : "bg-cyan-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{pct}% used</p>
                        </>
                      ) : <p className="text-xs text-gray-500">Usage data unavailable</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Virtual Numbers */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-purple-400" /> Virtual Numbers
            </h3>
            {numbers.length === 0 ? (
              <p className="text-gray-500 text-sm">No virtual numbers</p>
            ) : (
              <div className="space-y-3">
                {numbers.map(num => {
                  const numCalls = calls.filter(c => c.our_number === num.phone_number).length;
                  const numMsgs = messages.filter(m => m.our_number === num.phone_number).length;
                  return (
                    <div key={num.id} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-mono font-semibold text-white text-sm">{num.phone_number}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${num.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}>{num.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span>📞 {numCalls} calls</span>
                        <span>💬 {numMsgs} SMS</span>
                        <span>📍 {num.country_code}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}