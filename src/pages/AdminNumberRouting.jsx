import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Phone, Plus, Trash2, AlertCircle, Loader2, Check } from "lucide-react";

export default function AdminNumberRouting() {
  const [user, setUser] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [users, setUsers] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newEndpoint, setNewEndpoint] = useState({
    type: "web", // web, sip, pstn
    identity: "",
    priority: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const u = await base44.auth.me();
      if (u?.role !== "admin") {
        setError("Admin access required");
        return;
      }
      setUser(u);

      const [numList, userList] = await Promise.all([
        base44.entities.VirtualNumber.list(),
        base44.entities.User.list(),
      ]);

      setNumbers(numList || []);
      setUsers(userList || []);

      if (numList?.length > 0) {
        setSelectedNumber(numList[0]);
        // In production, fetch endpoints from backend/database
        setEndpoints([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignNumber = async (numberEId, userEmail) => {
    try {
      setError("");
      await base44.entities.VirtualNumber.update(numberEId, {
        customer_email: userEmail,
        status: "assigned",
      });
      setSuccess(`Number assigned to ${userEmail}`);
      setTimeout(() => setSuccess(""), 2000);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddEndpoint = async () => {
    if (!selectedNumber || !newEndpoint.identity) {
      setError("Select number and enter endpoint identity");
      return;
    }

    try {
      setError("");
      // In production, POST to backend to create endpoint routing
      // await base44.functions.invoke("addCallEndpoint", { numberEId: selectedNumber.id, endpoint: newEndpoint });
      
      // For now, simulate adding to list
      setEndpoints([...endpoints, { ...newEndpoint, id: Date.now() }]);
      setNewEndpoint({ type: "web", identity: "", priority: 1 });
      setShowAddEndpoint(false);
      setSuccess("Endpoint added");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEndpoint = async (endpointId) => {
    try {
      setError("");
      // In production, POST to backend to delete endpoint
      setEndpoints(endpoints.filter(e => e.id !== endpointId));
      setSuccess("Endpoint removed");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Admin access required to manage number routing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Number Routing Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Assign numbers to users and configure call endpoints</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-6 text-green-400">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Numbers List */}
          <div className="lg:col-span-2">
            <div className="bg-[#0d2137] border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/30">
                <h2 className="font-semibold text-white">Virtual Numbers</h2>
              </div>

              <div className="divide-y divide-gray-700 max-h-96 overflow-auto">
                {numbers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No numbers yet</div>
                ) : (
                  numbers.map(num => (
                    <div
                      key={num.id}
                      onClick={() => setSelectedNumber(num)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedNumber?.id === num.id
                          ? "bg-cyan-500/10 border-l-2 border-cyan-500"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono font-semibold text-white">{num.phone_number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          num.status === "assigned"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {num.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {num.customer_email ? `Assigned to: ${num.customer_email}` : "Unassigned"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {num.country_code} • {num.number_type}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Assignment Panel */}
          <div className="bg-[#0d2137] border border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Assign Number</h3>

            {selectedNumber ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Current Number</p>
                  <p className="font-mono font-semibold text-white text-lg">{selectedNumber.phone_number}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-2">Select User</label>
                  <select
                    value={selectedNumber.customer_email || ""}
                    onChange={e => handleAssignNumber(selectedNumber.id, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.email}>
                        {u.full_name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    <strong>Note:</strong> Once assigned, inbound calls will automatically route to this user's registered endpoints.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a number to assign</p>
            )}
          </div>
        </div>

        {/* Endpoints Configuration */}
        {selectedNumber && (
          <div className="mt-6 bg-[#0d2137] border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/30 flex items-center justify-between">
              <h2 className="font-semibold text-white">Call Endpoints for {selectedNumber.phone_number}</h2>
              <button
                onClick={() => setShowAddEndpoint(!showAddEndpoint)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Endpoint
              </button>
            </div>

            {showAddEndpoint && (
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/20 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Type</label>
                    <select
                      value={newEndpoint.type}
                      onChange={e => setNewEndpoint({ ...newEndpoint, type: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="web">Web/Mobile Client</option>
                      <option value="sip">SIP URI</option>
                      <option value="pstn">Phone Number (PSTN)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newEndpoint.priority}
                      onChange={e => setNewEndpoint({ ...newEndpoint, priority: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-2">
                    {newEndpoint.type === "web" ? "Client Identity" : newEndpoint.type === "sip" ? "SIP URI" : "Phone Number"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      newEndpoint.type === "web" ? "user@twilio" : newEndpoint.type === "sip" ? "sip:user@domain.com" : "+1234567890"
                    }
                    value={newEndpoint.identity}
                    onChange={e => setNewEndpoint({ ...newEndpoint, identity: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddEndpoint}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-gray-950 font-semibold text-sm transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddEndpoint(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-700">
              {endpoints.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No endpoints configured. Add one to route calls.</div>
              ) : (
                endpoints.map(ep => (
                  <div key={ep.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                          Priority {ep.priority}
                        </span>
                        <span className="text-sm font-semibold text-white capitalize">{ep.type}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-mono">{ep.identity}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEndpoint(ep.id)}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Call Routing Logic Diagram */}
        <div className="mt-8 p-6 bg-[#0d2137] border border-gray-700 rounded-xl">
          <h3 className="font-semibold text-white mb-4">Call Routing Logic</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex gap-3">
              <span className="text-cyan-400 font-semibold">1.</span>
              <span>Inbound call arrives at VoxDigits virtual number</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-semibold">2.</span>
              <span>Backend looks up number in database to find assigned user</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-semibold">3.</span>
              <span>System rings endpoints by priority (Web Client → SIP → Phone)</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-semibold">4.</span>
              <span>If answered, call connects; if not, routes to voicemail</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-400 font-semibold">5.</span>
              <span>Call events logged in database for history/analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}