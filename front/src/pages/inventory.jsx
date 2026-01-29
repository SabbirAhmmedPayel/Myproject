import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, RefreshCcw, DollarSign, Database, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  const handleSync = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSyncStatus('syncing');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:3002/auth/sync-product', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSyncStatus('success');
        // Refresh list logic here
      }
    } catch (err) {
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1629] to-[#1a1f3a] text-slate-100 p-8 font-sans relative overflow-hidden">

      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h1 className="text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Valerix Core
                  </span>
                </h1>
              </div>
              <p className="text-slate-400 text-sm ml-14 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Premium Inventory Management System
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-cyan-400" size={20} />
                  <div>
                    <p className="text-xs text-slate-400">System Status</p>
                    <p className="text-sm font-semibold text-cyan-400">Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Input Card - Premium Design */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden">

              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-blue-500/20 p-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Package size={20} className="text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    New Asset
                  </span>
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleSync} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
                      Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl pl-11 pr-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-3 relative overflow-hidden group ${syncStatus === 'success'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
                    } text-white`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  {loading ? (
                    <RefreshCcw className="animate-spin" size={20} />
                  ) : (
                    <Database size={20} />
                  )}
                  <span className="relative z-10">
                    {syncStatus === 'success' ? 'Successfully Synced' : 'Sync to Orders'}
                  </span>
                </button>
              </form>
            </div>

            {/* Stats Card */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-400" size={16} />
                  <p className="text-xs text-slate-400 font-semibold">Total Value</p>
                </div>
                <p className="text-2xl font-bold text-white">$124.5K</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-transparent backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-cyan-400" size={16} />
                  <p className="text-xs text-slate-400 font-semibold">Items</p>
                </div>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
            </div>
          </div>

          {/* Inventory Monitor - Premium Table */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20">

              {/* Table Header */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Active Inventory
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs text-cyan-400 font-semibold">Live</span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-400">
                        Asset Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-400">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-400">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-blue-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {/* Sample Rows */}
                    <tr className="hover:bg-blue-500/5 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                            <Package size={18} className="text-blue-400" />
                          </div>
                          <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            Neural Link V2
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-300 font-mono text-sm">$2,499.00</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                          </div>
                          <span className="font-mono text-sm text-slate-400">42</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          In Sync
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-blue-500/5 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                            <Package size={18} className="text-blue-400" />
                          </div>
                          <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            Quantum Processor X1
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-300 font-mono text-sm">$4,299.00</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                          </div>
                          <span className="font-mono text-sm text-slate-400">28</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          In Sync
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-blue-500/5 transition-all duration-300 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                            <Package size={18} className="text-blue-400" />
                          </div>
                          <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            Holographic Display Pro
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-slate-300 font-mono text-sm">$1,899.00</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                          </div>
                          <span className="font-mono text-sm text-slate-400">67</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          In Sync
                        </span>
                      </td>
                    </tr>
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