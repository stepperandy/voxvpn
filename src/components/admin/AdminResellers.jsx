import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, X } from 'lucide-react';

export default function AdminResellers() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadResellers();
  }, []);

  const loadResellers = async () => {
    try {
      const data = await base44.entities.Reseller.list('-created_date', 50);
      setResellers(data || []);
    } catch (err) {
      console.error('Failed to load resellers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (resellerId) => {
    setUpdating(resellerId);
    try {
      await base44.functions.invoke('approveReseller', {
        reseller_id: resellerId,
        status: 'approved'
      });
      loadResellers();
    } catch (err) {
      console.error('Failed to approve reseller:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (resellerId) => {
    setUpdating(resellerId);
    try {
      await base44.functions.invoke('approveReseller', {
        reseller_id: resellerId,
        status: 'rejected'
      });
      loadResellers();
    } catch (err) {
      console.error('Failed to reject reseller:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-gray-400">Email</th>
              <th className="text-left py-3 px-4 text-gray-400">Company</th>
              <th className="text-left py-3 px-4 text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-gray-400">Markup %</th>
              <th className="text-left py-3 px-4 text-gray-400">Revenue</th>
              <th className="text-left py-3 px-4 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resellers.map((reseller) => (
              <tr key={reseller.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4">{reseller.email}</td>
                <td className="py-3 px-4">{reseller.company_name}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    reseller.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    reseller.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    reseller.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {reseller.status}
                  </span>
                </td>
                <td className="py-3 px-4">{reseller.markup_percentage}%</td>
                <td className="py-3 px-4 text-cyan-400">${reseller.total_revenue.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {reseller.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(reseller.id)}
                        disabled={updating === reseller.id}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs rounded"
                      >
                        {updating === reseller.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(reseller.id)}
                        disabled={updating === reseller.id}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs rounded"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resellers.length === 0 && (
        <div className="text-center py-8 text-gray-400">No resellers yet</div>
      )}
    </div>
  );
}