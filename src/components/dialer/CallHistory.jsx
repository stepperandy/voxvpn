import React from "react";
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

function formatCallDate(timestamp) {
  const d = new Date(timestamp);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallHistory({ calls }) {
  if (!calls || calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Clock className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 font-medium">No recent calls</p>
        <p className="text-gray-600 text-sm mt-1">Your call history will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {calls.map((call, idx) => {
        const isInbound = call.direction === "inbound";
        const isMissed = call.status === "missed" || call.status === "no-answer";
        const Icon = isMissed ? PhoneMissed : isInbound ? PhoneIncoming : PhoneOutgoing;
        const iconColor = isMissed ? "#f87171" : isInbound ? "#34d399" : "#22d3ee";

        return (
          <div key={idx}
            className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}30` }}>
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-mono font-semibold text-sm ${isMissed ? "text-red-400" : "text-white"}`}>
                {call.number}
              </p>
              <p className="text-gray-500 text-xs mt-0.5 capitalize">
                {isMissed ? "Missed" : isInbound ? "Incoming" : "Outgoing"}
                {call.duration ? ` · ${formatDuration(call.duration)}` : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-400 text-xs">{formatCallDate(call.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}