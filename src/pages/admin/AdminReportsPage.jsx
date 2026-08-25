import React, { useEffect, useState } from "react";
import { Download, TrendingUp, DollarSign, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export function AdminReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Simulate fetching reports by just calling dashboard stats for now
    fetch(`${BACKEND_URL}/admin/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const convertToCSV = (objArray) => {
    if (!objArray || objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';
    
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ',';
        let val = array[i][index];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        line += val;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const downloadCSV = (csvStr, filename) => {
    if (!csvStr) return alert("No data available for this report.");
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [downloading, setDownloading] = useState(false);

  const downloadReport = async (type) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDownloading(true);
    try {
      let endpoint = '';
      if (type === 'revenue' || type === 'orders') endpoint = '/admin/orders';
      else if (type === 'products') endpoint = '/admin/products';
      else if (type === 'customers') endpoint = '/admin/users';
      else if (type === 'coupons') endpoint = '/admin/coupons';

      const res = await fetch(`${BACKEND_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      
      const safeParse = (str) => { try { return JSON.parse(str) || {}; } catch { return {}; } };
      const parseArray = (str) => { try { const a = JSON.parse(str); return Array.isArray(a) ? a : []; } catch { return []; } };

      let arr = [];
      if (type === 'revenue' || type === 'orders') {
        if (data.orders) {
          arr = data.orders.map(o => {
            const addr = safeParse(o.address);
            const items = parseArray(o.items);
            return {
              'Order ID': o.id,
              'Order Number': o.order_number || '',
              'Date': new Date(o.created_at).toLocaleString(),
              'Customer Name': o.user_name || (addr.firstName ? addr.firstName + ' ' + (addr.lastName || '') : ''),
              'Customer Email': o.user_email || addr.email || '',
              'Customer Phone': addr.mobile || '',
              'Status': o.status,
              'Order Type': o.order_type,
              'Total Amount': o.total,
              'Discount Amount': o.discount_amount || 0,
              'Coupon Code': o.coupon_code || '',
              'Shipping Fee': o.shipping_fee || 0,
              'Tax Amount': o.tax_amount || 0,
              'Payment Method': o.payment_method || '',
              'Address': addr.address ? `${addr.address}, ${addr.city}, ${addr.state}, ${addr.zipCode}, ${addr.country}` : '',
              'Item Count': items.length
            };
          });
        }
      } else if (type === 'products') {
        if (data.products) {
          arr = data.products.map(p => {
            const sizes = parseArray(p.sizes);
            const variants = parseArray(p.variants);
            let priceStr = '';
            if (variants.length > 0 && variants[0].sizes && variants[0].sizes.length > 0) {
              priceStr = variants[0].sizes[0].our_price || variants[0].sizes[0].price;
            } else if (sizes.length > 0) {
              priceStr = sizes[0].our_price || sizes[0].price;
            }
            return {
              'Product ID': p.id,
              'Product Code': p.product_code || '',
              'Name': p.name,
              'Category': p.category || '',
              'Model': p.model || '',
              'Color': p.color || '',
              'Price': priceStr || '',
              'Stock': p.stock || 0,
              'Active': p.is_active ? 'Yes' : 'No',
              'Bestseller': p.is_bestseller ? 'Yes' : 'No',
              'Trending': p.is_trending ? 'Yes' : 'No',
              'Date Added': new Date(p.created_at).toLocaleDateString()
            };
          });
        }
      } else if (type === 'customers') {
        if (data.users) {
          arr = data.users.map(u => ({
            'User ID': u.id,
            'Name': u.name,
            'Email': u.email,
            'Phone': u.phone || '',
            'Country': u.country || '',
            'Role': u.role,
            'Email Verified': u.email_verified ? 'Yes' : 'No',
            'Phone Verified': u.phone_verified ? 'Yes' : 'No',
            'Joined Date': new Date(u.created_at).toLocaleString()
          }));
        }
      } else if (type === 'coupons') {
        if (data.coupons) {
          arr = data.coupons.map(c => ({
            'Coupon ID': c.id,
            'Code': c.code,
            'Discount': c.discount_value + (c.discount_type === 'percentage' ? '%' : ' flat'),
            'Min Order Value': c.min_order_value || 0,
            'Min Qty': c.min_qty || 0,
            'Usage Type': c.usage_type || 'multiple',
            'Min Type': c.min_type || 'value',
            'Active': c.is_active ? 'Yes' : 'No',
            'Created At': new Date(c.created_at).toLocaleDateString(),
            'Expires At': c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'
          }));
        }
      }
      
      const csvStr = convertToCSV(arr);
      downloadCSV(csvStr, `${type}_report_${new Date().toISOString().slice(0,10)}.csv`);
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#08183A]">Reports & Analytics</h1>
        <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">Download data and view store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#08183A]/10 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 text-amber-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-sans text-[#08183A]/50 uppercase tracking-wider font-semibold">Total Revenue</p>
              <p className="text-xl font-serif font-bold text-[#08183A]">${stats?.totalRevenue || 0}</p>
            </div>
          </div>
          <button onClick={() => downloadReport('revenue')} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FDF8F0] text-[#08183A] py-2 rounded-xl text-sm font-semibold hover:bg-[#08183A]/10 transition-colors">
            <Download className="w-4 h-4" /> Download Sales Report
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#08183A]/10 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-sans text-[#08183A]/50 uppercase tracking-wider font-semibold">Total Orders</p>
              <p className="text-xl font-serif font-bold text-[#08183A]">{stats?.totalOrders || 0}</p>
            </div>
          </div>
          <button onClick={() => downloadReport('orders')} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FDF8F0] text-[#08183A] py-2 rounded-xl text-sm font-semibold hover:bg-[#08183A]/10 transition-colors">
            <Download className="w-4 h-4" /> Download Orders Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#08183A]/10 p-5 shadow-sm">
        <h3 className="font-serif font-bold text-[#08183A] mb-4">Export Data Center</h3>
        <div className="space-y-3">
          {[
            { title: "Products Inventory", desc: "Download full list of products, stock, and pricing", type: "products" },
            { title: "Customer Database", desc: "Download registered users and their details", type: "customers" },
            { title: "Coupon Usage", desc: "Download history of used discount codes", type: "coupons" }
          ].map((report, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FDF8F0] border border-[#08183A]/5">
              <div>
                <p className="font-sans font-bold text-[#08183A]">{report.title}</p>
                <p className="text-xs text-[#08183A]/50">{report.desc}</p>
              </div>
              <button onClick={() => downloadReport(report.type)} className="flex items-center justify-center gap-2 bg-white border border-[#08183A]/20 text-[#08183A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#08183A] hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
