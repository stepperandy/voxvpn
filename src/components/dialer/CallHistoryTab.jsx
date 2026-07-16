import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, PhoneOff, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CallHistoryTab({ onSelectNumber }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        const callNotes = await base44.entities.CallNote.filter({
          user_email: u.email,
        }, '-created_date', 50);
        
        setCalls(callNotes || []);
      } catch (err) {
        console.error('Error fetching call history:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="p-4 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-2 max-h-96 overflow-auto">
      {calls.length === 0 ? (
        <p className="p-4 text-slate-400 text-sm">No call history</p>
      ) : (
        calls.map((call) => (
          <button
            key={call.id}
            onClick={() => onSelectNumber(call.phone_number)}
            className="w-full p-3 bg-slate-700/30 hover:bg-slate-700 rounded-lg text-left transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-white">{call.phone_number}</p>
                {call.notes && <p className="text-xs text-slate-400">{call.notes}</p>}
              </div>
              <div className="text-xs text-slate-500">
                {call.created_date && formatDistanceToNow(new Date(call.created_date), { addSuffix: true })}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}