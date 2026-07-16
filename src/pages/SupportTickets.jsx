import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MessageSquare, Clock, AlertCircle, CheckCircle2, ChevronRight, Filter, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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
  waiting_customer: { color: "bg-orange-500/20", textColor: "text-orange-300", label: "Waiting for You" },
  resolved: { color: "bg-green-500/20", textColor: "text-green-300", label: "Resolved" },
  closed: { color: "bg-gray-500/20", textColor: "text-gray-300", label: "Closed" }
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order_id: "",
    category: "activation",
    priority: "medium"
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const t = await base44.entities.SupportTicket.filter({ user_email: user.email }, "-created_date", 50);
      setTickets(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await base44.auth.me();
      if (!user) return;
      
      const newTicket = await base44.entities.SupportTicket.create({
        ...formData,
        user_email: user.email
      });

      // Send confirmation email
      try {
        await base44.functions.invoke('ticketNotification', {
          ticket_id: newTicket.id,
          action: 'opened',
          support_message: `Your support ticket has been created and our team will review it shortly.`
        });
      } catch (emailErr) {
        console.warn('Failed to send confirmation email:', emailErr);
      }
      
      setFormData({ title: "", description: "", order_id: "", category: "activation", priority: "medium" });
      setShowForm(false);
      loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
            <p className="text-gray-400 text-sm mt-1">Track your eSIM support requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Submit a Support Ticket</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed explanation of your issue"
                  required
                  rows="4"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Order ID (optional)</label>
                  <input
                    type="text"
                    value={formData.order_id}
                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                    placeholder="ICCID or Order #"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-semibold transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "open", "in_progress", "waiting_customer", "resolved"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status]?.label}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No support tickets</p>
              <p className="text-sm mt-1">Submit a ticket to get help with your eSIM</p>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const category = CATEGORIES.find(c => c.value === ticket.category);
              const statusConfig = STATUS_CONFIG[ticket.status];
              
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{category?.icon}</span>
                        <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{ticket.title}</h3>
                        <div className={`px-2.5 py-1 rounded text-xs font-medium ${statusConfig.color} ${statusConfig.textColor}`}>
                          {statusConfig.label}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{ticket.description.substring(0, 80)}...</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {ticket.order_id && <span>Order: {ticket.order_id}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{CATEGORIES.find(c => c.value === selectedTicket.category)?.icon}</span>
                    <div className={`px-2.5 py-1 rounded text-xs font-medium ${STATUS_CONFIG[selectedTicket.status].color} ${STATUS_CONFIG[selectedTicket.status].textColor}`}>
                      {STATUS_CONFIG[selectedTicket.status].label}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Description</p>
                  <p className="text-white">{selectedTicket.description}</p>
                </div>
                {selectedTicket.order_id && (
                  <div>
                    <p className="text-gray-400 mb-1">Order ID</p>
                    <p className="text-white font-mono">{selectedTicket.order_id}</p>
                  </div>
                )}
                {selectedTicket.resolution_notes && (
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <p className="text-gray-400 mb-1 font-medium">Support Notes</p>
                    <p className="text-cyan-300">{selectedTicket.resolution_notes}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 pt-4 border-t border-gray-800">
                  Created {new Date(selectedTicket.created_date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}