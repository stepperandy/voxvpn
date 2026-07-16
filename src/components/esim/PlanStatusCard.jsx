import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PlanStatusCard({ esim }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const expirationDate = esim.expiration_date ? new Date(esim.expiration_date) : null;
  const isExpiringSoon = expirationDate && (expirationDate.getTime() - Date.now()) < (7 * 24 * 60 * 60 * 1000);

  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-semibold">Status</p>
        <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${getStatusColor(esim.status)}`}>
          {getStatusIcon(esim.status)}
          {esim.status?.charAt(0).toUpperCase() + esim.status?.slice(1) || 'Unknown'}
        </span>
      </div>

      {expirationDate && (
        <>
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-1">Expiration</p>
            <p className="text-sm font-semibold text-white">{expirationDate.toLocaleDateString()}</p>
            <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-orange-400' : 'text-gray-500'}`}>
              {isExpiringSoon ? '⚠️ ' : ''}{formatDistanceToNow(expirationDate, { addSuffix: true })}
            </p>
          </div>
        </>
      )}

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-gray-400 mb-1">Price Paid</p>
        <p className="text-lg font-bold text-cyan-400">${esim.price_paid?.toFixed(2) || '0.00'}</p>
      </div>
    </div>
  );
}