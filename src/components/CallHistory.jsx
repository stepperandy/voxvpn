import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone, Calendar, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function CallHistory({ userId, limit = 20 }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCalls();
  }, [userId, filter]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      let data = await base44.entities.CallLog.filter(
        { to_owner_id: userId },
        '-started_at',
        limit
      );

      if (filter !== 'all') {
        data = data.filter(c => c.direction === filter);
      }

      setCalls(data || []);
    } catch (err) {
      console.error('Failed to load calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'missed': return 'text-red-400 bg-red-500/10';
      case 'no-answer': return 'text-yellow-400 bg-yellow-500/10';
      case 'failed': return 'text-red-500 bg-red-500/15';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getDirectionIcon = (direction, status) => {
    if (status === 'missed') return <PhoneMissed className="w-4 h-4" />;
    return direction === 'inbound' ? 
      <PhoneIncoming className="w-4 h-4" /> : 
      <PhoneOutgoing className="w-4 h-4" />;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading call history...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'inbound', 'outbound'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Calls list */}
      {calls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No calls yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calls.map(call => (
            <div
              key={call.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-800">
                {getDirectionIcon(call.direction, call.status)}
              </div>

              {/* Call details */}
              <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-white text-sm truncate">
                  {call.direction === 'inbound' ? call.from_number : call.to_number}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(call.started_at), 'MMM dd')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(call.started_at), 'HH:mm')}
                  </span>
                  {call.duration_seconds && (
                    <span>{formatDuration(call.duration_seconds)}</span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${getStatusColor(call.status)}`}>
                {call.status}
              </div>

              {/* Recording link */}
              {call.recording_url && (
                <a
                  href={call.recording_url}
                  download
                  className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  title="Download recording"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}