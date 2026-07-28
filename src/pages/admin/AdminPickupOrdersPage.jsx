import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Store, Loader } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminPickupOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { token } = useAuthStore();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter for pickup orders only
      const pickupOrders = data.orders.filter(o => o.order_type === 'pickup');
      setOrders(pickupOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8"><Loader className="w-8 h-8 text-brand-dark-blue animate-spin" /></div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-dark-blue" />
            Store Pickup Orders
          </h1>
          <p className="text-gray-500 mt-1">Manage all orders placed for store pickup</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? orders.map((order) => {
                let address = {};
                try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
                const customerName = order.user_name || address.name || 'Guest';
                const isExpanded = expanded === order.id;

                return (
                  <React.Fragment key={order.id}>
                    <tr 
                      className="hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                    >
                      <td className="px-6 py-4 font-bold text-brand-dark-blue">#{order.order_number || order.id}</td>
                      <td className="px-6 py-4 text-gray-700">{customerName}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${parseFloat(order.total).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50/30 border-b border-gray-100">
                          <p className="text-[10px] font-sans text-[#08183A]/40 uppercase tracking-wider mb-3">Order Items</p>
                          <div className="space-y-3">
                            {(typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])).map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-center">
                                <div className="w-12 h-12 rounded bg-white border border-gray-100 flex items-center justify-center p-1 shrink-0 shadow-sm">
                                  <img src={item.product?.images?.[0] || item.product?.image_url} alt="" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#08183A] truncate">{item.product?.name || 'Unknown Product'}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.variant?.size ? `Size: ${item.variant.size}` : 'Standard'} • Qty: {item.qty}
                                  </p>
                                </div>
                                <div className="text-sm font-bold text-[#D4AF37]">
                                  ${(item.variant?.price || item.product?.price || 0) * item.qty}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700"><strong>Customer Name:</strong> {address.name || order.user_name || 'Guest'}</p>
                            <p className="text-sm text-gray-700"><strong>Mobile:</strong> {address.mobile || order.user_phone || 'N/A'}</p>
                            <p className="text-sm text-gray-700"><strong>Payment Method:</strong> {order.payment_method === 'razorpay' ? 'Online' : order.payment_method}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">No pickup orders found</p>
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
