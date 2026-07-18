import React from "react";
import { Clock, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AccountPendingBlock() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Account Pending Activation</h1>
        <p className="text-gray-400 mb-8">
          Your account has been created but is awaiting approval by an administrator.
          You will receive access once your account is activated.
        </p>
        <button
          onClick={() => base44.auth.logout("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}