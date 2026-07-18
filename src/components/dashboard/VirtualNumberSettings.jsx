import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function VirtualNumberSettings({ virtualNumber, userEmail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white text-left">
          Settings for {virtualNumber}
        </h3>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-6 py-4 border-t border-white/20">
          <p className="text-gray-400 text-sm">Number management settings coming soon.</p>
        </div>
      )}
    </div>
  );
}