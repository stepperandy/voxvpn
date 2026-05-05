import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Smartphone, Laptop, Wifi, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ConnectionHistory() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await base44.functions.invoke('getConnectionHistory', {});
      setConnections(res.data?.connections || []);
    } catch (err) {
      console.error('Failed to load connection history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type) => {
    const icons = {
      ios: <Smartphone size={14} className="text-blue-400" />,
      android: <Smartphone size={14} className="text-green-400" />,
      windows: <Laptop size={14} className="text-slate-400" />,
      macos: <Laptop size={14} className="text-slate-400" />,
      linux: <Laptop size={14} className="text-orange-400" />,
    };
    return icons[type] || <Wifi size={14} className="text-slate-500" />;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 rounded-lg border border-white/10 bg-white/3">
      <h3 className="text-white font-bold mb-3">Connected Devices</h3>
      
      {connections.length === 0 ? (
        <p className="text-slate-500 text-sm">No devices connected yet</p>
      ) : (
        connections.map(conn => (
          <div key={conn.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
            <div className="flex-shrink-0">
              {getDeviceIcon(conn.device_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{conn.device_name}</p>
              <p className="text-slate-500 text-xs">{conn.device_type.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Clock size={12} />
              {new Date(conn.last_connected).toLocaleDateString()}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              conn.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
            }`}>
              {conn.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}