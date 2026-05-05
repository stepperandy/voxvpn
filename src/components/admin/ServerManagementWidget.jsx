import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServerManagementWidget() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const res = await base44.asServiceRole.entities.VPNServer.list('', 100);
      setServers(res);
    } catch (err) {
      console.error('Failed to load servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateServerStatus = async (serverId, newStatus) => {
    setUpdating(serverId);
    try {
      await base44.functions.invoke('manageServerStatus', {
        server_id: serverId,
        status: newStatus,
      });
      loadServers();
    } catch (err) {
      console.error('Failed to update server:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading servers...</div>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {servers.map(s => (
        <div key={s.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{s.city}, {s.country}</p>
              <p className="text-slate-500 text-xs">
                {s.active_connections}/{s.max_connections} · Load: {Math.round(((s.active_connections || 0) / (s.max_connections || 1000)) * 100)}%
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                s.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {s.status}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateServerStatus(s.id, s.status === 'online' ? 'offline' : 'online')}
                disabled={updating === s.id}
              >
                {updating === s.id ? <Loader2 size={14} className="animate-spin" /> : 'Toggle'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}