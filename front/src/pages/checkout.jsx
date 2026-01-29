import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { state } = useLocation();
  const product = state?.product || {};
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId') || null;
      const body = {
        user_id: userId,
        product_id: product.id || product.product_id || product.sku,
        quantity,
        price_per_unit: Number(product.price || product.price_per_unit || 0)
      };
      await axios.post('http://localhost:3003/api/orders/create', body);
      alert('Order placed');
      navigate('/inventory');
    } catch (err) {
      console.error('Order failed', err.message);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <div className="font-semibold">{product.product_name || product.name || 'Product'}</div>
        <div className="text-sm text-slate-400">Price: ${Number(product.price || 0).toFixed(2)}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Quantity</label>
        <input type="number" value={quantity} min={1} onChange={e=>setQuantity(Number(e.target.value))} className="w-full p-2 rounded bg-slate-800 text-white" />
      </div>

      <div>
        <button onClick={handlePlaceOrder} disabled={loading} className="px-4 py-2 bg-blue-600 rounded text-white">{loading ? 'Placing...' : 'Place Order'}</button>
      </div>
    </div>
  );
}
