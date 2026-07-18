import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function AdminPricing() {
  const [esimProducts, setEsimProducts] = useState([]);
  const [virtualNumbers, setVirtualNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const [esims, numbers] = await Promise.all([
        base44.entities.ESimProduct.list('-created_date', 50),
        base44.entities.VirtualNumber.list('-created_date', 50)
      ]);
      setEsimProducts(esims || []);
      setVirtualNumbers(numbers || []);
    } catch (err) {
      console.error('Failed to load pricing:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  return (
    <div className="space-y-8">
      {/* eSIM Pricing */}
      <div>
        <h3 className="text-xl font-bold mb-4">TELNA eSIM Pricing</h3>
        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400">Country</th>
                <th className="text-left py-3 px-4 text-gray-400">Plan</th>
                <th className="text-left py-3 px-4 text-gray-400">Data/Duration</th>
                <th className="text-left py-3 px-4 text-gray-400">Price</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {esimProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4">{product.country}</td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.data_gb}GB / {product.duration_days} days</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Virtual Number Pricing */}
      <div>
        <h3 className="text-xl font-bold mb-4">TELNYX Virtual Number Pricing</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-gray-400">
          <p className="text-sm">Virtual numbers pricing is managed via Stripe products:</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• US Virtual Number: $4.99/month</li>
            <li>• Canada Virtual Number: $5.99/month</li>
            <li>• UK Virtual Number: $6.99/month</li>
            <li>• Australia Virtual Number: $7.99/month</li>
          </ul>
          <p className="text-xs mt-4 text-gray-500">Edit prices in Stripe dashboard</p>
        </div>
      </div>
    </div>
  );
}