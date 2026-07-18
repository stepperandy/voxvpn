import React from "react";
import { Mail, ArrowRight } from "lucide-react";

export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Delete Your Account</h1>
            <p className="text-gray-400">To delete your VoxDigits account, please contact our support team.</p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 space-y-4">
            <p className="text-white font-semibold text-lg">Email us at:</p>
            
            <a
              href="mailto:support@voxtelefony.com?subject=Delete%20my%20VoxDigits%20account"
              className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cyan-400 font-semibold">support@voxtelefony.com</p>
                <p className="text-gray-500 text-sm">Click to open your email client</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
            </a>

            <div className="space-y-3 pt-4 border-t border-gray-700">
              <p className="text-white text-sm font-semibold">Include in your email:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-semibold flex-shrink-0">Subject:</span>
                  <span className="text-gray-300">Delete my VoxDigits account</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-semibold flex-shrink-0">Include:</span>
                  <span className="text-gray-300">Your registered phone number or email address</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-6 space-y-4">
            <p className="text-blue-400 font-semibold flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              What happens next
            </p>
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">Your account and personal data will be deleted within <span className="font-semibold text-white">7 days</span>.</p>
              <p className="text-gray-400">Some transaction logs may be retained for security and legal compliance.</p>
            </div>
          </div>

          {/* Contact note */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              Our support team will confirm the deletion and answer any questions you may have.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}