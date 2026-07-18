import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

export default function IncomingCallPopup({ incomingCaller, onAccept, onReject }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (incomingCaller) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [incomingCaller]);

  if (!visible || !incomingCaller) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-emerald-500/30 animate-pulse">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm font-medium">Incoming Call</p>
          <p className="text-white text-2xl font-bold font-mono">{incomingCaller}</p>
          
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={() => {
                onReject();
                setVisible(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 transition flex items-center justify-center shadow-lg"
              title="Reject call"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={() => {
                onAccept();
                setVisible(false);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 transition flex items-center justify-center shadow-lg"
              title="Accept call"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}