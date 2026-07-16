import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings, Phone, Loader2, Save } from "lucide-react";

export default function Preferences() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    global_forward_number: "",
    forwarding_enabled: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const u = await base44.auth.me();
      setUser(u);

      const prefs = await base44.entities.UserPreference.filter({
        user_email: u.email,
      });

      if (prefs?.length) {
        setPreferences({
          global_forward_number: prefs[0].global_forward_number || "",
          forwarding_enabled: prefs[0].forwarding_enabled || false,
        });
      }
    } catch (e) {
      console.error("Failed to load preferences:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (preferences.forwarding_enabled && !preferences.global_forward_number.trim()) {
      alert("Please enter a forwarding number if forwarding is enabled");
      return;
    }

    try {
      setSaving(true);

      const existing = await base44.entities.UserPreference.filter({
        user_email: user.email,
      });

      if (existing?.length) {
        await base44.entities.UserPreference.update(existing[0].id, {
          global_forward_number: preferences.global_forward_number,
          forwarding_enabled: preferences.forwarding_enabled,
        });
      } else {
        await base44.entities.UserPreference.create({
          user_email: user.email,
          global_forward_number: preferences.global_forward_number,
          forwarding_enabled: preferences.forwarding_enabled,
        });
      }

      alert("Preferences saved!");
    } catch (e) {
      console.error("Failed to save preferences:", e);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}
      >
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)" }}
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))" }}
          >
            <Settings className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Preferences</h1>
            <p className="text-gray-400 text-sm">Manage your communication settings</p>
          </div>
        </div>

        {/* Global Forwarding Section */}
        <div
          className="p-6 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,179,237,0.2)" }}
            >
              <Phone className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Global Call Forwarding</h2>
              <p className="text-gray-400 text-sm">Set a default number to forward all incoming calls</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Forwarding Number Input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Forwarding Number
              </label>
              <input
                type="tel"
                value={preferences.global_forward_number}
                onChange={(e) =>
                  setPreferences({ ...preferences, global_forward_number: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-cyan-500 font-mono text-lg"
              />
              <p className="text-gray-500 text-xs mt-2">
                Enter the phone number where calls should be forwarded.
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div>
                <p className="font-semibold text-white">Enable Forwarding</p>
                <p className="text-gray-500 text-sm">
                  {preferences.forwarding_enabled
                    ? "Calls will be forwarded to the number above"
                    : "Forwarding is currently disabled"}
                </p>
              </div>
              <button
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    forwarding_enabled: !preferences.forwarding_enabled,
                  })
                }
                className={`w-14 h-8 rounded-full transition-all flex items-center ${
                  preferences.forwarding_enabled
                    ? "bg-emerald-500 justify-end"
                    : "bg-gray-600 justify-start"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white mx-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}