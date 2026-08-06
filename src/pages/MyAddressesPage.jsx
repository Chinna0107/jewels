import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, Check, X, Home, Pencil } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Header } from '../components/Header';
import { PhoneInput } from '../components/PhoneInput';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, { getDetails } from 'use-places-autocomplete';

const GOOGLE_MAPS_LIBRARIES = ['places'];

function AddressAutocomplete({ value, onChange, onSelect }) {
  const { ready, value: inputVal, suggestions: { status, data }, setValue, clearSuggestions } = usePlacesAutocomplete({ debounce: 300, defaultValue: value });

  const handleSelect = async (s) => {
    setValue(s.description, false);
    clearSuggestions();
    try {
      const details = await getDetails({ placeId: s.place_id, fields: ['address_components'] });
      const get = (type) => details.address_components?.find(c => c.types.includes(type))?.long_name || '';
      const line1 = `${get('street_number')} ${get('route')}`.trim() || get('premise') || get('sublocality_level_1') || '';
      setValue(line1, false);
      onChange(line1);
      onSelect({
        line1,
        city: get('locality') || get('administrative_area_level_2') || get('postal_town'),
        state: get('administrative_area_level_1'),
        pincode: get('postal_code'),
        country: get('country'),
      });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative">
      <input
        value={inputVal}
        onChange={e => { setValue(e.target.value); onChange(e.target.value); }}
        disabled={!ready}
        placeholder="Start typing your address..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-gray-50"
      />
      {status === 'OK' && data.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {data.map(s => (
            <li key={s.place_id}>
              <button type="button" onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-gold/5 flex items-start gap-2.5 border-b border-gray-50 last:border-0">
                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{s.structured_formatting.main_text}</span>
                  <span className="text-gray-400 text-xs block">{s.structured_formatting.secondary_text}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMPTY_FORM = { name: '', line1: '', line2: '', city: '', state: '', pincode: '', country: '', mobile: '', is_default: false };

function AddressForm({ onClose, onSave, saving, mapsLoaded, initial }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const required = ['name', 'line1', 'city', 'pincode', 'mobile'];

  const validate = () => {
    const e = {};
    required.forEach(f => { if (!form[f]?.trim()) e[f] = true; });
    if (form.mobile && form.mobile.replace(/\D/g, '').length < 7) e.mobile = 'invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  const field = (key, label, opts = {}) => (
    <div className={opts.full ? 'col-span-2' : 'col-span-1'}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
        {label}{required.includes(key) && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {opts.autocomplete && mapsLoaded ? (
        <AddressAutocomplete
          value={form[key]}
          onChange={v => setForm(f => ({ ...f, line1: v }))}
          onSelect={({ line1, city, state, pincode, country }) =>
            setForm(f => ({ ...f, line1: line1 || f.line1, city: city || f.city, state: state || f.state, pincode: pincode || f.pincode, country: country || f.country }))
          }
        />
      ) : (
        <input
          name={key} value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={opts.placeholder || ''}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${errors[key] ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`}
        />
      )}
      {errors[key] && <p className="text-[10px] text-red-500 mt-0.5">{label} is required</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-bold text-gray-900">{initial ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">Fields marked with <span className="text-red-500">*</span> are required</p>

        <div className="grid grid-cols-2 gap-3">
          {field('name', 'Full Name', { full: true })}
          {field('line1', 'Address Line 1', { full: true, autocomplete: true })}
          {field('line2', 'Address Line 2', { full: true, placeholder: 'Apartment, suite, unit (optional)' })}
          {field('city', 'City')}
          {field('state', 'State', { placeholder: 'State (optional)' })}
          {field('pincode', 'ZIP Code')}
          {field('country', 'Country', { placeholder: 'Country (optional)' })}
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
              Mobile Number<span className="text-red-500 ml-0.5">*</span>
            </label>
            <PhoneInput value={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} placeholder="Mobile number" />
            {errors.mobile && (
              <p className="text-[10px] text-red-500 mt-0.5">
                {errors.mobile === 'invalid' ? 'Please enter a valid mobile number' : 'Mobile number is required'}
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2.5 mt-4 cursor-pointer">
          <div onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${form.is_default ? 'bg-brand-gold border-brand-gold' : 'border-gray-300'}`}>
            {form.is_default && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm text-gray-700 font-medium">Set as default address</span>
        </label>

        <button onClick={handleSubmit} disabled={saving}
          className="w-full mt-5 bg-brand-gold text-white font-bold py-3.5 rounded-xl text-sm hover:bg-gray-600 transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : initial ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </div>
  );
}

export function MyAddressesPage() {
  const navigate = useNavigate();
  const { token, addresses, fetchProfile, addAddress, updateAddress, deleteAddress } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
  }, [token]);

  const handleSave = async (data) => {
    setSaving(true);
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditingAddress(null);
  };

  const openEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="My Addresses" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-[#08183A]">Saved Addresses</h2>
          <button onClick={() => { setEditingAddress(null); setShowForm(true); }}
            className="flex items-center gap-2 text-sm font-bold text-white bg-brand-gold px-4 py-2.5 rounded-xl hover:bg-gray-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-blue-300" />
              </div>
              <p className="text-gray-500 font-semibold">No saved addresses</p>
              <p className="text-xs text-gray-400">Add an address for faster checkout</p>
              <button onClick={() => setShowForm(true)}
                className="bg-brand-gold text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                Add Address
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4 text-brand-gold" />
                  </div>
                  <div className="flex-1 pr-20">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                      {addr.is_default && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                      {addr.city}{addr.state ? `, ${addr.state}` : ''} — {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">📞 {addr.mobile}</p>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button onClick={() => openEdit(addr)}
                      className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => deleteAddress(addr.id)}
                      className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <AddressForm
          onClose={() => { setShowForm(false); setEditingAddress(null); }}
          onSave={handleSave}
          saving={saving}
          mapsLoaded={mapsLoaded}
          initial={editingAddress}
        />
      )}
    </div>
  );
}
