import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NumberPurchaseWizard from "@/components/numbers/NumberPurchaseWizard";
import VirtualNumberStore from "@/components/esim/VirtualNumberStore";
import { List, Wand2 } from "lucide-react";

export default function VirtualNumbers() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("wizard"); // "wizard" | "browse"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "linear-gradient(160deg, #0d1f35 0%, #0a1628 60%, #0d1f35 100%)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Buy Virtual Number</h1>
            <p className="text-gray-500 text-sm mt-1">Get a virtual phone number worldwide in minutes</p>
          </div>
          {/* Toggle between wizard and browse */}
          <div className="flex items-center gap-1 p-1 bg-gray-800/60 border border-gray-700 rounded-xl">
            <button
              onClick={() => setMode("wizard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "wizard" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              <Wand2 className="w-4 h-4" /> Guided
            </button>
            <button
              onClick={() => setMode("browse")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "browse" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" /> Browse All
            </button>
          </div>
        </div>

        {mode === "wizard" ? (
          <NumberPurchaseWizard user={user} />
        ) : (
          <VirtualNumberStore user={user} onPaymentModal={() => {}} />
        )}
      </div>
    </div>
  );
}