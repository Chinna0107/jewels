import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Loader, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuthStore();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
  const getToken = () => useAuthStore.getState().token || localStorage.getItem('token');

  // Shipping
  const [flatShippingRate, setFlatShippingRate] = useState(0);
  const [savingShipping, setSavingShipping] = useState(false);

  // Tax
  const [taxMode, setTaxMode] = useState('flat'); // 'flat' | 'pincode'
  const [flatTaxPercentage, setFlatTaxPercentage] = useState(0);
  const [savingTax, setSavingTax] = useState(false);

  // Pincode rules
  const [pincodes, setPincodes] = useState([]);
  const [newPincode, setNewPincode] = useState('');
  const [newPercentage, setNewPercentage] = useState('');
  const [savingPincode, setSavingPincode] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const shippingRes = await fetch(`${BACKEND_URL}/general/shipping`);
      const shippingData = shippingRes.ok ? await shippingRes.json() : {};
      const s = shippingData.settings || {};
      setFlatShippingRate(s.flat_rate ?? 0);
      setTaxMode(s.tax_mode || 'flat');
      setFlatTaxPercentage(s.tax_percentage ?? 0);
      setPincodes(shippingData.pincodes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const handleSaveShipping = async () => {
    setSavingShipping(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ flat_rate: Number(flatShippingRate) })
      });
      if (!res.ok) throw new Error('Failed to save');
      showSuccess('Shipping rate saved');
    } catch (err) { setError(err.message); }
    finally { setSavingShipping(false); }
  };

  const handleSaveTax = async () => {
    setSavingTax(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/settings/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ tax_mode: taxMode, tax_percentage: Number(flatTaxPercentage) })
      });
      if (!res.ok) throw new Error('Failed to save');
      showSuccess('Tax settings saved');
    } catch (err) { setError(err.message); }
    finally { setSavingTax(false); }
  };

  const handleAddPincode = async (e) => {
    e.preventDefault();
    if (!newPincode || !newPercentage) return;
    setSavingPincode(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/shipping-pincodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ pincode: newPincode, percentage: parseFloat(newPercentage) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      setPincodes([data.pincode, ...pincodes]);
      setNewPincode('');
      setNewPercentage('');
    } catch (err) { setError(err.message); }
    finally { setSavingPincode(false); }
  };

  const handleDeletePincode = async (id) => {
    if (!window.confirm('Delete this pincode rule?')) return;
    try {
      await fetch(`${BACKEND_URL}/admin/shipping-pincodes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPincodes(pincodes.filter(p => p.id !== id));
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader className="w-8 h-8 text-brand-dark-blue animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark-blue flex items-center gap-2">
          <Package className="w-6 h-6" /> Shipping & Tax Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure shipping fee and tax applied at checkout</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2 border border-green-100">
          <Check className="w-5 h-5 shrink-0" /><p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Shipping Flat Rate */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Flat Shipping Fee</h2>
        <p className="text-sm text-gray-500 mb-5">Fixed ₹ amount added to every delivery order at checkout.</p>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Fee (₹)</label>
            <input
              type="number" min="0" value={flatShippingRate}
              onChange={e => setFlatShippingRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50"
            />
          </div>
          <button onClick={handleSaveShipping} disabled={savingShipping}
            className="flex items-center gap-2 bg-brand-dark-blue text-brand-gold px-5 py-2.5 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {savingShipping ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tax Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tax Settings</h2>
        <p className="text-sm text-gray-500 mb-5">Choose how tax is calculated — flat % on all orders or per pincode.</p>

        {/* Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTaxMode('flat')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border transition-all ${taxMode === 'flat' ? 'bg-brand-dark-blue text-brand-gold border-brand-dark-blue' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            Flat % (All Orders)
          </button>
          <button
            onClick={() => setTaxMode('pincode')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border transition-all ${taxMode === 'pincode' ? 'bg-brand-dark-blue text-brand-gold border-brand-dark-blue' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            Pincode Based
          </button>
        </div>

        {taxMode === 'flat' && (
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Percentage (%)</label>
              <input
                type="number" min="0" step="0.1" value={flatTaxPercentage}
                onChange={e => setFlatTaxPercentage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50"
              />
              <p className="text-xs text-gray-400 mt-1">Applied on subtotal after coupon discount</p>
            </div>
            <button onClick={handleSaveTax} disabled={savingTax}
              className="flex items-center gap-2 bg-brand-dark-blue text-brand-gold px-5 py-2.5 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingTax ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        {taxMode === 'pincode' && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button onClick={handleSaveTax} disabled={savingTax}
                className="flex items-center gap-2 bg-brand-dark-blue text-brand-gold px-5 py-2.5 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50">
                <Save className="w-4 h-4" /> {savingTax ? 'Saving...' : 'Save Mode'}
              </button>
            </div>
            <p className="text-sm text-gray-500">Tax % is looked up by the customer's delivery pincode. If no rule matches, 0% tax is applied.</p>

            {/* Add pincode form */}
            <form onSubmit={handleAddPincode} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" placeholder="Pincode (e.g. 500001)" value={newPincode}
                onChange={e => setNewPincode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50"
                required
              />
              <input
                type="number" placeholder="Tax %" min="0" step="0.1" value={newPercentage}
                onChange={e => setNewPercentage(e.target.value)}
                className="w-full sm:w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-dark-blue outline-none bg-gray-50"
                required
              />
              <button type="submit" disabled={savingPincode}
                className="flex items-center justify-center gap-2 bg-brand-dark-blue text-brand-gold px-5 py-2 rounded-xl font-bold hover:bg-brand-dark-blue/90 transition-all disabled:opacity-50 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </form>

            {/* Pincode list */}
            {pincodes.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Pincode</th>
                      <th className="px-4 py-3">Tax %</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pincodes.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.pincode}</td>
                        <td className="px-4 py-3 text-gray-600">{item.percentage}%</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeletePincode(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">No pincode rules yet.</p>
                <p className="text-sm text-gray-400 mt-1">Add rules above to apply tax by pincode.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
