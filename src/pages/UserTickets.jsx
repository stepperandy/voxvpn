import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, AlertCircle, CheckCircle2, Clock, MessageSquare, X } from "lucide-react";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";

const CATEGORIES = ["activation", "data_issues", "device_compatibility", "billing", "other"];

export default function UserTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "other" });
  const containerRef = useRef(null);

  const loadTickets = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const data = await base44.entities.SupportTicket.filter(
        { user_email: u.email },
        "-created_date"
      );
      setTickets(data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  usePullToRefresh(loadTickets, containerRef);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("submitTicket", formData);
      if (res.data?.success) {
        setTickets([res.data.ticket, ...tickets]);
        setFormData({ title: "", description: "", category: "other" });
        setShowForm(false);
        alert("Ticket submitted successfully!");
      }
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      alert("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      in_progress: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      waiting_customer: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      resolved: "bg-green-500/20 text-green-300 border-green-500/30",
      closed: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    const icons = {
      open: <MessageSquare className="w-3 h-3" />,
      in_progress: <Loader2 className="w-3 h-3 animate-spin" />,
      waiting_customer: <Clock className="w-3 h-3" />,
      resolved: <CheckCircle2 className="w-3 h-3" />,
      closed: <CheckCircle2 className="w-3 h-3" />
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.open}`}>
        {icons[status]}
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </span>
    );
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Support Tickets</h1>
            <p className="text-gray-400">Submit and track your support inquiries</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-lg font-bold text-sm transition-colors"
          >
            New Ticket
          </button>
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.replace("_", " ").charAt(0).toUpperCase() + cat.replace("_", " ").slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your issue"
                  rows="5"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg font-bold text-sm transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tickets yet</p>
            <p className="text-gray-500 text-sm mt-1">Submit a ticket to get support</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-white">{ticket.title}</h3>
                  {getStatusBadge(ticket.status)}
                </div>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>#{ticket.id}</span>
                  <span>{new Date(ticket.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-auto">
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
                <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Description</p>
                  <p className="text-white">{selectedTicket.description}</p>
                </div>
                {selectedTicket.resolution_notes && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-sm text-green-300 font-semibold mb-1">Resolution</p>
                    <p className="text-green-200/80">{selectedTicket.resolution_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}