import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Loader2, RefreshCw, CheckCircle2, X, ShieldOff } from "lucide-react";

const SEVERITY_COLORS = {
  low: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  high: "bg-red-500/20 text-red-300 border-red-500/30",
};

const TYPE_LABELS = {
  high_call_volume: "High Call Volume",
  high_sms_volume: "High SMS Volume",
  rapid_spending: "Rapid Spending",
  unusual_destinations: "Unusual Destinations",
  multiple_failed_payments: "Failed Payments",
};

export default function AdminFraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("open");

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await base44.asServiceRole.entities.FraudAlert.list("-created_date", 200);
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke("fraudDetection", {});
      alert(`Scan complete. ${res.data?.alerts_created || 0} new alerts created.`);
      await loadAlerts();
    } catch (err) {
      alert("Fraud scan failed");
    } finally {
      setRunning(false);
    }
  };

  const updateStatus = async (alertId, status) => {
    await base44.asServiceRole.entities.FraudAlert.update(alertId, { status });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status } : a));
  };

  const filtered = alerts.filter(a => filter === "all" || a.status === filter);
  const openCount = alerts.filter(a => a.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Fraud Alerts
          {openCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{openCount}</span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {["open", "investigating", "resolved", "false_positive", "all"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === s ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
          <button onClick={runScan} disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition-colors text-sm font-semibold disabled:opacity-60">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Run Scan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-500/30" />
          <p>No {filter !== "all" ? filter : ""} alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <div key={alert.id} className={`rounded-xl border p-4 ${SEVERITY_COLORS[alert.severity]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm">{TYPE_LABELS[alert.alert_type] || alert.alert_type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${SEVERITY_COLORS[alert.severity]}`}>{alert.severity}</span>
                    <span className="text-xs text-gray-500 capitalize">{alert.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{alert.user_email}</p>
                  <p className="text-sm text-gray-300">{alert.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(alert.created_date).toLocaleString()}</p>
                </div>
                {alert.status === "open" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(alert.id, "investigating")}
                      className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-semibold hover:bg-yellow-500/30 transition-colors">
                      Investigate
                    </button>
                    <button onClick={() => updateStatus(alert.id, "false_positive")}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {alert.status === "investigating" && (
                  <button onClick={() => updateStatus(alert.id, "resolved")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}