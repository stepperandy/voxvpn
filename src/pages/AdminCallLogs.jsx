import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Phone, Search, Filter, Download, RefreshCw, ExternalLink } from "lucide-react";

export default function AdminCallLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await base44.asServiceRole.entities.CallLog.list("-created_date", 500);
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load call logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filtered = logs.filter(log => {
    const matchSearch = !search || 
      log.from_number?.includes(search) ||
      log.to_number?.includes(search) ||
      log.user_email?.includes(search) ||
      log.call_sid?.includes(search);
    
    const matchStatus = statusFilter === "all" || log.status === statusFilter;
    const matchDirection = directionFilter === "all" || log.direction === directionFilter;
    
    return matchSearch && matchStatus && matchDirection;
  });

  const paginatedLogs = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const getStatusColor = (status) => {
    const colors = {
      "completed": "bg-green-500/20 text-green-400 border-green-500/30",
      "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "failed": "bg-red-500/20 text-red-400 border-red-500/30",
      "no-answer": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "busy": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return colors[status] || "bg-gray-700/30 text-gray-400 border-gray-600/30";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">Call Logs</h1>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by number, email, or call SID..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="failed">Failed</option>
            <option value="no-answer">No Answer</option>
            <option value="busy">Busy</option>
          </select>

          {/* Direction Filter */}
          <select
            value={directionFilter}
            onChange={e => { setDirectionFilter(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} call{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-xl">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">No call logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date/Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">From</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Direction</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Call SID</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.created_date ? new Date(log.created_date).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-400">{log.from_number || "—"}</td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-400">{log.to_number || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 truncate max-w-xs">{log.user_email || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          log.direction === "inbound" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                        }`}>
                          {log.direction === "inbound" ? "📥" : "📤"} {log.direction || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                          {log.status || "unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDuration(log.duration)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-gray-500 truncate max-w-[120px]">{log.call_sid || "—"}</code>
                          {log.recording_url && (
                            <a
                              href={log.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-gray-800 rounded transition"
                              title="View recording"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-lg transition text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-lg transition text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}