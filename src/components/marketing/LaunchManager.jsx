import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Rocket, Users, Phone, Wifi, DollarSign, TrendingUp, Mail,
  RefreshCw, Loader2, Send, Eye, MousePointerClick, Target,
} from "lucide-react";

function MetricCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
  };
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function LaunchManager() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [esims, setEsims] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [broadcastEmail, setBroadcastEmail] = useState("");
  const [broadcastSubject, setBroadcastSubject] = useState("🚀 VoxTelefony Launch — Special Offer Inside!");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [allUsers, allNumbers, allEsims, allTxns] = await Promise.all([
        base44.entities.User.list('-created_date', 500),
        base44.entities.VirtualNumber.list('-created_date', 500),
        base44.entities.ESim.list('-created_date', 500),
        base44.entities.Transaction.list('-created_date', 500),
      ]);
      setUsers(allUsers || []);
      setNumbers(allNumbers || []);
      setEsims(allEsims || []);
      setTransactions(allTxns || []);
    } catch (err) {
      console.error("Launch data load failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Filter to launch period (last 30 days)
  const launchStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentUsers = users.filter(u => new Date(u.created_date) >= launchStart);
  const recentNumbers = numbers.filter(n => new Date(n.created_date || n.assigned_at) >= launchStart);
  const recentEsims = esims.filter(e => new Date(e.created_date) >= launchStart);
  const launchRevenue = transactions
    .filter(t => new Date(t.created_date) >= launchStart && (t.type === "credit" || t.category === "number_rental" || t.category === "esim_purchase"))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const conversionRate = users.length > 0
    ? ((recentNumbers.length + recentEsims.length) / users.length * 100).toFixed(1)
    : "0.0";

  const handleBroadcast = async () => {
    if (!broadcastSubject || !broadcastBody) return;
    setSending(true);
    setSendResult(null);
    try {
      const emails = users.map(u => u.email).filter(Boolean);
      let sent = 0;
      let failed = 0;
      for (const email of emails) {
        try {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: broadcastSubject,
            body: broadcastBody,
          });
          sent++;
        } catch (err) {
          failed++;
          console.error(`Failed to send to ${email}:`, err);
        }
      }
      setSendResult({ sent, failed, total: emails.length });
    } catch (err) {
      setSendResult({ error: err.message });
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Launch Campaign Dashboard</h3>
            <p className="text-xs text-gray-500">Last 30 days performance & broadcast tools</p>
          </div>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="New Signups" value={recentUsers.length} sub={`of ${users.length} total`} color="purple" />
        <MetricCard icon={Phone} label="Numbers Sold" value={recentNumbers.length} sub="last 30 days" color="cyan" />
        <MetricCard icon={Wifi} label="eSIMs Sold" value={recentEsims.length} sub="last 30 days" color="orange" />
        <MetricCard icon={DollarSign} label="Launch Revenue" value={`$${launchRevenue.toFixed(2)}`} sub="last 30 days" color="green" />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Conversion Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">signups → purchases</p>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm">Avg Revenue / User</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${users.length > 0 ? (launchRevenue / users.length).toFixed(2) : "0.00"}
          </p>
          <p className="text-xs text-gray-500 mt-1">launch period</p>
        </div>
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-white">{recentNumbers.length + recentEsims.length}</p>
          <p className="text-xs text-gray-500 mt-1">numbers + eSIMs</p>
        </div>
      </div>

      {/* Revenue trend chart */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <h4 className="text-sm font-bold text-white">Launch Revenue (Last 30 Days)</h4>
        </div>
        <RevenueSparkline transactions={transactions.filter(t => new Date(t.created_date) >= launchStart)} />
      </div>

      {/* Email Broadcast */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white">Launch Broadcast Email</h4>
          <span className="text-xs text-gray-500">({users.length} recipients)</span>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={broadcastSubject}
            onChange={(e) => setBroadcastSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <textarea
            value={broadcastBody}
            onChange={(e) => setBroadcastBody(e.target.value)}
            placeholder="Email body — announce your launch offer, new features, or promotions..."
            rows={5}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
          <button
            onClick={handleBroadcast}
            disabled={sending || !broadcastSubject || !broadcastBody}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Sending…" : "Send Broadcast"}
          </button>
          {sendResult && (
            <div className={`text-sm p-3 rounded-lg ${sendResult.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
              {sendResult.error
                ? `Error: ${sendResult.error}`
                : `✓ Sent ${sendResult.sent} of ${sendResult.total} emails${sendResult.failed > 0 ? ` (${sendResult.failed} failed)` : ""}`}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a href="/LaunchCampaign" target="_blank" className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/50 hover:border-orange-500/30 rounded-xl p-4 transition-colors">
          <Rocket className="w-4 h-4 text-orange-400" />
          <span className="text-sm text-white font-medium">View Campaign Page</span>
        </a>
        <a href="/" target="_blank" className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/50 hover:border-cyan-500/30 rounded-xl p-4 transition-colors">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-white font-medium">View Landing Page</span>
        </a>
        <a href="/VirtualNumbers" target="_blank" className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/50 hover:border-purple-500/30 rounded-xl p-4 transition-colors">
          <Phone className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-white font-medium">Number Store</span>
        </a>
        <a href="/ESimStore" target="_blank" className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/50 hover:border-green-500/30 rounded-xl p-4 transition-colors">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white font-medium">eSIM Store</span>
        </a>
      </div>
    </div>
  );
}

function RevenueSparkline({ transactions }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: 0,
      });
    }
    for (const t of transactions) {
      const tDate = new Date(t.created_date);
      for (let i = 0; i < days.length; i++) {
        const dayStart = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        if (tDate >= dayStart && tDate < dayEnd) {
          days[i].value += parseFloat(t.amount) || 0;
          break;
        }
      }
    }
    setChartData(days);
  }, [transactions]);

  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-0.5 h-32">
      {chartData.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
          <div
            className="w-full bg-gradient-to-t from-green-500/40 to-green-400/80 rounded-t-sm transition-all hover:from-green-500/60 hover:to-green-300"
            style={{ height: `${Math.max((d.value / maxVal) * 100, 2)}%` }}
          />
          {d.value > 0 && (
            <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-green-400 text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
              ${d.value.toFixed(2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}