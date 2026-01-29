import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateProduct() {
  const [form, setForm] = useState({ product_name: '', sku: '', price: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3002/api/inventory/sync-product', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/inventory');
    } catch (err) {
      console.error('Create product failed', err.message);
      alert('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input required placeholder="Product name" value={form.product_name} onChange={e=>setForm({...form, product_name: e.target.value})} className="w-full p-2 bg-slate-800 text-white rounded" />
        <input required placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} className="w-full p-2 bg-slate-800 text-white rounded" />
        <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} className="w-full p-2 bg-slate-800 text-white rounded" />
        <input placeholder="Quantity" type="number" value={form.quantity} onChange={e=>setForm({...form, quantity: e.target.value})} className="w-full p-2 bg-slate-800 text-white rounded" />
        <div>
          <button disabled={loading} className="px-4 py-2 bg-emerald-500 rounded text-white">{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}
