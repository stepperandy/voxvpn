import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminBundles() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bundle_type: 'esim',
    name: '',
    description: '',
    base_price: '',
    retail_price: ''
  });

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      const data = await base44.entities.Bundle.list('-created_date', 50);
      setBundles(data || []);
    } catch (err) {
      console.error('Failed to load bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBundle = async (e) => {
    e.preventDefault();
    try {
      await base44.functions.invoke('createBundle', {
        bundle_type: formData.bundle_type,
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        retail_price: parseFloat(formData.retail_price)
      });
      setFormData({ bundle_type: 'esim', name: '', description: '', base_price: '', retail_price: '' });
      setShowForm(false);
      loadBundles();
    } catch (err) {
      console.error('Failed to create bundle:', err);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin" />;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors select-none"
      >
        <Plus className="w-4 h-4" />
        Create Bundle
      </button>

      {showForm && (
        <form onSubmit={handleCreateBundle} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bundle Type</label>
              <Select value={formData.bundle_type} onValueChange={(val) => setFormData({...formData, bundle_type: val})}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esim">eSIM</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Bundle Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Wholesale Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Retail Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.retail_price}
                onChange={(e) => setFormData({...formData, retail_price: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded select-none">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded select-none">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs font-bold text-cyan-400 uppercase">{bundle.bundle_type}</p>
            <h3 className="text-white font-bold mt-2">{bundle.name}</h3>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Wholesale:</span>
                <span className="text-white">${bundle.base_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Retail:</span>
                <span className="text-cyan-400">${bundle.retail_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bundles.length === 0 && (
        <div className="text-center py-8 text-gray-400">No bundles created yet</div>
      )}
    </div>
  );
}