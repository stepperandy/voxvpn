import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone, MessageSquare, PhoneForwarded, ChevronDown, ChevronUp, Search, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  available:  "bg-emerald-500/20 text-emerald-400",
  reserved:   "bg-yellow-500/20  text-yellow-400",
  assigned:   "bg-blue-500/20    text-blue-400",
  active:     "bg-green-500/20   text-green-400",
  suspended:  "bg-orange-500/20  text-orange-400",
  expired:    "bg-red-500/20     text-red-400",
  released:   "bg-gray-500/20    text-gray-400",
  pending:    "bg-yellow-500/20  text-yellow-400",
  cancelled:  "bg-red-500/20     text-red-400",
};

export default function AdminNumbersManager() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const [forwardingInputs, setForwardingInputs] = useState({});

  useEffect(() => {
    loadNumbers();
  }, []);

  const loadNumbers = async () => {
    setLoading(true);
    try {
      const nums = await base44.entities.VirtualNumber.list("-created_date", 200);
      setNumbers(nums || []);
      const inputs = {};
      nums.forEach(n => { inputs[n.id] = n.forwarding_number || ""; });
      setForwardingInputs(inputs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = async (number, field) => {
    setSaving(number.id + field);
    const updated = { ...number, [field]: !number[field] };
    try {
      await base44.entities.VirtualNumber.update(number.id, { [field]: !number[field] });
      setNumbers(prev => prev.map(n => n.id === number.id ? updated : n));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const saveForwarding = async (number) => {
    setSaving(number.id + "fwd");
    try {
      await base44.entities.VirtualNumber.update(number.id, {
        forwarding_number: forwardingInputs[number.id] || null,
        forwarding_enabled: !!forwardingInputs[number.id],
      });
      setNumbers(prev => prev.map(n =>
        n.id === number.id
          ? { ...n, forwarding_number: forwardingInputs[number.id], forwarding_enabled: !!forwardingInputs[number.id] }
          : n
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const filtered = numbers.filter(n =>
    n.phone_number?.includes(search) ||
    n.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    n.country_code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by number, email, or country..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button onClick={loadNumbers} className="p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-4">{filtered.length} number{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No virtual numbers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(num => (
            <div key={num.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              {/* Row */}
              <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-white text-sm">{num.phone_number}</p>
                    <p className="text-xs text-gray-500 truncate">{num.customer_email || "—"} · {num.country_code || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[num.status] || "bg-gray-700 text-gray-400"}`}>
                    {num.status || "unknown"}
                  </span>
                  <button
                    onClick={() => setExpanded(expanded === num.id ? null : num.id)}
                    className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                  >
                    {expanded === num.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Panel */}
              {expanded === num.id && (
                <div className="border-t border-gray-700/50 p-4 space-y-4 bg-gray-900/40">
                  {/* Capabilities */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Capabilities</p>
                    <div className="flex gap-3 flex-wrap">
                      {/* SMS Toggle */}
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white">SMS</span>
                        <button
                          onClick={() => toggleCapability(num, "sms_enabled")}
                          disabled={saving === num.id + "sms_enabled"}
                          className={`relative w-10 h-5 rounded-full transition-colors ${num.sms_enabled !== false ? "bg-cyan-500" : "bg-gray-600"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${num.sms_enabled !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>

                      {/* Voice Toggle */}
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white">Voice</span>
                        <button
                          onClick={() => toggleCapability(num, "voice_enabled")}
                          disabled={saving === num.id + "voice_enabled"}
                          className={`relative w-10 h-5 rounded-full transition-colors ${num.voice_enabled !== false ? "bg-cyan-500" : "bg-gray-600"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${num.voice_enabled !== false ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Call Forwarding */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide flex items-center gap-2">
                      <PhoneForwarded className="w-3.5 h-3.5" /> Call Forwarding
                      {num.forwarding_enabled && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">Active</span>}
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={forwardingInputs[num.id] || ""}
                        onChange={e => setForwardingInputs(prev => ({ ...prev, [num.id]: e.target.value }))}
                        placeholder="+1 555 000 0000 (leave blank to disable)"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                      />
                      <button
                        onClick={() => saveForwarding(num)}
                        disabled={saving === num.id + "fwd"}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-semibold text-sm rounded-lg transition-colors"
                      >
                        {saving === num.id + "fwd" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {[
                      { label: "Stripe Customer", value: num.stripe_customer_id },
                      { label: "Subscription ID", value: num.stripe_subscription_id },
                      { label: "Telnyx ID", value: num.telnyx_number_id },
                    ].map(({ label, value }) => value ? (
                      <div key={label}>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-xs font-mono text-gray-300 truncate">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}