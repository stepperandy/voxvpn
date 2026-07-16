import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Pencil, Check, X, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const VIRTUAL_NUMBER_PRICES = [
  { country: "United States 🇺🇸", code: "US", priceId: "price_1TAh18Aj5jZA8C2ys3cUxAGw", price: "$4.99/mo" },
  { country: "Canada 🇨🇦", code: "CA", priceId: "price_1TAh18Aj5jZA8C2yLNaI6U8C", price: "$5.99/mo" },
  { country: "United Kingdom 🇬🇧", code: "GB", priceId: "price_1TAh18Aj5jZA8C2y595fKbQW", price: "$6.99/mo" },
  { country: "Australia 🇦🇺", code: "AU", priceId: "price_1TAh18Aj5jZA8C2yayy9h4k4", price: "$7.99/mo" },
];

export default function AdminPriceControl() {
  const [esimProducts, setEsimProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id, price }
  const [saving, setSaving] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ product_id: "", name: "", country: "", country_code: "", data_gb: "", duration_days: "", price: "", is_active: true });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const prods = await base44.entities.ESimProduct.list("-created_date", 100);
      setEsimProducts(prods || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savePrice = async (product) => {
    setSaving(product.id);
    try {
      const newPrice = parseFloat(editing.price);
      if (isNaN(newPrice) || newPrice <= 0) return;
      await base44.entities.ESimProduct.update(product.id, { price: newPrice });
      setEsimProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice } : p));
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (product) => {
    setSaving(product.id + "toggle");
    try {
      await base44.entities.ESimProduct.update(product.id, { is_active: !product.is_active });
      setEsimProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !product.is_active } : p));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this eSIM product?")) return;
    setSaving(id + "del");
    try {
      await base44.entities.ESimProduct.delete(id);
      setEsimProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const addProduct = async () => {
    if (!newProduct.product_id || !newProduct.name || !newProduct.price) return;
    setAdding(true);
    try {
      const created = await base44.entities.ESimProduct.create({
        ...newProduct,
        data_gb: parseFloat(newProduct.data_gb) || null,
        duration_days: parseFloat(newProduct.duration_days) || null,
        price: parseFloat(newProduct.price),
      });
      setEsimProducts(prev => [created, ...prev]);
      setNewProduct({ product_id: "", name: "", country: "", country_code: "", data_gb: "", duration_days: "", price: "", is_active: true });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-8">

      {/* eSIM Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">eSIM Products & Pricing</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-800/60 border border-gray-700 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-white mb-2">New eSIM Product</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: "product_id", label: "Product ID", placeholder: "e.g. prod_abc123" },
                { key: "name", label: "Plan Name", placeholder: "e.g. Europe 10GB 30 Days" },
                { key: "country", label: "Country/Region", placeholder: "e.g. Europe" },
                { key: "country_code", label: "Country Code", placeholder: "e.g. EU" },
                { key: "data_gb", label: "Data (GB)", placeholder: "e.g. 10", type: "number" },
                { key: "duration_days", label: "Duration (days)", placeholder: "e.g. 30", type: "number" },
                { key: "price", label: "Price (USD)", placeholder: "e.g. 19.99", type: "number" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input
                    type={type || "text"}
                    value={newProduct[key]}
                    onChange={e => setNewProduct(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-600"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={addProduct} disabled={adding} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-gray-950 font-semibold text-sm rounded-lg transition-colors">
                {adding && <Loader2 className="w-4 h-4 animate-spin" />} Add Product
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400">Country</th>
                <th className="text-left py-3 px-4 text-gray-400">Plan</th>
                <th className="text-left py-3 px-4 text-gray-400">Data / Days</th>
                <th className="text-left py-3 px-4 text-gray-400">Price</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-right py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {esimProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No eSIM products found</td></tr>
              ) : esimProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-gray-300">{product.country}</td>
                  <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-gray-400">{product.data_gb ? `${product.data_gb}GB` : "—"} / {product.duration_days ? `${product.duration_days}d` : "—"}</td>
                  <td className="py-3 px-4">
                    {editing?.id === product.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editing.price}
                          onChange={e => setEditing(prev => ({ ...prev, price: e.target.value }))}
                          className="w-20 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button onClick={() => savePrice(product)} disabled={saving === product.id} className="p-1 text-green-400 hover:text-green-300">
                          {saving === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1 text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">${product.price?.toFixed(2)}</span>
                        <button onClick={() => setEditing({ id: product.id, price: product.price })} className="p-1 text-gray-500 hover:text-gray-300">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleActive(product)}
                      disabled={saving === product.id + "toggle"}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.is_active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                      }`}
                    >
                      {saving === product.id + "toggle" ? <Loader2 className="w-3 h-3 animate-spin" /> : product.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {product.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteProduct(product.id)}
                      disabled={saving === product.id + "del"}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded"
                    >
                      {saving === product.id + "del" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Virtual Number Pricing (Stripe-managed) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Virtual Number Pricing (Stripe)</h3>
          <a
            href="https://dashboard.stripe.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:underline"
          >
            Edit in Stripe →
          </a>
        </div>
        <div className="overflow-x-auto bg-gray-900 rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400">Country</th>
                <th className="text-left py-3 px-4 text-gray-400">Price ID</th>
                <th className="text-left py-3 px-4 text-gray-400">Monthly Price</th>
              </tr>
            </thead>
            <tbody>
              {VIRTUAL_NUMBER_PRICES.map(row => (
                <tr key={row.code} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-white font-medium">{row.country}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-400">{row.priceId}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-2">Virtual number prices are managed directly in Stripe. Click "Edit in Stripe" to update them.</p>
      </div>

    </div>
  );
}