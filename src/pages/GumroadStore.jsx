import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Package, Loader2, AlertCircle } from "lucide-react";

export default function GumroadStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions.invoke("gumroadProducts", {})
      .then(res => {
        setProducts(res.data.products || []);
      })
      .catch(err => {
        setError(err?.response?.data?.error || err?.data?.error || err?.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a1628]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          <span className="text-purple-200/60 text-sm">Loading products…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a1628] p-6">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-300 text-sm font-medium">{error}</p>
          <p className="text-purple-200/50 text-xs">
            Make sure GUMROAD_ACCESS_TOKEN is set in dashboard settings → environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-7 h-7 text-orange-400" />
            <h1 className="text-2xl md:text-3xl font-bold">Product Offerings</h1>
          </div>
          <p className="text-purple-200/60 text-sm">Browse and purchase our available products.</p>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-purple-300/30 mx-auto mb-3" />
            <p className="text-purple-200/50 text-sm">No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {product.thumbnail_url && (
                  <div className="aspect-video overflow-hidden bg-black/30">
                    <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-purple-200/60 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    {product.price ? (
                      <span className="text-orange-400 font-bold text-xl">
                        ${product.price} <span className="text-xs text-purple-200/40">{product.currency}</span>
                      </span>
                    ) : (
                      <span className="text-purple-200/40 text-sm">—</span>
                    )}
                    {product.short_url && (
                      <a
                        href={product.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full font-bold text-sm transition-all"
                      >
                        Buy <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}