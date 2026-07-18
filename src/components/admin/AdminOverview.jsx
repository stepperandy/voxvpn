import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, DollarSign, AlertTriangle, Users, RefreshCw, Loader2, Ban, Trash2, CheckCircle, XCircle, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "cyan" }) {
  const colors = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
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

export default function AdminOverview() {
  const [numbers, setNumbers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [nums, txns, alerts, allUsers] = await Promise.all([
        base44.entities.VirtualNumber.list('-created_date', 200),
        base44.entities.Transaction.list('-created_date', 500),
        base44.entities.FraudAlert.filter({ status: 'open' }),
        base44.entities.User.list(),
      ]);
      setNumbers(nums || []);
      setTransactions(txns || []);
      setFraudAlerts(alerts || []);
      setUsers(allUsers || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const activeNumbers = numbers.filter(n => n.status === 'assigned' || n.status === 'active');
  const totalRevenue = transactions
    .filter(t => t.type === 'credit' || t.category === 'number_rental' || t.category === 'renewal')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const openAlerts = fraudAlerts.filter(a => a.status === 'open');

  const suspendUser = async (email) => {
    if (!confirm(`Suspend account for ${email}?`)) return;
    setActionLoading(`suspend-${email}`);
    try {
      const user = users.find(u => u.email === email);
      if (user) await base44.entities.User.update(user.id, { role: 'suspended' });
      await load();
    } catch (err) { alert(err.message); }
    setActionLoading(null);
  };

  const releaseNumber = async (num) => {
    if (!confirm(`Release number ${num.phone_number}?`)) return;
    setActionLoading(`release-${num.id}`);
    try {
      await base44.entities.VirtualNumber.update(num.id, {
        status: 'released',
        released_at: new Date().toISOString(),
        customer_email: null,
      });
      await load();
    } catch (err) { alert(err.message); }
    setActionLoading(null);
  };

  const dismissAlert = async (alert) => {
    setActionLoading(`alert-${alert.id}`);
    try {
      await base44.entities.FraudAlert.update(alert.id, { status: 'resolved' });
      setFraudAlerts(prev => prev.filter(a => a.id !== alert.id));
    } catch (err) { alert(err.message); }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  const severityColor = { high: "text-red-400 bg-red-500/10 border-red-500/30", medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", low: "text-blue-400 bg-blue-500/10 border-blue-500/30" };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white">Platform Overview</h2>
        <button onClick={load} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Phone} label="Active Numbers" value={activeNumbers.length} sub={`${numbers.length} total`} color="cyan" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="all time transactions" color="green" />
        <StatCard icon={AlertTriangle} label="Open Fraud Alerts" value={openAlerts.length} sub="require review" color="red" />
        <StatCard icon={Users} label="Total Users" value={users.length} sub="registered accounts" color="purple" />
      </div>

      {/* Active Virtual Numbers */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-cyan-400" /> Active Virtual Numbers
          <span className="text-xs text-gray-500 font-normal ml-1">({activeNumbers.length})</span>
        </h3>
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Number</th>
                  <th className="text-left px-4 py-3">Owner</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Renewal</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeNumbers.slice(0, 20).map(num => (
                  <tr key={num.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-white">{num.phone_number}</td>
                    <td className="px-4 py-3 text-gray-300 truncate max-w-[140px]">{num.customer_email || "—"}</td>
                    <td className="px-4 py-3 text-gray-400">{num.country_code}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {num.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{num.renewal_date || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {num.customer_email && (
                          <button
                            onClick={() => suspendUser(num.customer_email)}
                            disabled={!!actionLoading}
                            title="Suspend account"
                            className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 transition-colors disabled:opacity-40"
                          >
                            {actionLoading === `suspend-${num.customer_email}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => releaseNumber(num)}
                          disabled={!!actionLoading}
                          title="Release number"
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-40"
                        >
                          {actionLoading === `release-${num.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeNumbers.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No active numbers</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fraud Alerts */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Open Fraud Alerts
          <span className="text-xs text-gray-500 font-normal ml-1">({openAlerts.length})</span>
        </h3>
        {openAlerts.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-8 text-center text-gray-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/40" />
            No open fraud alerts
          </div>
        ) : (
          <div className="space-y-3">
            {openAlerts.map(alert => (
              <div key={alert.id} className={`flex items-start justify-between p-4 rounded-xl border ${severityColor[alert.severity] || severityColor.low}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wide">{alert.severity}</span>
                    <span className="text-xs opacity-60">·</span>
                    <span className="text-xs opacity-80">{alert.alert_type?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-sm font-medium">{alert.user_email}</div>
                  <div className="text-xs opacity-70 mt-0.5">{alert.description}</div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => suspendUser(alert.user_email)}
                    disabled={!!actionLoading}
                    title="Suspend user"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {actionLoading === `suspend-${alert.user_email}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                    Suspend
                  </button>
                  <button
                    onClick={() => dismissAlert(alert)}
                    disabled={!!actionLoading}
                    title="Mark resolved"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {actionLoading === `alert-${alert.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Revenue */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" /> Recent Transactions
        </h3>
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 15).map(txn => (
                  <tr key={txn.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3 text-gray-300 truncate max-w-[160px]">{txn.user_email}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{txn.category?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${txn.type === 'credit' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white">${parseFloat(txn.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{txn.created_date ? new Date(txn.created_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}