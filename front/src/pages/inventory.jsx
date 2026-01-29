import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/inventory.css';

const Inventory = () => {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [orderMessage, setOrderMessage] = useState('');
  
  // Performance & Visual Alert States (Requirement: 1s Threshold [cite: 53])
  const [responseTime, setResponseTime] = useState(0);
  const [isLatent, setIsLatent] = useState(false);
  
  // Health States (Requirement: Downstream Dependency Checking [cite: 51, 52])
  const [healthStatus, setHealthStatus] = useState({ order: 'checking', inventory: 'checking' });

  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  // --- HEALTH MONITORING (Requirement: Visual Alerting [cite: 49]) ---
  const checkHealth = useCallback(async () => {
    try {
      const [orderRes, invRes] = await Promise.all([
        axios.get('http://localhost:3003/api/orders/health').catch(() => ({ data: { status: 'offline' } })),
        axios.get('http://localhost:3002/api/inventory/health').catch(() => ({ data: { status: 'offline' } }))
      ]);

      setHealthStatus({
        order: orderRes.data.status === 'healthy' ? 'Operational' : 'Critical',
        inventory: invRes.data.status === 'healthy' ? 'Operational' : 'Critical'
      });
    } catch (err) {
      console.error("Health monitoring failed", err);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Polling for live status [cite: 40]
    return () => clearInterval(interval);
  }, [checkHealth]);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3002/api/inventory');
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- ORDER LOGIC (Requirement: Gremlin Resilience & Visual Alerts [cite: 29, 33, 53]) ---
  const placeOrder = async (product) => {
    const startTime = performance.now();
    setOrderMessage(`Processing order for ${product.product_name}...`);
    
    try {
      // 3.5s timeout to catch "Gremlin Latency" [cite: 26, 31]
      const res = await axios.post('http://localhost:3003/api/orders/create', {
        user_id: 1, 
        product_id: product.id,
        quantity: 1,
        price_per_unit: product.price
      }, { timeout: 3500 });

      const duration = (performance.now() - startTime) / 1000;
      setResponseTime(duration.toFixed(2));
      
      // Visual Alert: Turn RED if > 1 second [cite: 53]
      setIsLatent(duration > 1);
      setOrderMessage(`✅ Success: ${res.data.message} (${duration.toFixed(2)}s)`);
    } catch (err) {
      setIsLatent(true); 
      if (err.code === 'ECONNABORTED') {
        setOrderMessage('⚠️ Gremlin Detected: Inventory Service timed out.');
      } else {
        setOrderMessage('❌ Schrödinger\'s Crash: Partial failure detected[cite: 63, 64].');
      }
    }
    setTimeout(() => setOrderMessage(''), 5000);
  };

  const handleSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncStatus('syncing');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3002/api/inventory/sync-product', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setSyncStatus('success');
    } catch (err) {
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="inventory-container app-container text-slate-200">
      <div className="relative z-10 max-w-7xl mx-auto py-10 px-6">
        
        {/* HEADER & MONITORING DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Valerix Core
            </h1>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Resilient Microservice Gateway [cite: 15, 22]
            </p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Latency Alert Component (Requirement: 1s Red/Green Switch [cite: 53]) */}
            <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border backdrop-blur-xl transition-colors ${isLatent ? 'border-red-500/50 bg-red-500/10' : 'border-emerald-500/50 bg-emerald-500/10'}`}>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Response</p>
                <p className={`font-mono font-bold ${isLatent ? 'text-red-400' : 'text-emerald-400'}`}>{responseTime}s</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${isLatent ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
            </div>

            {/* Health Status (Requirement: Sophisticated Health Checking [cite: 49, 50]) */}
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50">
                <p className="text-[10px] uppercase text-slate-500">Order Svc</p>
                <p className={`text-xs font-bold ${healthStatus.order === 'Operational' ? 'text-emerald-400' : 'text-red-400'}`}>{healthStatus.order}</p>
              </div>
              <div className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/50">
                <p className="text-[10px] uppercase text-slate-500">Inv Svc</p>
                <p className={`text-xs font-bold ${healthStatus.inventory === 'Operational' ? 'text-emerald-400' : 'text-red-400'}`}>{healthStatus.inventory}</p>
              </div>
            </div>

            <button onClick={() => navigate('/create-product')} className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20">
              Create Product
            </button>
          </div>
        </div>

        {/* NOTIFICATION WINDOW (Requirement: User-friendly messages [cite: 31, 33]) */}
        {orderMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-800 border border-blue-500/30 text-center text-sm font-semibold shadow-xl animate-in fade-in slide-in-from-top-4">
            {orderMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SYNC FORM (Legacy Asset Input [cite: 13]) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700 rounded-3xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="text-blue-400">📦</span> New Asset
              </h2>
              <form onSubmit={handleSync} className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 focus:border-blue-500 outline-none transition-all"
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Price" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 outline-none" onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  <input type="number" placeholder="Stock" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 outline-none" onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <button disabled={loading} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:brightness-110 transition-all shadow-lg shadow-blue-900/40">
                  {loading ? 'SYNCING...' : 'SYNC TO ORDERS'}
                </button>
              </form>
            </div>
          </div>

          {/* INVENTORY TABLE (Requirement: Minimal Human Window [cite: 75, 76]) */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-bold text-lg">Active Inventory Monitor</h3>
                <span className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  Live Data Flow [cite: 41]
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-700/50">
                      <th className="px-8 py-5">Asset</th>
                      <th className="px-8 py-5">Value</th>
                      <th className="px-8 py-5">Stock</th>
                      <th className="px-8 py-5 text-center">Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {products.map(p => (
                      <tr key={p.sku} className="hover:bg-blue-500/5 transition-colors">
                        <td className="px-8 py-5 font-bold text-white">{p.product_name}</td>
                        <td className="px-8 py-5 font-mono text-sm text-slate-400">${p.price}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(p.quantity, 100)}%` }}></div>
                            </div>
                            <span className="text-xs font-mono">{p.quantity}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button 
                            onClick={() => placeOrder(p)} 
                            className="px-5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/40 text-blue-400 text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                          >
                            Place Order [cite: 59, 60]
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Inventory;