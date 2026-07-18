import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wifi, Phone, RefreshCw, AlertCircle, TrendingDown, Calendar, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Usage() {
  const [eSims, setESims] = useState([]);
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      const [esims, vnums] = await Promise.all([
        base44.entities.ESim.filter({ user_email: u?.email }, "-created_date", 100).catch(() => []),
        base44.entities.VirtualNumber.filter({ customer_email: u?.email }, "-created_date", 100).catch(() => [])
      ]);

      setESims(esims || []);
      setVirtualNumbers(vnums || []);
    } catch (err) {
      console.error("Failed to load usage data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDataPercentage = (esim) => {
    if (!esim.data_gb || !esim.data_used) return 100;
    return Math.min(100, Math.round((esim.data_used / esim.data_gb) * 100));
  };

  const getDaysRemaining = (expirationDate) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (daysRemaining) => daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = (daysRemaining) => daysRemaining !== null && daysRemaining <= 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1420] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const activeESims = eSims.filter(e => e.status === "active");
  const activeNumbers = virtualNumbers.filter(v => v.status === "active");
  const totalDataUsed = eSims.reduce((sum, e) => sum + (e.data_used || 0), 0);
  const totalDataPurchased = eSims.reduce((sum, e) => sum + (e.data_gb || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a1420] text-white px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Usage Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor your active eSIMs and virtual numbers</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors min-h-[2.75rem] min-w-[2.75rem] flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-400 font-medium text-sm">Active eSIMs</span>
              <Wifi className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{activeESims.length}</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-400 font-medium text-sm">Active Numbers</span>
              <Phone className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{activeNumbers.length}</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-400 font-medium text-sm">Data Used</span>
              <TrendingDown className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalDataUsed.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">of {totalDataPurchased.toFixed(1)} GB</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-orange-400 font-medium text-sm">Action Items</span>
              <AlertCircle className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {eSims.filter(e => isExpiringSoon(getDaysRemaining(e.created_date))).length +
                virtualNumbers.filter(v => isExpiringSoon(getDaysRemaining(v.created_date))).length}
            </p>
          </div>
        </div>

        {/* eSIMs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">eSIM Plans</h2>
            <Link
              to={createPageUrl("ESimStore")}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Buy eSIM
            </Link>
          </div>

          {activeESims.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <Wifi className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 font-medium">No active eSIM plans</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Purchase an eSIM to get started</p>
              <Link
                to={createPageUrl("ESimStore")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold transition-colors"
              >
                <Zap className="w-4 h-4" />
                Browse Plans
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeESims.map(esim => {
                const dataPercentage = getDataPercentage(esim);
                const daysRemaining = getDaysRemaining(esim.created_date);
                const expiring = isExpiringSoon(daysRemaining);
                const expired = isExpired(daysRemaining);

                return (
                  <div
                    key={esim.id}
                    className={`p-5 border rounded-xl transition-colors ${
                      expired
                        ? "bg-red-500/5 border-red-500/20"
                        : expiring
                        ? "bg-orange-500/5 border-orange-500/20"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white">{esim.product_name}</h3>
                        <p className="text-xs text-gray-500 mt-1">ICCID: {esim.iccid.slice(-6)}</p>
                      </div>
                      {expired && <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg">Expired</span>}
                      {expiring && (
                        <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-lg">
                          {daysRemaining}d left
                        </span>
                      )}
                    </div>

                    {/* Data Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Data Usage</span>
                        <span className="text-xs font-bold text-white">{dataPercentage}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            dataPercentage > 80 ? "bg-red-500" : dataPercentage > 50 ? "bg-orange-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(dataPercentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {(esim.data_used || 0).toFixed(1)} / {esim.data_gb} GB
                      </p>
                    </div>

                    {/* Validity */}
                    <div className="p-3 bg-white/5 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-400">Valid for</p>
                          <p className="font-bold text-white">{esim.duration_days || "N/A"} days</p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={createPageUrl("ESimActivationGuide")}
                      className="w-full px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-sm font-medium rounded-lg transition-colors text-center"
                    >
                      View Setup Guide
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Virtual Numbers Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Virtual Numbers</h2>
            <Link
              to={createPageUrl("VirtualNumbers")}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Buy Number
            </Link>
          </div>

          {activeNumbers.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
              <Phone className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 font-medium">No active virtual numbers</p>
              <p className="text-sm text-gray-500 mt-1 mb-4">Get a phone number to make calls and send SMS</p>
              <Link
                to={createPageUrl("VirtualNumbers")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                Browse Numbers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeNumbers.map(num => {
                const daysRemaining = getDaysRemaining(num.updated_date);
                const expiring = isExpiringSoon(daysRemaining);
                const expired = isExpired(daysRemaining);

                return (
                  <div
                    key={num.id}
                    className={`p-5 border rounded-xl transition-colors ${
                      expired
                        ? "bg-red-500/5 border-red-500/20"
                        : expiring
                        ? "bg-orange-500/5 border-orange-500/20"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg font-mono">{num.phone_number}</h3>
                        <p className="text-xs text-gray-500 mt-1">{num.country_code}</p>
                      </div>
                      {expired && <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg">Expired</span>}
                      {expiring && (
                        <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 text-xs font-bold rounded-lg">
                          {daysRemaining}d left
                        </span>
                      )}
                    </div>

                    {/* Capabilities */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {num.sms_enabled && (
                        <span className="px-3 py-1.5 bg-green-500/20 text-green-300 text-xs font-bold rounded-lg">SMS</span>
                      )}
                      {num.voice_enabled && (
                        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg">Voice</span>
                      )}
                      {num.forwarding_enabled && (
                        <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg">
                          Forwarding
                        </span>
                      )}
                    </div>

                    {/* Subscription Info */}
                    <div className="p-3 bg-white/5 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-400">Monthly Fee</p>
                          <p className="font-bold text-white">${(num.stripe_subscription_id ? 9.99 : 0).toFixed(2)}/mo</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={createPageUrl("CallForwarding")}
                        className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition-colors text-center"
                      >
                        Configure
                      </Link>
                      <Link
                        to={createPageUrl("Dashboard")}
                        className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium rounded-lg transition-colors text-center"
                      >
                        View Stats
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}