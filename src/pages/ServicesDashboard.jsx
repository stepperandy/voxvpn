import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Wifi, RefreshCw, Loader2, AlertCircle, CheckCircle2, Clock, Zap, Calendar, Download } from "lucide-react";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SubscriptionGate from "@/components/SubscriptionGate";
import DownloadButtons from "@/components/DownloadButtons";

export default function ServicesDashboard() {
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [esims, setEsims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    // 10s safety timeout — never hang on iPad
    const timeout = setTimeout(() => { setLoading(false); setRefreshing(false); }, 10000);
    try {
      const u = await base44.auth.me();
      setUser(u);

      const [numbers, sims] = await Promise.all([
        base44.entities.VirtualNumber.filter({ customer_email: u.email }, "-created_date").catch(() => []),
        base44.entities.ESim.filter({ user_email: u.email }, "-created_date").catch(() => [])
      ]);
      setVirtualNumbers(numbers || []);
      setEsims(sims || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  usePullToRefresh(() => {
    setRefreshing(true);
    loadData(true);
  }, containerRef);

  const activeNumbers = virtualNumbers.filter(n => n.status === "active");
  const activeEsims = esims.filter(e => e.status === "active");
  const pendingNumbers = virtualNumbers.filter(n => n.status === "pending");
  const pendingEsims = esims.filter(e => e.status === "pending");

  const getStatusBadge = (status) => {
    if (!status) return null;
    const styles = {
      active: "bg-green-500/20 text-green-300 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
      expired: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    const icons = {
      active: <CheckCircle2 className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <AlertCircle className="w-3 h-3" />,
      expired: <AlertCircle className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <SubscriptionGate feature="your services dashboard">
    <div ref={containerRef} className="min-h-screen overflow-auto bg-gray-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Services</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your virtual numbers and eSIM plans</p>
          </div>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {refreshing && (
          <div className="mb-4 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <p className="text-gray-400 text-xs font-medium">Active Numbers</p>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{activeNumbers.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-purple-400" />
              <p className="text-gray-400 text-xs font-medium">Active eSIMs</p>
            </div>
            <p className="text-3xl font-bold text-purple-400">{activeEsims.length}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <p className="text-gray-400 text-xs font-medium">Pending</p>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{pendingNumbers.length + pendingEsims.length}</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <p className="text-gray-400 text-xs font-medium">Balance</p>
            </div>
            <p className="text-3xl font-bold text-pink-400">${(user?.credits || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Virtual Numbers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Phone className="w-6 h-6 text-cyan-400" />
              Virtual Numbers
            </h2>
            <Link
              to={createPageUrl("VirtualNumbers")}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold text-sm transition-colors"
            >
              Browse More
            </Link>
          </div>

          {virtualNumbers.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No virtual numbers yet</p>
              <Link
                to={createPageUrl("VirtualNumbers")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold transition-colors"
              >
                Get a Number
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {virtualNumbers.map(num => (
                <div
                  key={num.id}
                  className="bg-gradient-to-r from-white/5 to-white/2 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-xl font-bold text-white font-mono">{num.phone_number}</p>
                        {getStatusBadge(num.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {num.country_code && <span>📍 {num.country_code}</span>}
                        {num.sms_enabled && <span className="text-green-400">✓ SMS</span>}
                        {num.voice_enabled && <span className="text-blue-400">✓ Voice</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Monthly Fee</p>
                      <p className="text-lg font-bold text-white">–</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download App Section (OS-Filtered) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Download className="w-6 h-6 text-cyan-400" />
              Download the App
            </h2>
            <Link to="/downloads" className="text-sm text-cyan-400 hover:underline">All platforms</Link>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-cyan-500/20 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-4">Get the VoxDigits app for your device — auto-detected for your current platform.</p>
            <DownloadButtons showAll={false} />
          </div>
        </div>

        {/* eSIMs Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wifi className="w-6 h-6 text-purple-400" />
              eSIM Plans
            </h2>
            <Link
              to={createPageUrl("ESimStore")}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Browse Plans
            </Link>
          </div>

          {esims.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No eSIM plans yet</p>
              <Link
                to={createPageUrl("ESimStore")}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-semibold transition-colors"
              >
                Buy eSIM
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {esims.map(esim => (
                <div
                  key={esim.id}
                  className="bg-gradient-to-r from-white/5 to-white/2 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-bold text-white">{esim.product_name}</p>
                        {getStatusBadge(esim.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {esim.data_gb && <span>📊 {esim.data_gb} GB</span>}
                        {esim.duration_days && <span>📅 {esim.duration_days} days</span>}
                        {esim.created_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(esim.created_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Amount Paid</p>
                      <p className="text-lg font-bold text-white">${(esim.price_paid || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </SubscriptionGate>
  );
}