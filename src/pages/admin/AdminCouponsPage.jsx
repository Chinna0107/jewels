import React, { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Edit2, X, Save, Calendar, ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCoupon, setEditCoupon] = useState(null);
  const [formData, setFormData] = useState({ code: "", discount_type: "percentage", discount_value: 0, min_order_value: 0, expires_at: "", is_active: true, user_id: "all" });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setFormData({ code: "", discount_type: "percentage", discount_value: 0, min_order_value: 0, expires_at: "", is_active: true, user_id: "all" });
    setEditCoupon({});
    setIsNew(true);
  };

  const handleEdit = (coupon) => {
    setFormData({ ...coupon, expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : "", user_id: coupon.user_id || "all" });
    setEditCoupon(coupon);
    setIsNew(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = isNew ? `${BACKEND_URL}/admin/coupons` : `${BACKEND_URL}/admin/coupons/${editCoupon.id}`;
      await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      setEditCoupon(null);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A]">Coupons</h1>
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">Manage discount codes</p>
        </div>
        <button onClick={handleAdd}
          className="flex items-center gap-2 bg-[#08183A] hover:bg-[#D4AF37] text-white px-4 py-2.5 rounded-xl font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search coupons by code..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2 rounded-xl bg-white border border-[#08183A]/10 focus:outline-none focus:border-[#D4AF37]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((coupon, i) => (
          <motion.div key={coupon.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-[#08183A]/10 p-5 shadow-sm relative overflow-hidden">
            {!coupon.is_active && (
              <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl">INACTIVE</div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                <Ticket className="w-4 h-4" />
                <span className="font-bold tracking-wider">{coupon.code}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(coupon)} className="text-[#08183A] hover:bg-[#08183A]/10 p-1.5 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-[#08183A]">
                {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`}
              </p>
              <div className="text-xs text-[#08183A]/60 font-sans space-y-1">
                <p>Min Purchase: ${coupon.min_order_value}</p>
                <p>Customer: {coupon.user_name ? coupon.user_name : 'All Customers'}</p>
                {coupon.expires_at && (
                  <p className="flex items-center gap-1 text-[#08183A]">
                    <Calendar className="w-3.5 h-3.5" /> Expires: {new Date(coupon.expires_at).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {editCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-white border-b border-[#08183A]/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#08183A]">{isNew ? "Add" : "Edit"} Coupon</h2>
              <button onClick={() => setEditCoupon(null)} className="text-[#08183A]/50 hover:text-[#08183A]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Coupon Code</label>
                  <input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none uppercase" />
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Discount Type</label>
                  <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Discount Value</label>
                  <input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Min Purchase ($)</label>
                  <input type="number" value={formData.min_order_value} onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Expires At (Optional)</label>
                  <input type="date" value={formData.expires_at} onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs font-sans font-semibold text-[#08183A]/70 mb-1 block">Assign to Customer</label>
                  <button 
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FDF8F0] border border-[#08183A]/10 focus:outline-none text-left flex justify-between items-center"
                  >
                    <span className="truncate">
                      {formData.user_id === "all" ? "All Customers" : users.find(u => u.id.toString() === formData.user_id?.toString())?.email || "Select Customer"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#08183A]/50 shrink-0" />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-[#08183A]/10 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-[#08183A]/10 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#08183A]/50 shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search name or email..."
                          value={formData.customerSearch || ""}
                          onChange={(e) => setFormData({ ...formData, customerSearch: e.target.value })}
                          className="w-full text-sm focus:outline-none bg-transparent"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, user_id: "all", customerSearch: "" });
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#FDF8F0] transition-colors ${formData.user_id === "all" ? "bg-[#FDF8F0] font-bold" : ""}`}
                        >
                          All Customers
                        </button>
                        {users
                          .filter(u => !formData.customerSearch || u.email.toLowerCase().includes(formData.customerSearch.toLowerCase()) || u.name.toLowerCase().includes(formData.customerSearch.toLowerCase()))
                          .map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, user_id: u.id.toString(), customerSearch: "" });
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-[#FDF8F0] transition-colors truncate ${formData.user_id === u.id.toString() ? "bg-[#FDF8F0] font-bold" : ""}`}
                            >
                              {u.name} ({u.email})
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="coupon_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#08183A]" />
                <label htmlFor="coupon_active" className="text-sm font-sans font-semibold text-[#08183A] cursor-pointer">Active</label>
              </div>
            </div>
            <div className="border-t border-[#08183A]/10 px-6 py-4 flex gap-3">
              <button onClick={() => setEditCoupon(null)} className="flex-1 px-4 py-2 bg-[#FDF8F0] text-[#08183A] rounded-xl font-semibold">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-[#08183A] text-white rounded-xl font-semibold flex justify-center items-center gap-2">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
