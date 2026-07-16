import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, MessageSquare, X, Send } from "lucide-react";
import { usePullToRefresh } from "@/components/hooks/usePullToRefresh";

const STATUSES = ["open", "in_progress", "waiting_customer", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responding, setResponding] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const containerRef = useRef(null);

  const loadTickets = async () => {
    try {
      const data = await base44.asServiceRole.entities.SupportTicket.filter({}, "-created_date");
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

  const handleRespond = async () => {
    if (!responseText.trim()) {
      alert("Please enter a response");
      return;
    }

    setResponding(true);
    try {
      const res = await base44.functions.invoke("respondToTicket", {
        ticket_id: selectedTicket.id,
        resolution_notes: responseText,
        new_status: newStatus || "in_progress"
      });

      if (res.data?.success) {
        // Update local state
        setTickets(prev =>
          prev.map(t =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  resolution_notes: responseText,
                  status: newStatus || "in_progress"
                }
              : t
          )
        );

        setSelectedTicket(prev =>
          prev
            ? {
                ...prev,
                resolution_notes: responseText,
                status: newStatus || "in_progress"
              }
            : null
        );

        setResponseText("");
        setNewStatus("");
        alert("Response sent and email notification delivered!");
      }
    } catch (err) {
      console.error("Failed to respond:", err);
      alert("Failed to send response");
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-500/20 text-blue-300",
      in_progress: "bg-yellow-500/20 text-yellow-300",
      waiting_customer: "bg-orange-500/20 text-orange-300",
      resolved: "bg-green-500/20 text-green-300",
      closed: "bg-gray-500/20 text-gray-300"
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-blue-400",
      medium: "text-yellow-400",
      high: "text-red-400"
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === "open");
  const inProgressTickets = tickets.filter(t => t.status === "in_progress");
  const resolvedTickets = tickets.filter(t => ["resolved", "closed"].includes(t.status));

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-gray-400">Manage user support inquiries and responses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Open</p>
            <p className="text-3xl font-bold text-blue-400">{openTickets.length}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">In Progress</p>
            <p className="text-3xl font-bold text-yellow-400">{inProgressTickets.length}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-gray-400">Resolved</p>
            <p className="text-3xl font-bold text-green-400">{resolvedTickets.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3 max-h-96 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="text-center text-gray-500">No tickets</div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? "bg-cyan-500/10 border-cyan-500/50"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{ticket.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{ticket.user_email}</p>
                </button>
              ))
            )}
          </div>

          {/* Ticket Details & Response */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedTicket.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">{selectedTicket.user_email}</p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-800 rounded">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900/30 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-sm font-semibold text-white">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Priority</p>
                    <p className={`text-sm font-semibold ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <select
                      value={newStatus || selectedTicket.status}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="text-xs bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm text-white">{new Date(selectedTicket.created_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-gray-400 mb-2">Description</p>
                  <p className="text-white bg-gray-900/30 rounded-lg p-3">{selectedTicket.description}</p>
                </div>

                {/* Previous Resolution */}
                {selectedTicket.resolution_notes && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-sm font-semibold text-green-300 mb-2">Previous Response</p>
                    <p className="text-sm text-green-200/80">{selectedTicket.resolution_notes}</p>
                  </div>
                )}

                {/* Response Form */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-400 mb-2 block">Your Response</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      rows="4"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleRespond}
                    disabled={responding}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 rounded-lg font-bold text-sm transition-colors"
                  >
                    {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {responding ? "Sending..." : "Send Response & Notify"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Select a ticket to view details and respond</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}