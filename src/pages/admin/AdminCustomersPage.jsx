import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${BACKEND_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setCustomers(d.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => 
    !search || 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A]">Customers</h1>
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">{customers.length} total users</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08183A]/40" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers by name, email, or phone..."
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-[#08183A]/10 text-[#08183A] font-sans text-sm focus:outline-none focus:border-[#08183A]/30 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-[#08183A]/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[600px]">
            <thead>
              <tr className="bg-[#FDF8F0] text-[#08183A]/60 text-xs uppercase tracking-wider border-b border-[#08183A]/10">
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Name</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Contact</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Role</th>
                <th className="text-left py-4 px-4 sm:px-6 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08183A]/5">
              {filtered.map((customer, i) => (
                <motion.tr key={customer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-[#FDF8F0]/50 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#08183A]/10 flex items-center justify-center text-[#08183A] font-bold">
                        {(customer.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#08183A]">{customer.name || "Unknown User"}</p>
                        {customer.is_verified ? (
                          <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit mt-0.5">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit mt-0.5">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#08183A]/70">
                      <Mail className="w-3.5 h-3.5" /> {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-[#08183A]/70">
                        <Phone className="w-3.5 h-3.5" /> {customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      customer.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {customer.role || "user"}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs text-[#08183A]/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(customer.created_at).toLocaleDateString("en-IN")}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#08183A]/50">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
