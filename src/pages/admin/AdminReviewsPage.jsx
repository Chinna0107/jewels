import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Edit2, X, Save, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const EMPTY = { name: '', rating: 5, review: '', is_active: true };

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | review object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (r) => { setForm({ name: r.name, rating: r.rating, review: r.review, is_active: r.is_active ?? true }); setModal(r); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.review.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const isNew = modal === 'add';
      const url = isNew ? `${BACKEND_URL}/admin/reviews` : `${BACKEND_URL}/admin/reviews/${modal.id}`;
      await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      setModal(null);
      fetchReviews();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchReviews();
  };

  const StarPicker = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={`w-6 h-6 transition-colors ${n <= value ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#D4AF37]" /> Reviews
          </h1>
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">Manage client testimonials shown on the homepage</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#08183A] hover:bg-[#D4AF37] text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#08183A]/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FDF8F0] border-b border-[#08183A]/10">
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Stars</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Review</th>
                <th className="px-4 py-3 text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#08183A]/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#08183A] text-[#D4AF37] flex items-center justify-center font-bold text-sm shrink-0">
                        {r.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-[#08183A] text-sm">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#08183A]/70 max-w-xs">
                    <p className="line-clamp-2">{r.review}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-[#08183A] hover:bg-[#08183A]/10 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-12 text-center text-[#08183A]/50">No reviews yet. Add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#08183A]/10 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#08183A]">{modal === 'add' ? 'Add Review' : 'Edit Review'}</h2>
              <button onClick={() => setModal(null)} className="text-[#08183A]/40 hover:text-[#08183A]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#08183A]/60 uppercase tracking-wider mb-1 block">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#08183A]/60 uppercase tracking-wider mb-2 block">Stars</label>
                <StarPicker value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#08183A]/60 uppercase tracking-wider mb-1 block">Review</label>
                <textarea value={form.review} onChange={e => setForm({ ...form, review: e.target.value })}
                  rows={4} placeholder="Write the review..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none text-sm resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rev_active" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="rev_active" className="text-sm font-semibold text-[#08183A] cursor-pointer">Show on homepage</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#08183A]/10 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-[#08183A] rounded-xl font-semibold hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.review.trim()}
                className="flex-1 px-4 py-2 bg-[#08183A] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#D4AF37] transition-colors">
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
