import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Calendar, Loader2, AlertCircle, CheckCircle2, RefreshCw, DollarSign } from "lucide-react";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);

  const loadSubscriptions = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);

      const numbers = await base44.entities.VirtualNumber.filter(
        { customer_email: u.email, stripe_subscription_id: { $exists: true } },
        "-created_date"
      );

      setSubscriptions(numbers || []);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  usePullToRefresh(() => {
    loadSubscriptions();
  }, containerRef);

  const toggleAutoRenewal = async (subscription, enabled) => {
    setUpdating(subscription.id);
    try {
      const res = await base44.functions.invoke("updateSubscriptionRenewal", {
        subscription_id: subscription.stripe_subscription_id,
        auto_renew: enabled
      });

      if (res.data?.success) {
        setSubscriptions(prev =>
          prev.map(s =>
            s.id === subscription.id
              ? { ...s, auto_renew_enabled: enabled }
              : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to update renewal:", err);
      alert("Failed to update renewal settings");
    } finally {
      setUpdating(null);
    }
  };

  const openCustomerPortal = async (subscription) => {
    try {
      const res = await base44.functions.invoke("createCustomerPortal", {
        stripe_customer_id: subscription.stripe_customer_id
      });
      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      }
    } catch (err) {
      console.error("Failed to open portal:", err);
      alert("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Subscriptions</h1>
          <p className="text-gray-400">Manage your active subscriptions and renewal settings</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active subscriptions</p>
            <p className="text-gray-500 text-sm mt-1">Your purchased numbers will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map(sub => {
              const nextRenewDate = sub.next_renewal_date
                ? new Date(sub.next_renewal_date).toLocaleDateString()
                : "—";
              
              return (
                <div
                  key={sub.id}
                  className="bg-gradient-to-r from-white/5 to-white/2 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white font-mono mb-2">{sub.phone_number}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        {sub.country_code && <span>📍 {sub.country_code}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Renews {nextRenewDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Monthly Fee</p>
                      <p className="text-2xl font-bold text-cyan-400 flex items-center justify-end gap-1">
                        <DollarSign className="w-5 h-5" />
                        {sub.monthly_fee?.toFixed(2) || "–"}
                      </p>
                    </div>
                  </div>

                  {/* Status & Auto-Renew Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">Auto-Renewal</p>
                        <p className="text-xs text-gray-500">
                          {sub.auto_renew_enabled !== false
                            ? "Will automatically renew on the due date"
                            : "Renewal disabled"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleAutoRenewal(
                          sub,
                          sub.auto_renew_enabled === false
                        )
                      }
                      disabled={updating === sub.id}
                      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                        sub.auto_renew_enabled !== false
                          ? "bg-green-500"
                          : "bg-gray-600"
                      } ${updating === sub.id ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          sub.auto_renew_enabled !== false
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => openCustomerPortal(sub)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Update Payment Method
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}