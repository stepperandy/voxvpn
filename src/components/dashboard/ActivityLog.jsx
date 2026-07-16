import React from "react";
import { Phone, MessageSquare, Download, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const activityIcons = {
  call: Phone,
  sms: MessageSquare,
  inbound: Download,
  outbound: Upload,
};

export default function ActivityLog({ messages = [], maxItems = 8 }) {
  const recentActivity = messages.slice(0, maxItems);

  if (recentActivity.length === 0) {
    return (
      <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl p-6">
        <h3 className="text-white font-bold mb-6">Recent Activity</h3>
        <p className="text-gray-500 text-center py-8">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-white font-bold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {recentActivity.map((item, idx) => {
          const Icon = activityIcons[item.direction] || MessageSquare;
          const isInbound = item.direction === "inbound";
          
          return (
            <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-800/50 last:border-0 last:pb-0">
              <div className={`p-2.5 rounded-lg ${isInbound ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                <Icon className={`w-4 h-4 ${isInbound ? "text-green-400" : "text-blue-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {isInbound ? "Received" : "Sent"}: {item.body || "Message"}
                </p>
                <p className="text-gray-500 text-xs">
                  {item.from_number} → {item.to_number}
                </p>
              </div>
              <span className="text-gray-600 text-xs whitespace-nowrap">
                {item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : "Now"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}