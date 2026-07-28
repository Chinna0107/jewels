import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Loader, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuthStore();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  // Settings
  const [mode, setMode] = useState('fixed'); // 'fixed' | 'pincode'
  const [fixedPercentage, setFixedPercentage] = useState(5);
  
  // ZIP Codes
  const [zipCodes, setZipCodes] = useState([]);
  const [newZipCode, setNewZipCode] = useState('');
  const [newPercentage, setNewPercentage] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, zipCodesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/settings/shipping`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/admin/shipping-pincodes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!settingsRes.ok || !zipCodesRes.ok) throw new Error('Failed to fetch data');

      const settingsData = await settingsRes.json();
      const zipCodesData = await zipCodesRes.json();

      setMode(settingsData.mode || 'fixed');
      setFixedPercentage(settingsData.fixed_percentage || 5);
      setZipCodes(zipCodesData.zipCodes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const res = await fetch(`${BACKEND_URL}/admin/settings/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mode, fixed_percentage: fixedPercentage })
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      setSuccess('Shipping settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddZipCode = async (e) => {
    e.preventDefault();
    if (!newZipCode || !newPercentage) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch(`${BACKEND_URL}/admin/shipping-pincodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pincode: newZipCode, percentage: parseFloat(newPercentage) })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add pincode');
      
      setZipCodes([data.pincode, ...zipCodes]);
      setNewZipCode('');
      setNewPercentage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZipCode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ZIP code rule?')) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/admin/shipping-pincodes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete pincode');
      
      setZipCodes(zipCodes.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader className="w-8 h-8 text-brand-dark-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue flex items-center gap-2">
            <Package className="w-6 h-6" /> Shipping Settings
          </h1>
          <p className="text-gray-500 mt-1">Configure how shipping fees are calculated at checkout</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2 border border-green-100">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Mode Selection & Fixed Setting */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Shipping Mode</h2>
            
            <div className="space-y-3 mb-6">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'fixed' ? 'border-brand-dark-blue bg-brand-dark-blue/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="fixed" 
                  checked={mode === 'fixed'} 
                  onChange={() => setMode('fixed')}
                  className="text-brand-dark-blue focus:ring-brand-dark-blue"
                />
                <div>
                  <div className="font-semibold text-gray-900">Fixed Percentage</div>
                  <div className="text-xs text-gray-500">Apply a flat % fee to all orders</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${mode === 'pincode' ? 'border-brand-dark-blue bg-brand-dark-blue/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input 
                  type="radio" 
                  name="mode" 
                  value="pincode" 
                  checked={mode === 'pincode'} 
                  onChange={() => setMode('pincode')}
                  className="text-brand-dark-blue focus:ring-brand-dark-blue"
                />
                <div>
                  <div className="font-semibold text-gray-900">ZIP Code Based</div>
                  <div className="text-xs text-gray-500">Calculate fee based on delivery ZIP code</div>
                </div>
              </label>
            </div>

            {/* Fixed Percentage Input */}
            <div className={`transition-opacity duration-300 ${mode === 'fixed' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fixed Shipping Percentage (%)</label>
              <input 
                type="number" 
                min="0"
                step="0.1"
                value={fixedPercentage}
                onChange={(e) => setFixedPercentage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue focus:border-brand-dark-blue outline-none transition-all bg-gray-50"
              />
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-dark-blue text-brand-gold px-4 py-2.5 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </div>

        {/* Right Col: ZIP Code Management */}
        <div className="lg:col-span-2">
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-opacity duration-300 ${mode === 'pincode' ? 'opacity-100' : 'opacity-50'}`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">ZIP Code Rules</h2>
                <p className="text-sm text-gray-500">Define custom shipping percentages for specific zipCodes</p>
              </div>
            </div>

            {/* Add New Form */}
            <form onSubmit={handleAddZipCode} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input 
                type="text" 
                placeholder="ZIP Code (e.g. 500001)"
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                disabled={mode !== 'pincode' || saving}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue focus:border-brand-dark-blue outline-none bg-gray-50"
                required
              />
              <input 
                type="number" 
                placeholder="Percentage (%)"
                min="0"
                step="0.1"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                disabled={mode !== 'pincode' || saving}
                className="w-full sm:w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue focus:border-brand-dark-blue outline-none bg-gray-50"
                required
              />
              <button 
                type="submit"
                disabled={mode !== 'pincode' || saving}
                className="flex items-center justify-center gap-2 bg-brand-dark-blue text-brand-gold px-6 py-2 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </form>

            {/* ZIP Code List */}
            {zipCodes.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">ZIP Code</th>
                      <th className="px-4 py-3">Shipping %</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {zipCodes.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.pincode}</td>
                        <td className="px-4 py-3 text-gray-600">{item.percentage}%</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => handleDeleteZipCode(item.id)}
                            disabled={mode !== 'pincode'}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">No ZIP code rules defined.</p>
                <p className="text-sm text-gray-400 mt-1">Add your first ZIP code rule above to get started.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
