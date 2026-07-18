import React from "react";
import { Phone, MessageSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NumberOverview({ numbers = [] }) {
  if (numbers.length === 0) {
    return (
      <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Phone className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-white font-semibold mb-2">No numbers yet</p>
        <p className="text-gray-500 text-sm mb-4">Get started by purchasing your first virtual number</p>
        <Link
          to={createPageUrl("NumberSearch")}
          className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0A192F] px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Browse Numbers
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold">Your Numbers</h3>
        <Link
          to={createPageUrl("NumberSearch")}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Number
        </Link>
      </div>
      <div className="space-y-3">
        {numbers.map((num) => (
          <div key={num.id} className="flex items-center justify-between p-4 bg-gray-900/80 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex-1">
              <p className="text-white font-mono font-bold">{num.phone_number}</p>
              <p className="text-gray-500 text-xs mt-1">{num.country_code} • {num.status || "active"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={createPageUrl(`Inbox?number=${encodeURIComponent(num.phone_number)}`)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-cyan-400 transition-colors"
                title="Open Inbox"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}