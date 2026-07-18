import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ShieldCheck, Loader2, Lock, Phone, Wifi, Zap } from "lucide-react";

/**
 * Wraps any feature page that requires an active subscription (virtual number OR eSIM).
 * If the user has no active subscription, shows an upgrade prompt instead.
 */
export default function SubscriptionGate({ children, feature = "this feature" }) {
  const [status, setStatus] = useState("loading"); // "loading" | "allowed" | "denied"
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);

      // Admins always have access
      if (u?.role === "admin") {
        setStatus("allowed");
        return;
      }

      // Check for any active virtual number or eSIM
      const [numbers, esims, subs] = await Promise.all([
        base44.entities.VirtualNumber.filter({ customer_email: u.email, status: "active" }).catch(() => []),
        base44.entities.ESim.filter({ user_email: u.email, status: "active" }).catch(() => []),
        base44.entities.Subscription.filter({ user_email: u.email, status: "active" }).catch(() => []),
      ]);

      const hasActive = (numbers?.length > 0) || (esims?.length > 0) || (subs?.length > 0);
      setStatus(hasActive ? "allowed" : "denied");
    } catch {
      // Not logged in or error — let the parent RequireAuth handle it
      setStatus("allowed");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}
      >
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}>
            <Lock className="w-10 h-10 text-cyan-400" />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2">Subscription Required</h2>
          <p className="text-gray-400 text-sm mb-8">
            You need an active virtual number or eSIM plan to access {feature}. Get started by purchasing a plan below.
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link
              to="/VirtualNumbers"
              className="rounded-2xl p-5 text-left transition-all hover:scale-105"
              style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.25)" }}
            >
              <Phone className="w-7 h-7 text-cyan-400 mb-3" />
              <p className="font-bold text-white text-sm">Virtual Number</p>
              <p className="text-xs text-gray-400 mt-1">From $4.99/mo</p>
            </Link>

            <Link
              to="/ESimStore"
              className="rounded-2xl p-5 text-left transition-all hover:scale-105"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}
            >
              <Wifi className="w-7 h-7 text-purple-400 mb-3" />
              <p className="font-bold text-white text-sm">eSIM Plan</p>
              <p className="text-xs text-gray-400 mt-1">Global data plans</p>
            </Link>
          </div>

          {/* Credits shortcut */}
          <Link
            to="/Credits"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:underline"
          >
            <Zap className="w-4 h-4" />
            Buy credits first and pay instantly
          </Link>

          <p className="mt-6 text-xs text-gray-600">
            Already purchased?{" "}
            <button
              onClick={checkSubscription}
              className="text-cyan-400 hover:underline"
            >
              Refresh status
            </button>
          </p>
        </div>
      </div>
    );
  }

  return children;
}