import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone } from "lucide-react";
import VirtualNumberSettings from "@/components/dashboard/VirtualNumberSettings";

export default function NumberSettings() {
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      setUser(u);

      const numbers = await base44.entities.VirtualNumber.filter(
        { customer_email: u.email, status: "active" },
        "-created_date",
        50
      );
      setVirtualNumbers(numbers);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Number Settings</h1>
          </div>
          <p className="text-gray-400">Manage auto-replies and call forwarding for your virtual numbers</p>
        </div>

        {/* Content */}
        {virtualNumbers.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/20 rounded-xl">
            <Phone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No active numbers</h3>
            <p className="text-gray-400">You don't have any active virtual numbers yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {virtualNumbers.map((num) => (
              <VirtualNumberSettings
                key={num.id}
                virtualNumber={num.phone_number}
                userEmail={user.email}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}