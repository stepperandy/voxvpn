import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ShoppingBag, Zap, BarChart3, Wifi, Calendar, Download, Copy, CheckCircle2, AlertCircle, Filter, Smartphone, Globe, Clock, TrendingUp, QrCode, RefreshCw } from "lucide-react";
import QRCodeModal from "@/components/esim/QRCodeModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";
import ESIMDashboardCard from "@/components/esim/ESIMDashboardCard";
import BuyCreditsCard from "@/components/esim/BuyCreditsCard";
import DataUsageChart from "@/components/esim/DataUsageChart";
import PlanStatusCard from "@/components/esim/PlanStatusCard";

export default function MyESims() {
  const [esims, setEsims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [selectedESim, setSelectedESim] = useState(null);
  const [installESim, setInstallESim] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paypal = urlParams.get('paypal');
    const token = urlParams.get('token');
    const stripeStatus = urlParams.get('status');
    const sessionId = urlParams.get('session_id');

    if (paypal === 'success' && token) {
      handlePayPalCapture(token);
    } else if (paypal === 'cancel') {
      setPaypalStatus('cancelled');
    } else if (stripeStatus === 'success' && sessionId) {
      setPaypalStatus('success'); // reuse banner for stripe success
      window.history.replaceState({}, '', window.location.pathname);
    }

    loadESims();
  }, []);

  const handlePayPalCapture = async (orderId) => {
    setPaypalStatus('processing');
    try {
      const res = await base44.functions.invoke('paypalCapture', { order_id: orderId });
      if (res.data?.success) {
        setPaypalStatus('success');
        // Reload eSIMs after a short delay to show newly provisioned item
        setTimeout(() => loadESims(), 2000);
      } else {
        setPaypalStatus('error');
      }
    } catch (err) {
      console.error('PayPal capture error:', err);
      setPaypalStatus('error');
    }
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  };

  usePullToRefresh(() => {
    setRefreshing(true);
    loadESims(true);
  }, containerRef);

  const loadESims = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.ESim.filter(
        { user_email: u.email },
        "-created_date",
        50
      );
      setEsims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleAutoTopup = async (esim, e) => {
    e.stopPropagation();
    const newValue = !esim.auto_topup;
    // Optimistic update
    setEsims(prev => prev.map(es => es.id === esim.id ? { ...es, auto_topup: newValue } : es));
    try {
      await base44.entities.ESim.update(esim.id, { auto_topup: newValue, auto_topup_triggered: false });
    } catch (err) {
      // Revert on error
      setEsims(prev => prev.map(es => es.id === esim.id ? { ...es, auto_topup: !newValue } : es));
      console.error('Failed to toggle auto-topup', err);
    }
  };

  const filteredEsims = esims.filter(e => {
    if (filter === 'active') return e.status === 'active';
    if (filter === 'expired') return e.status === 'expired';
    if (filter === 'pending') return e.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (refreshing) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <>
    <div ref={containerRef} className="min-h-screen overflow-auto" style={{background: "linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #16213e 100%)"}}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* PayPal status banners */}
        {paypalStatus === 'processing' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300">
            <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
            <p className="font-medium">Confirming your PayPal payment and provisioning your order…</p>
          </div>
        )}
        {paypalStatus === 'success' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">Payment confirmed! Your order has been provisioned and details sent to your email.</p>
          </div>
        )}
        {paypalStatus === 'error' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">There was an issue confirming your PayPal payment. Please contact support.</p>
          </div>
        )}
        {paypalStatus === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">PayPal payment was cancelled. No charge was made.</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-4 mx-auto">
            <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6h18v12H3z" opacity="0.3"/>
              <rect x="4" y="7" width="4" height="4" fill="currentColor"/>
              <rect x="10" y="7" width="4" height="4" fill="currentColor"/>
              <rect x="16" y="7" width="2" height="4" fill="currentColor"/>
              <path d="M6 13h12v3H6z" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">My eSIMs</h1>
          <p className="text-gray-400 text-lg">Seamless global connectivity at your fingertips</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="relative group bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Wifi className="w-6 h-6 text-cyan-400 mb-3 relative z-10" />
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 relative z-10">Active Plans</p>
            <p className="text-4xl font-bold text-cyan-400 relative z-10">{esims.filter(e => e.status === 'active').length}</p>
          </div>
          <div className="relative group bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <AlertCircle className="w-6 h-6 text-yellow-400 mb-3 relative z-10" />
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 relative z-10">Pending</p>
            <p className="text-4xl font-bold text-yellow-400 relative z-10">{esims.filter(e => e.status === 'pending').length}</p>
          </div>
          <div className="relative group bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <BarChart3 className="w-6 h-6 text-purple-400 mb-3 relative z-10" />
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 relative z-10">Total Data</p>
            <p className="text-4xl font-bold text-purple-400 relative z-10">{esims.reduce((sum, e) => sum + (e.data_gb || 0), 0)} GB</p>
          </div>
          <div className="relative group bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-2xl p-6 hover:border-pink-500/40 transition-all">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Zap className="w-6 h-6 text-pink-400 mb-3 relative z-10" />
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 relative z-10">Balance</p>
            <p className="text-4xl font-bold text-pink-400 relative z-10">${user?.credits?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Buy Credits - Sidebar on desktop, full width on mobile */}
          <div className="lg:col-span-1">
            <BuyCreditsCard />
          </div>

          {/* Stats Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Account Balance</p>
                <p className="text-3xl font-bold text-cyan-400">${user?.credits?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Plans</p>
                <p className="text-3xl font-bold text-white">{esims.filter(e => e.status === 'active').length}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-cyan-500/20">
              <Link
                to="/ESimStore"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Browse eSIM Plans
              </Link>
            </div>
          </div>
        </div>

        {/* Data Usage Visualization */}
        {esims.length > 0 && (
          <div className="mb-8">
            <DataUsageChart esims={esims} />
          </div>
        )}

        {/* Filter Bar */}
        {esims.length > 0 && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-500 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Active ({esims.filter(e => e.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Pending ({esims.filter(e => e.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-red-500 text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Expired ({esims.filter(e => e.status === 'expired').length})
            </button>
          </div>
        )}

        {/* eSIMs List */}
        {filteredEsims.length === 0 && esims.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Wifi className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-3xl font-semibold text-white mb-2">No eSIM plans yet</h3>
            <p className="text-gray-400 mb-8 text-lg">Start your global connectivity journey today</p>
            <Link to={createPageUrl("ESimStore")} className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-gray-950 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/30">
              <ShoppingBag className="w-5 h-5" />
              Browse Plans
            </Link>
          </div>
        ) : filteredEsims.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No {filter !== 'all' ? filter : ''} plans</h3>
            <p className="text-gray-400">Try selecting a different filter</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEsims.map(esim => (
              <motion.div 
                key={esim.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
                onClick={() => setSelectedESim(esim.id === selectedESim ? null : esim.id)}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer">
                  {/* eSIM Chip Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-24 h-24 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <rect x="5" y="5" width="14" height="14" opacity="0.3"/>
                    <rect x="7" y="7" width="3" height="3"/>
                    <rect x="14" y="7" width="3" height="3"/>
                    <rect x="7" y="14" width="3" height="3"/>
                    <rect x="14" y="14" width="3" height="3"/>
                  </svg>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{esim.product_name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {esim.status === 'active' ? (
                          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : esim.status === 'expired' ? (
                          <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30 font-semibold">
                            <AlertCircle className="w-3 h-3" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30 font-semibold">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Amount Paid</p>
                    <p className="text-3xl font-bold text-cyan-400 mt-1">${esim.price_paid?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-6 relative z-10">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Data Usage</p>
                      <Wifi className="w-4 h-4 text-cyan-400" />
                    </div>
                    {esim.data_gb ? (
                      <>
                        <div className="bg-gray-900/50 rounded-full h-3 overflow-hidden mb-3 border border-cyan-500/20">
                          <div
                            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full transition-all"
                            style={{width: `${Math.min(100, ((esim.data_used_gb || 0) / esim.data_gb) * 100)}%`}}
                          ></div>
                        </div>
                        <p className="text-lg font-bold text-cyan-400">{(esim.data_used_gb || 0).toFixed(1)}GB / {esim.data_gb}GB</p>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(((esim.data_used_gb || 0) / esim.data_gb) * 100)}% consumed</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Data info unavailable</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Validity</p>
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    {esim.valid_until ? (
                      <>
                        <p className="text-lg font-bold text-purple-400">{new Date(esim.valid_until).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Expires on this date</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">No expiry info</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20 rounded-xl p-4 hover:border-pink-500/40 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">Status</p>
                      <TrendingUp className="w-4 h-4 text-pink-400" />
                    </div>
                    <p className={`text-lg font-bold ${esim.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {esim.status?.charAt(0).toUpperCase() + esim.status?.slice(1) || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Current state</p>
                  </div>
                </div>

                {/* ICCID Section */}
                <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/20 border border-white/10 rounded-xl p-4 mb-6 relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">ICCID Number</p>
                      <p className="text-sm font-mono text-cyan-300 break-all select-text">{esim.iccid}</p>
                    </div>
                    <button
                       onClick={() => copyToClipboard(esim.iccid)}
                       className="p-2.5 hover:bg-cyan-500/10 rounded-lg transition-all border border-cyan-500/20 hover:border-cyan-500/40 flex-shrink-0"
                       aria-label="Copy ICCID to clipboard"
                     >
                       <Copy className="w-4 h-4 text-cyan-400" />
                     </button>
                  </div>
                </div>

                {/* Auto Top-up Toggle */}
                <div
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 rounded-xl mb-4 relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-violet-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Auto Top-up</p>
                      <p className="text-xs text-gray-400">Buy same plan at 80% usage</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleAutoTopup(esim, e)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${esim.auto_topup ? 'bg-violet-500' : 'bg-gray-700'}`}
                    aria-label="Toggle auto top-up"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${esim.auto_topup ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Actions */}
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: selectedESim === esim.id ? 'auto' : 0, opacity: selectedESim === esim.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden relative z-10"
                >
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setInstallESim(esim); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <QrCode className="w-4 h-4" />
                      Install eSIM
                    </button>
                  </div>
                </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>

    {installESim && (
      <QRCodeModal esim={installESim} onClose={() => setInstallESim(null)} />
    )}
    </>
  );
}