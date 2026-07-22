import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Filter, CheckCircle, XCircle, MinusCircle, Video, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_COLORS = {
  Facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Instagram: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  LinkedIn: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Twitter: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  TikTok: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_CONFIG = {
  posted: { icon: CheckCircle, color: "text-green-400", badge: "bg-green-500/20 text-green-300", label: "Posted" },
  failed: { icon: XCircle, color: "text-red-400", badge: "bg-red-500/20 text-red-300", label: "Failed" },
  skipped: { icon: MinusCircle, color: "text-gray-400", badge: "bg-gray-500/20 text-gray-300", label: "Skipped" },
};

export default function SMOSendHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await base44.entities.SMOSendLog.list('-sent_at', 100).catch(() => []);
    setLogs(data || []);
    setLoading(false);
  };

  const filteredLogs = logs.filter(l => {
    if (platformFilter !== "all" && l.platform !== platformFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: logs.length,
    posted: logs.filter(l => l.status === "posted").length,
    failed: logs.filter(l => l.status === "failed").length,
    skipped: logs.filter(l => l.status === "skipped").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" /> Send History
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[130px] h-8 bg-slate-700 border-slate-600 text-white text-xs">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Platforms</SelectItem>
              {Object.keys(PLATFORM_COLORS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px] h-8 bg-slate-700 border-slate-600 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadLogs} variant="ghost" size="sm" className="h-8 text-xs">
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Sent</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.posted}</p>
          <p className="text-xs text-gray-500">Posted</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          <p className="text-xs text-gray-500">Failed</p>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{stats.skipped}</p>
          <p className="text-xs text-gray-500">Skipped</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Send className="w-10 h-10 text-green-400/50 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">No send records yet.</p>
          <p className="text-gray-500 text-sm">Records will appear here after posts are published to social media.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.map((log) => {
              const StatusIcon = STATUS_CONFIG[log.status]?.icon || MinusCircle;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-start gap-3"
                >
                  <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${STATUS_CONFIG[log.status]?.color}`} />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PLATFORM_COLORS[log.platform] || "bg-gray-500/20 text-gray-300"}`}>
                        {log.platform}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[log.status]?.badge}`}>
                        {STATUS_CONFIG[log.status]?.label}
                      </span>
                      {log.video_used && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          <Video className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                      <span className="text-xs text-gray-600 capitalize">{log.trigger_source}</span>
                    </div>

                    {log.post_content_snapshot && (
                      <p className="text-sm text-gray-300 line-clamp-2">{log.post_content_snapshot}</p>
                    )}

                    {log.platform_response && (
                      <p className="text-xs text-green-400/70">{log.platform_response}</p>
                    )}

                    {log.error_message && (
                      <p className="text-xs text-red-400">{log.error_message}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{log.sent_at ? new Date(log.sent_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                      {log.sent_by && <span>by {log.sent_by}</span>}
                      {log.campaign_name && <span>· {log.campaign_name}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}