import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SingleProduct({ product }) {
  const navigate = useNavigate();
  const id = product.id || product.product_id || product.sku;

  return (
    <div className="bg-slate-900/50 border border-slate-700/40 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
            <span className="text-white">📦</span>
          </div>
          <div>
            <div className="font-semibold text-white">{product.product_name || product.name || 'Unnamed'}</div>
            <div className="text-sm text-slate-400">ID: {id}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-300 font-mono">${Number(product.price || product.price_per_unit || 0).toFixed(2)}</div>
          <div className="text-xs text-slate-400">Stock: {product.quantity ?? product.stock ?? 0}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => navigate('/checkout', { state: { product } })}
          className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold"
        >
          Checkout
        </button>
        <button
          onClick={() => navigate('/create-product')}
          className="bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded text-sm font-semibold"
        >
          Create
        </button>
      </div>
    </div>
  );
}
