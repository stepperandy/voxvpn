import React from "react";
import { AlertCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function InsufficientCreditsModal({ isOpen, onClose, currentCredits, requiredCredits, action }) {
  if (!isOpen) return null;

  const shortage = requiredCredits - currentCredits;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Insufficient Credits</h3>
              <p className="text-gray-400 text-xs mt-0.5">You need more credits to continue</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-1">Current</p>
                <p className="text-xl font-bold text-white">${currentCredits.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-gray-600 text-xl">→</div>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-1">Needed</p>
                <p className="text-xl font-bold text-red-400">${requiredCredits.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-red-300 text-sm font-semibold">
                Add ${shortage.toFixed(2)} to {action || 'complete this action'}
              </p>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
            <p className="text-cyan-100 text-xs leading-relaxed">
              💡 <span className="font-semibold">Tip:</span> Buy in bulk to save up to 15% on credits
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <Link
            to="/BuyCredits"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Buy Credits
          </Link>
        </div>
      </div>
    </div>
  );
}