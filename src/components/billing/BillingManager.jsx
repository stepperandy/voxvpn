import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";

export default function BillingManager({ stripeCustomerId, paypalSubscriptionId }) {
  const [loading, setLoading] = useState(false);

  const openStripePortal = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageBilling", {
        action: "stripe_portal",
        stripe_customer_id: stripeCustomerId
      });

      if (res.data?.url) {
        window.open(res.data.url, "_blank");
      }
    } catch (err) {
      alert("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  };

  const checkPayPalStatus = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageBilling", {
        action: "paypal_status",
        paypal_customer_id: paypalSubscriptionId
      });

      if (res.data?.success) {
        alert(`PayPal Status: ${res.data.status}`);
      }
    } catch (err) {
      alert("Failed to get PayPal status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <CreditCard className="w-5 h-5" /> Billing Management
      </h3>

      {stripeCustomerId && (
        <button
          onClick={openStripePortal}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Manage Stripe Billing
        </button>
      )}

      {paypalSubscriptionId && (
        <button
          onClick={checkPayPalStatus}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Check PayPal Status
        </button>
      )}

      {!stripeCustomerId && !paypalSubscriptionId && (
        <p className="text-sm text-gray-500">No billing information available</p>
      )}
    </div>
  );
}