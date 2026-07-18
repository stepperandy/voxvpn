import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, Clock, Loader2, X, ChevronDown } from "lucide-react";

const CATEGORIES = [
  { value: "activation", label: "eSIM Activation", icon: "⚙️" },
  { value: "data_issues", label: "Data/Network", icon: "📡" },
  { value: "device_compatibility", label: "Device Compatibility", icon: "📱" },
  { value: "billing", label: "Billing", icon: "💳" },
  { value: "other", label: "Other", icon: "❓" }
];

const STATUS_CONFIG = {
  open: { color: "bg-blue-500/20", textColor: "text-blue-300", label: "Open" },
  in_progress: { color: "bg-yellow-500/20", textColor: "text-yellow-300", label: "In Progress" },
  waiting_customer: { color: "bg-orange-500/20", textColor: "text-orange-300", label: "Waiting Customer" },
  resolved: { color: "bg-green-500/20", textColor: "text-green-300", label: "Resolved" },
  closed: { color: "bg-gray-500/20", textColor: "text-gray-300", label: "Closed" }
};

const STATUSES = ["open", "in_progress", "waiting_customer", "resolved", "closed"];

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("all");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const t = await base44.entities.SupportTicket.list("-created_date", 100);
      setTickets(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotes(ticket.resolution_notes || "");
    setNewStatus(ticket.status);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await base44.entities.SupportTicket.update(selectedTicket.id, {
        status: newStatus,
        resolution_notes: resolutionNotes,
      });
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus, resolution_notes: resolutionNotes } : t));
      setSelectedTicket(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["all", ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s === "all" ? `All (${tickets.length})` : STATUS_CONFIG[s]?.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No tickets found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => {
            const category = CATEGORIES.find(c => c.value === ticket.category);
            const statusConfig = STATUS_CONFIG[ticket.status];
            return (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span>{category?.icon}</span>
                      <span className="font-medium text-white text-sm truncate">{ticket.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig?.color} ${statusConfig?.textColor}`}>
                        {statusConfig?.label}
                      </span>
                      {ticket.priority === "high" && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300">High</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{ticket.user_email} · {new Date(ticket.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{CATEGORIES.find(c => c.value === selectedTicket.category)?.icon}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[selectedTicket.status]?.color} ${STATUS_CONFIG[selectedTicket.status]?.textColor}`}>
                      {STATUS_CONFIG[selectedTicket.status]?.label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedTicket.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">{selectedTicket.user_email}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">{selectedTicket.description}</div>

              {selectedTicket.order_id && (
                <p className="text-xs text-gray-500">Order: <span className="font-mono text-gray-300">{selectedTicket.order_id}</span></p>
              )}

              {/* Update Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Update Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes for the customer..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setSelectedTicket(null)} className="flex-1 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpdate} disabled={saving} className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg text-sm font-semibold transition-colors">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}