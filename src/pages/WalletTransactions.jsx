import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowUpCircle, ArrowDownCircle, Wallet, Filter, Plus, Calendar, AlertTriangle, Zap, RefreshCw } from "lucide-react";
import { isRunningInIframe } from "@/components/stripe/stripeUtils";

const CATEGORY_LABELS = {
  top_up: "Top Up", call: "Call", sms: "SMS", esim: "eSIM",
  number_rental: "Number Rental", renewal: "Renewal", refund: "Refund",
  bonus: "Bonus", commission: "Commission",
};

const CATEGORY_COLORS = {
  top_up: "text-emerald-400", refund: "text-emerald-400", bonus: "text-emerald-400",
  call: "text-blue-400", sms: "text-cyan-400", esim: "text-purple-400",
  number_rental: "text-orange-400", renewal: "text-yellow-400", commission: "text-pink-400",
};

const TOPUP_AMOUNTS = [10, 25, 50, 100];

export default function WalletTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupLoading, setTopupLoading] = useState(null);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState(25);
  const [autoRechargeSaving, setAutoRechargeSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setAutoRecharge(u.auto_recharge_enabled === true);
      setAutoRechargeAmount(u.auto_recharge_amount || 25);
      const [txnData, subData, vnData] = await Promise.all([
        base44.entities.Transaction.filter({ user_email: u.email }, "-created_date", 200),
        base44.entities.Subscription.filter({ user_email: u.email }),
        base44.entities.VirtualNumber.filter({ customer_email: u.email }),
      ]);
      setTransactions(txnData || []);
      setSubscriptions(subData || []);
      setVirtualNumbers(vnData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (amount) => {
    if (isRunningInIframe()) {
      alert("Checkout only works from the published app. Please visit voxdigits.com directly.");
      return;
    }
    setTopupLoading(amount);
    try {
      const res = await base44.functions.invoke("createWalletTopup", {
        amount,
        user_email: user.email,
        success_url: window.location.origin + "/WalletTransactions?topup=success",
        cancel_url: window.location.origin + "/WalletTransactions?topup=cancel",
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data?.error || "Failed to create checkout session.");
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to start checkout.");
    } finally {
      setTopupLoading(null);
    }
  };

  const handleAutoRechargeToggle = async () => {
    setAutoRechargeSaving(true);
    try {
      await base44.auth.updateMe({
        auto_recharge_enabled: !autoRecharge,
        auto_recharge_amount: autoRechargeAmount,
      });
      setAutoRecharge(!autoRecharge);
      const msg = autoRecharge
        ? "Auto-recharge disabled."
        : "Auto-recharge enabled! $" + autoRechargeAmount + " will be charged when balance drops below $2.";
      alert(msg);
    } catch (err) {
      alert("Failed to update auto-recharge setting.");
    } finally {
      setAutoRechargeSaving(false);
    }
  };

  const filtered = transactions.filter(t => filter === "all" || t.type === filter || t.category === filter);

  const totalCredits = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const upcomingRenewals = subscriptions.filter(s => s.status === "active");
  const blockedNumbers = virtualNumbers.filter(vn => vn.status === "suspended" || vn.status === "reserved");

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Wallet className="w-7 h-7 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Wallet & Billing</h1>
          </div>
          <button onClick={loadData} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Balance + Summary */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Current Balance</p>
            <p className="text-xl md:text-2xl font-bold text-cyan-400">{"$"}{(user?.credits || 0).toFixed(2)}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Topped Up</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">+{"$"}{totalCredits.toFixed(2)}</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <p className="text-xl md:text-2xl font-bold text-red-400">-{"$"}{totalDebits.toFixed(2)}</p>
          </div>
        </div>

        {/* Blocked numbers warning */}
        {blockedNumbers.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">
                {blockedNumbers.length} number(s) have outgoing service suspended
              </p>
              <p className="text-red-400/60 text-xs mt-1">
                {blockedNumbers.map(vn => vn.number).join(", ")} — Update your payment method to restore service.
              </p>
            </div>
          </div>
        )}

        {/* Top-up cards */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Top Up Wallet
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOPUP_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => handleTopUp(amt)}
                disabled={topupLoading !== null}
                className="bg-gray-900/60 border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all disabled:opacity-50 group"
              >
                {topupLoading === amt ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{"$"}{amt}</p>
                    <p className="text-xs text-gray-500 mt-1">Add credit</p>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Auto-recharge */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Auto-Recharge</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically add credit when balance drops below {"$"}2
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {autoRecharge && (
                  <select
                    value={autoRechargeAmount}
                    onChange={e => setAutoRechargeAmount(Number(e.target.value))}
                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {TOPUP_AMOUNTS.map(a => <option key={a} value={a}>{"$"}{a}</option>)}
                  </select>
                )}
                <button
                  onClick={handleAutoRechargeToggle}
                  disabled={autoRechargeSaving}
                  className={"relative w-12 h-6 rounded-full transition-colors " + (autoRecharge ? "bg-emerald-500" : "bg-gray-700")}
                >
                  <div className={"absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (autoRecharge ? "translate-x-6" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
            {autoRecharge && (
              <p className="text-xs text-emerald-400 mt-2 ml-8">
                {"✅ Auto-recharge is ON — $"}{autoRechargeAmount}{" will be charged when balance drops below $2"}
              </p>
            )}
          </div>
        </div>

        {/* Upcoming renewals */}
        {upcomingRenewals.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-400" /> Upcoming Renewals
            </h2>
            <div className="space-y-2">
              {upcomingRenewals.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                  <div>
                    <p className="text-sm text-white font-medium">{sub.plan_name || "Virtual Number"}</p>
                    <p className="text-xs text-gray-500">{sub.phone_number || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{"$"}{sub.amount}/{sub.billing_cycle === "yearly" ? "yr" : "mo"}</p>
                    <p className="text-xs text-gray-500">
                      Renews: {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-refundable notice */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs text-yellow-300/80 leading-relaxed">
            <strong>Non-Refundable:</strong> Setup fees, activated subscriptions, and used calling/SMS credit are non-refundable.
            Third-party OTP and WhatsApp compatibility is not guaranteed — use your number with third-party services at your own risk.
            If a subscription is not renewed within 30 days, your number may be permanently reassigned.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "credit", "debit", "call", "sms", "top_up", "renewal"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors " + (filter === f ? "bg-cyan-500 text-gray-950" : "bg-white/5 text-gray-400 hover:text-white")}>
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <Filter className="w-10 h-10 mx-auto mb-3" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                <div className="flex items-center gap-4">
                  {txn.type === "credit" || txn.type === "refund"
                    ? <ArrowUpCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    : <ArrowDownCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                  }
                  <div>
                    <p className="font-semibold text-white text-sm">{txn.description || CATEGORY_LABELS[txn.category] || txn.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={"text-xs font-semibold capitalize " + (CATEGORY_COLORS[txn.category] || "text-gray-400")}>
                        {CATEGORY_LABELS[txn.category] || txn.category}
                      </span>
                      <span className="text-xs text-gray-600">{new Date(txn.created_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={"text-lg font-bold " + (txn.type === "credit" || txn.type === "refund" ? "text-emerald-400" : "text-red-400")}>
                    {txn.type === "credit" || txn.type === "refund" ? "+" : "-"}{"$"}{txn.amount.toFixed(4)}
                  </p>
                  {txn.balance_after != null && (
                    <p className="text-xs text-gray-600">Balance: {"$"}{txn.balance_after.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}