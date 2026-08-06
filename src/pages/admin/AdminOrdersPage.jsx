import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, Printer, FileText, ExternalLink, X, AlertTriangle, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import logoUrl from '../../assets/logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";
const FROM_ADDRESS = {
  name: "Houra Jewels",
  line1: "1-1-738, Vinayaka temple road",
  city: "Koratla",
  state: "Telangana",
  pincode: "",
  phone: "+91 90326 75205",
};

const SHIPPING_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const PICKUP_STATUSES = ["pending", "processing", "ready for pickup", "pickup completed", "cancelled"];
const STATUSES = [...new Set([...SHIPPING_STATUSES, ...PICKUP_STATUSES])];

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  "ready for pickup": "bg-orange-100 text-orange-700",
  "pickup completed": "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function RefundModal({ order, refunding, refundResult, onConfirm, onClose }) {
  const items = (() => { try { return typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) { return []; } })();
  const orderTotal = parseFloat(order.total) || 0;
  const shipping = Math.max(0, parseFloat(order.shipping_fee) || 0);
  const tax = Math.max(0, parseFloat(order.tax_amount) || 0);
  const itemsTotal = items.reduce((s, i) => s + (i.variant?.price || i.product?.price || 0) * i.qty, 0);
  const derivedExtra = Math.max(0, orderTotal - itemsTotal);
  const shippingDisplay = shipping || (tax ? derivedExtra - tax : derivedExtra);
  const taxDisplay = tax;

  const [mode, setMode] = useState('full'); // 'full' | 'partial'
  const [selectedItems, setSelectedItems] = useState(() => Object.fromEntries(items.map((_, i) => [i, true])));
  const [refundShipping, setRefundShipping] = useState(true);
  const [refundTax, setRefundTax] = useState(true);

  const toggleItem = (idx) => setSelectedItems(p => ({ ...p, [idx]: !p[idx] }));

  const selectedItemsTotal = items.reduce((s, item, idx) =>
    selectedItems[idx] ? s + (item.variant?.price || item.product?.price || 0) * item.qty : s, 0);

  const refundTotal = mode === 'full'
    ? (selectedItemsTotal + (refundShipping ? shippingDisplay : 0) + (refundTax ? taxDisplay : 0))
    : selectedItemsTotal;

  const allSelected = items.every((_, i) => selectedItems[i]);

  const handleConfirm = () => {
    const cancelledItems = items
      .filter((_, idx) => selectedItems[idx])
      .map(item => ({
        productId: item.product?.id,
        variantSize: item.variant?.size || '',
        qty: item.qty,
        price: (item.variant?.price || item.product?.price || 0) * item.qty,
      }));

    const isFullCancel = allSelected && mode === 'full';

    onConfirm({
      breakdown: {
        items: selectedItemsTotal,
        shipping: mode === 'full' && refundShipping ? shippingDisplay : 0,
        tax: mode === 'full' && refundTax ? taxDisplay : 0,
        total: refundTotal,
      },
      cancelledItems: isFullCancel ? null : cancelledItems,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <h2 className="font-serif text-lg font-bold text-[#08183A]">Cancel & Refund</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        {refundResult ? (
          <div className="p-6 text-center">
            {refundResult.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-[#08183A] mb-1">
                  {refundResult.partial ? 'Partial Refund Issued!' : 'Refund Issued!'}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Refund of <strong>${refundResult.amount?.toFixed(2)}</strong> has been sent to the customer.
                  {refundResult.partial && refundResult.remainingItems > 0 && (
                    <span className="block mt-1 text-blue-600 font-medium">{refundResult.remainingItems} item(s) remain active in the order.</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 font-mono">Refund ID: {refundResult.refundId}</p>
                <button onClick={onClose} className="mt-5 w-full bg-[#08183A] text-white font-bold py-2.5 rounded-xl hover:bg-[#08183A]/80 transition-colors">Done</button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="font-bold text-lg text-[#08183A] mb-1">Refund Failed</h3>
                <p className="text-sm text-red-500 mb-4">{refundResult.error}</p>
                <button onClick={onClose} className="w-full bg-gray-100 text-[#08183A] font-bold py-2.5 rounded-xl">Close</button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            <p className="text-sm text-gray-500">Order <strong>#{order.order_number || order.id}</strong> — select what to cancel and refund.</p>

            {/* Mode toggle */}
            <div className="flex gap-2">
              <button onClick={() => setMode('full')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mode === 'full' ? 'bg-[#08183A] text-white border-[#08183A]' : 'bg-white text-[#08183A]/60 border-[#08183A]/20 hover:border-[#08183A]/40'
                }`}>
                Full Order Cancel
              </button>
              <button onClick={() => setMode('partial')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mode === 'partial' ? 'bg-[#08183A] text-white border-[#08183A]' : 'bg-white text-[#08183A]/60 border-[#08183A]/20 hover:border-[#08183A]/40'
                }`}>
                Partial Cancel
              </button>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider">Select Items to Cancel</p>
              {items.map((item, idx) => {
                const price = (item.variant?.price || item.product?.price || 0) * item.qty;
                const img = item.product?.images?.[0] || item.product?.image_url;
                return (
                  <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedItems[idx] ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <input type="checkbox" checked={!!selectedItems[idx]} onChange={() => toggleItem(idx)}
                      className="w-4 h-4 accent-red-600 shrink-0" />
                    {img && <img src={img} alt="" className="w-10 h-10 object-contain rounded-lg border border-gray-100 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#08183A] truncate">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-500">{item.variant?.size || 'Standard'} × {item.qty}</p>
                    </div>
                    <span className="font-bold text-[#08183A] text-sm shrink-0">${price.toFixed(2)}</span>
                  </label>
                );
              })}
            </div>

            {/* Shipping + Tax (only for full cancel mode) */}
            {mode === 'full' && (
              <div className="space-y-2">
                {shippingDisplay > 0 && (
                  <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={refundShipping} onChange={e => setRefundShipping(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                      <span className="text-sm font-bold text-[#08183A]">Shipping Fee</span>
                    </div>
                    <span className="font-bold text-[#08183A]">${shippingDisplay.toFixed(2)}</span>
                  </label>
                )}
                {taxDisplay > 0 && (
                  <label className="flex items-center justify-between p-3 bg-[#FDF8F0] rounded-xl border border-[#08183A]/10 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={refundTax} onChange={e => setRefundTax(e.target.checked)} className="w-4 h-4 accent-[#08183A]" />
                      <span className="text-sm font-bold text-[#08183A]">Tax</span>
                    </div>
                    <span className="font-bold text-[#08183A]">${taxDisplay.toFixed(2)}</span>
                  </label>
                )}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <div>
                <span className="font-bold text-red-700">Total Refund</span>
                {mode === 'partial' && !allSelected && (
                  <p className="text-[10px] text-red-500 mt-0.5">Remaining items stay active</p>
                )}
              </div>
              <span className="font-bold text-red-700 text-lg">${refundTotal.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#08183A] rounded-xl font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleConfirm} disabled={refunding || refundTotal <= 0 || !items.some((_, i) => selectedItems[i])}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {refunding
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  : mode === 'partial' && !allSelected ? 'Cancel Selected & Refund' : 'Cancel Order & Refund'
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tracking, setTracking] = useState({});
  const [shipping, setShipping] = useState({});
  const [refundModal, setRefundModal] = useState(null); // order object
  const [refunding, setRefunding] = useState(false);
  const [refundResult, setRefundResult] = useState(null); // { success, refundId, amount }
  const [ratesModal, setRatesModal] = useState(null); // { orderId, rates }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${BACKEND_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) {
          setOrders(d.orders);
          const t = {};
          d.orders.forEach(o => { t[o.id] = { id: o.tracking_id || "", link: o.tracking_link || "" }; });
          setTracking(t);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    // Intercept cancellation — show refund modal first
    if (status === 'cancelled') {
      const order = orders.find(o => o.id === orderId);
      setRefundModal(order);
      return;
    }
    const token = localStorage.getItem("token");
    await fetch(`${BACKEND_URL}/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const handleRefundAndCancel = async (order, { breakdown, cancelledItems }) => {
    setRefunding(true);
    setRefundResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/admin/orders/${order.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refund_breakdown: breakdown, cancelled_items: cancelledItems })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => {
          if (o.id !== order.id) return o;
          if (data.partial && data.remaining_items > 0) {
            // partial: update items from response isn't available, just update refund info
            return { ...o, refund_id: data.refund_id };
          }
          return { ...o, status: 'cancelled', refund_id: data.refund_id };
        }));
        setRefundResult({ success: true, refundId: data.refund_id, amount: data.amount, partial: data.partial, remainingItems: data.remaining_items });
      } else {
        setRefundResult({ success: false, error: data.error });
      }
    } catch (err) {
      setRefundResult({ success: false, error: err.message });
    } finally {
      setRefunding(false);
    }
  };


  const fetchShippoRates = async (orderId) => {
    const token = localStorage.getItem("token");
    setShipping((p) => ({ ...p, [`shippo_${orderId}`]: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/shippo-rates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch Shippo rates");
      
      setRatesModal({ orderId, rates: data.rates });
    } catch (err) {
      alert(`Shippo Error: ${err.message}`);
    } finally {
      setShipping((p) => ({ ...p, [`shippo_${orderId}`]: false }));
    }
  };

  const purchaseShippoLabel = async (orderId, rateObjectId) => {
    const token = localStorage.getItem("token");
    setShipping((p) => ({ ...p, [`shippo_buy_${orderId}`]: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/admin/orders/${orderId}/shippo-label`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rateObjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Shippo label");
      
      setOrders((prev) => prev.map((o) => o.id === orderId ? { 
        ...o, 
        tracking_number: data.tracking_number, 
        tracking_url: data.tracking_url, 
        shipping_label_url: data.label_url,
        tracking_id: data.tracking_number,
        tracking_link: data.tracking_url,
        status: "shipped" 
      } : o));
      setTracking((p) => ({ ...p, [orderId]: { id: data.tracking_number, link: data.tracking_url } }));
      setRatesModal(null);
      alert(`Shippo label created! Tracking: ${data.tracking_number}`);
    } catch (err) {
      alert(`Shippo Error: ${err.message}`);
    } finally {
      setShipping((p) => ({ ...p, [`shippo_buy_${orderId}`]: false }));
    }
  };

  const notifyWhatsApp = (order) => {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    
    const phone = (order.user_phone || address.mobile || "0000000000").replace(/\D/g, "");
    const t = tracking[order.id];
    const trackMsg = t?.id ? ` Your tracking ID is ${t.id}.${t.link ? ` Track here: ${t.link}` : ""}` : "";
    const msg = encodeURIComponent(`Hi ${order.user_name || address.name || "Customer"}! Your order #${order.order_number || order.id} status is now: *${order.status}*.${trackMsg}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const invoiceHtml = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

    const isPickup = order.order_type === 'pickup';
    const subtotal = items.reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || 0) * item.qty), 0);
    const shippingCost = !isPickup && Number(order.total) - subtotal > 0 ? Number(order.total) - subtotal : 0;
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })
      : '—';

    const rows = items.map((item, idx) => {
      const img = item.product?.images?.[0] || item.product?.image_url || item.image_url || '';
      const code = item.product?.product_code || item.product_code || '';
      return `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#FFFAF9'}">
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;color:#888;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${img ? `<img src="${img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;" />` : `<div style="width:44px;height:44px;background:#FDF8F0;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;"></div>`}
            <div>
              <div style="font-weight:700;color:#222;font-size:9.5pt;">${escapeHtml(item.product?.name || '')}</div>
              ${code ? `<div style="font-size:8pt;color:#b8860b;font-weight:600;margin-top:2px;">#${escapeHtml(code)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${escapeHtml(item.variant?.size || '—')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:600;">$${(item.variant?.price || item.product?.price || 0).toFixed(2)}</td>
      </tr>`;
    }).join('');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.order_number || order.id}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    @page { size: A4; margin: 15mm 12mm 20mm 12mm; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; font-size: 10pt; line-height: 1.4; background: #fff; }
    .print-btn { text-align: center; margin: 20px 0; }
    .print-btn button { padding: 8px 24px; margin: 0 6px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .btn-print { background: #08183A; color: #D4AF37; }
    .btn-dl { background: #D4AF37; color: #08183A; }
    @media print { .print-btn { display: none !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  </style>
</head>
<body>

<table style="width:100%;border-collapse:collapse;border-bottom:3px solid #08183A;padding-bottom:16px;margin-bottom:20px;">
  <tr>
    <td style="vertical-align:middle;width:50%;">
      <img src="${logoUrl}" style="height:64px;width:auto;object-fit:contain;" alt="Houra Jewels" />
    </td>
    <td style="vertical-align:top;text-align:right;">
      <div style="font-size:20pt;font-weight:900;color:#08183A;letter-spacing:-0.5px;">INVOICE</div>
      <div style="font-size:9pt;color:#555;margin-top:6px;line-height:1.7;">
        <strong>Invoice No:</strong> #${escapeHtml(order.order_number || String(order.id))}<br>
        <strong>Date:</strong> ${orderDate}<br>
        <strong>Order Type:</strong> <span style="font-weight:700;color:${isPickup ? '#1d4ed8' : '#059669'};">${isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}</span><br>
        <strong>Status:</strong> ${escapeHtml(order.status)}
      </div>
    </td>
  </tr>
</table>

<table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
  <tr>
    <td style="width:${isPickup ? '100%' : '50%'};vertical-align:top;padding:12px;border:1px solid #e8d5b0;background:#FFFDFD;border-radius:4px;">
      <div style="font-size:9pt;font-weight:700;color:#08183A;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e8d5b0;padding-bottom:5px;margin-bottom:8px;">From</div>
      <div style="font-size:9.5pt;color:#555;line-height:1.6;">
        <strong style="color:#08183A;">Houra Jewels</strong><br>
        Texas, 76227<br>
        Phone: +1 940-465-6563<br>
        Email: support@hourajewels.com
      </div>
    </td>
    ${!isPickup ? `
    <td style="width:4px;"></td>
    <td style="width:50%;vertical-align:top;padding:12px;border:1px solid #e8d5b0;background:#FFFAF9;border-radius:4px;">
      <div style="font-size:9pt;font-weight:700;color:#08183A;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e8d5b0;padding-bottom:5px;margin-bottom:8px;">Ship To</div>
      <div style="font-size:9.5pt;color:#555;line-height:1.6;">
        <strong style="color:#08183A;">${escapeHtml(address.name || '')}</strong><br>
        ${escapeHtml(address.line1 || '')}${address.line2 ? ', ' + escapeHtml(address.line2) : ''}<br>
        ${escapeHtml(address.city || '')}, ${escapeHtml(address.state || '')} ${escapeHtml(address.pincode || '')}<br>
        ${address.mobile ? `<strong>Phone:</strong> ${escapeHtml(address.mobile)}` : ''}
      </div>
    </td>` : ''}
  </tr>
</table>

<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <thead>
    <tr style="background:#08183A;">
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:5%;">#</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:left;width:45%;">Item</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:15%;">Size</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:10%;">Qty</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:right;width:15%;">Price</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<table style="width:100%;border-collapse:collapse;margin-top:8px;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Subtotal</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;width:110px;">$${subtotal.toFixed(2)}</td></tr>
        ${shippingCost > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$${shippingCost.toFixed(2)}</td></tr>` : ''}
        <tr style="background:#FDF8F0;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#08183A;border-top:2px solid #08183A;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#D4AF37;border-top:2px solid #08183A;">$${Number(order.total).toFixed(2)}</td></tr>
      </table>
    </td>
  </tr>
</table>

<div style="margin-top:30px;padding-top:12px;border-top:1px solid #e8d5b0;text-align:center;font-size:8.5pt;color:#999;">
  Thank you for shopping with Houra Jewels! &nbsp;|&nbsp; support@hourajewels.com &nbsp;|&nbsp; +1 940-465-6563
</div>

<div class="print-btn">
  <button class="btn-print" onclick="window.print()">🖨️ Print</button>
  <button class="btn-dl" onclick="window.print()">📥 Download PDF</button>
</div>
</body>
</html>`;
  };

  const openInvoice = (order) => {
    const invoiceWindow = window.open("", "_blank");
    if (invoiceWindow) {
      invoiceWindow.document.open();
      invoiceWindow.document.write(invoiceHtml(order));
      invoiceWindow.document.close();
    }
  };

  const sendInvoiceWhatsApp = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    
    const phone = (order.user_phone || address.mobile || "0000000000").replace(/\D/g, "");
    const itemsText = items.map((i) => `• ${i.product?.name} ×${i.qty} — $${(i.variant?.price || i.product?.price || 0) * i.qty}`).join("\n");
    const msg = encodeURIComponent(
      `Hi ${order.user_name || address.name || 'Customer'}! 🙏 Please find your *Invoice* for Order *#${order.order_number || order.id}* below:\n\n` +
      `*Items:*\n${itemsText}\n\n` +
      `*Total: $${order.total}*\n\n` +
      `Thank you for shopping with Houra Jewels!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const printLabel = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

    const itemRows = items.map((item) => {
      const unitStr = item.variant?.size ? ` (${escapeHtml(item.variant?.size)})` : '';
      return `<div style="display:flex;justify-content:space-between;padding:1.5mm 0;border-bottom:1px solid #eee;">
        <div style="font-size:8pt;font-weight:600;flex:1;padding-right:3mm;">${escapeHtml(item.product?.name)}${unitStr}</div>
        <div style="font-size:8pt;color:#555;white-space:nowrap;">x${item.qty}</div>
      </div>`;
    }).join('');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Shipping Label - #${order.order_number || order.id}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  @page{size:100mm 160mm;margin:0}
  body{font-family:Arial,Helvetica,sans-serif;width:100mm;background:#fff;font-size:9pt}
  .box{border:2.5px solid #111;margin:3mm;border-radius:2mm;overflow:hidden}
  .hdr{background:#C8401A;color:#fff;padding:3.5mm 4mm;display:flex;justify-content:space-between;align-items:center}
  .brand{font-size:16pt;font-weight:900;letter-spacing:-0.5px}
  .oid{background:#fff;color:#C8401A;font-size:10pt;font-weight:900;padding:1px 8px;border-radius:999px}
  .sec{padding:2.5mm 4mm;border-bottom:1px dashed #bbb}
  .lbl{font-size:5.5pt;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:700;margin-bottom:1mm}
  .val{font-size:10.5pt;font-weight:700;color:#111;line-height:1.35}
  .sm{font-size:8pt;color:#444;line-height:1.5}
  .items{padding:2.5mm 4mm}
  .ftr{background:#fef6f3;padding:3mm 4mm;border-top:1px solid #ddd;display:flex;justify-content:flex-end;align-items:center}
  .dt{font-size:7pt;color:#aaa;text-align:right;line-height:1.6}
  .no-print{text-align:center;padding:10px}
  @media print{.no-print{display:none!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
</style>
</head>
<body>
<div class="box">
  <div class="hdr">
    <div class="brand">Houra Jewels</div>
    <div class="oid">#${order.order_number || order.id}</div>
  </div>
  <div class="sec">
    <div class="lbl">Ship To</div>
    <div class="val">${escapeHtml(address.name || '')}</div>
    <div class="sm">${escapeHtml(address.line1 || '')}${address.line2 ? ', ' + escapeHtml(address.line2) : ''}</div>
    <div class="sm">${escapeHtml(address.city || '')}, ${escapeHtml(address.state || '')} - ${escapeHtml(address.pincode || '')}, USA</div>
    ${address.mobile ? '<div class="sm" style="font-weight:700;margin-top:1mm;">Ph: ' + escapeHtml(address.mobile) + '</div>' : ''}
  </div>
 
  <div class="items">
    <div class="lbl" style="margin-bottom:2mm;">Order Items (${items.length})</div>
    ${itemRows}
  </div>
  <div class="ftr">
    <div class="dt">
      ${new Date(order.created_at).toLocaleDateString('en-IN')}
      ${order.tracking_id ? '<br>AWB: ' + escapeHtml(order.tracking_id) : ''}
    </div>
  </div>
</div>
<div class="no-print">
  <button onclick="window.print()" style="background:#C8401A;color:#fff;border:none;padding:8px 28px;border-radius:999px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;">
    Print Label
  </button>
</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=440,height=640');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#08183A]/20 border-t-[#08183A] rounded-full animate-spin" />
    </div>
  );

  const filtered = orders.filter(o => (statusFilter === "all" || o.status === statusFilter) && o.order_type !== 'pickup');

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#08183A]">Orders</h1>
          <p className="text-[#08183A]/40 text-xs font-sans mt-0.5">{orders.filter(o => o.order_type !== 'pickup').length} total</p>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {["all", ...SHIPPING_STATUSES].map((s) => {
          const shippingOrders = orders.filter(o => o.order_type !== 'pickup');
          return (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold font-sans capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#08183A] text-white shadow-sm"
                : "bg-white border border-[#08183A]/20 text-[#08183A]/60 hover:border-[#08183A]/40"
            }`}>
            {s === "all" ? `All (${shippingOrders.length})` : `${s} (${shippingOrders.filter(o => o.status === s).length})`}
          </button>
        )})}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#08183A]/10 p-10 sm:p-12 text-center">
          <p className="text-[#08183A]/50 font-sans text-sm">
            {orders.length === 0 ? "No orders yet." : `No ${statusFilter} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-[#08183A]/10 overflow-hidden">

              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 cursor-pointer hover:bg-[#FDF8F0]/30 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-serif font-bold text-[#08183A] text-sm sm:text-base">#{order.order_number || order.id}</span>
                    <span className="text-[#08183A]/50 text-[10px] sm:text-xs font-sans">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-[#FDF8F0] text-gray-500"}`}>
                      {order.status}
                    </span>
                    {order.payment_method === 'cod' && (
                      <span className="text-[9px] sm:text-[10px] font-bold font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        COD (${order.total - (order.advance_paid || 0)} Pending)
                      </span>
                    )}
                  </div>
                  <p className="text-[#08183A]/60 text-[10px] sm:text-xs font-sans mt-0.5 truncate">
                    {order.user_name || "Guest"}
                  </p>
                </div>
                <span className="font-serif font-bold text-[#D4AF37] text-sm sm:text-base lg:text-lg flex-shrink-0">${order.total}</span>
                <ChevronDown className={`w-4 h-4 text-[#08183A]/40 transition-transform flex-shrink-0 ${expanded === order.id ? "rotate-180" : ""}`} />
              </div>

              {expanded === order.id && (
                <div className="border-t border-[#08183A]/5 p-3 sm:p-4 lg:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-sans text-[#08183A]/40 uppercase tracking-wider mb-2">Update Status</p>
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FDF8F0] border border-[#08183A]/10 text-[#08183A] font-sans text-sm focus:outline-none">
                        {(order.order_type === 'pickup' ? PICKUP_STATUSES : SHIPPING_STATUSES).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] font-sans text-[#08183A]/40 uppercase tracking-wider mb-2">Shipment</p>
                      {order.tracking_id && order.tracking_id.trim() !== "" ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                            <span className="text-green-700 font-bold font-sans text-xs truncate">AWB: {order.tracking_id}</span>
                            {order.tracking_link && (
                              <a href={order.tracking_link} target="_blank" rel="noopener noreferrer"
                                className="ml-auto flex-shrink-0 text-[#08183A] hover:opacity-80 transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          {order.shipping_label_url && (
                             <a href={order.shipping_label_url} target="_blank" rel="noopener noreferrer" className="mt-2 w-full flex items-center justify-center gap-2 bg-[#08183A] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90">
                               📄 Download Label
                             </a>
                          )}
                          <div className="flex justify-between mt-2">
                            <button onClick={() => fetchShippoRates(order.id)} disabled={shipping[`shippo_${order.id}`]}
                              className="text-[10px] font-sans text-[#08183A]/50 hover:text-[#08183A] transition-colors underline w-full text-center">
                              {shipping[`shippo_${order.id}`] ? "Loading Rates..." : "Re-create Label (Shippo)"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button onClick={() => fetchShippoRates(order.id)} disabled={shipping[`shippo_${order.id}`]}
                            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#08183A] px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-colors disabled:opacity-50">
                            {shipping[`shippo_${order.id}`] ? "Loading Rates..." : "📦 Select Shipping Rate (Shippo)"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="pt-4 border-t border-[#08183A]/5">
                    <p className="text-[10px] font-sans text-[#08183A]/40 uppercase tracking-wider mb-3">Customer Details</p>
                    {(() => {
                      let address = {};
                      try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
                      const name = order.user_name || address.name || 'Guest';
                      const email = order.user_email || '—';
                      const phone = order.user_phone || address.mobile || '—';
                      const addr = [address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ');
                      return (
                        <div className="bg-[#FDF8F0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Name</span>
                            <span className="text-sm font-semibold text-[#08183A]">{name}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Phone</span>
                            <span className="text-sm font-semibold text-[#08183A]">{phone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Email</span>
                            <span className="text-sm font-semibold text-[#08183A] break-all">{email}</span>
                          </div>
                          {addr && (
                            <div className="flex items-start gap-2 sm:col-span-2">
                              <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Address</span>
                              <span className="text-sm font-semibold text-[#08183A]">{addr}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Type</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ order.order_type === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700' }`}>
                              {order.order_type === 'pickup' ? '🏪 Pickup' : '🚚 Shipping'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-[#08183A]/40 uppercase tracking-wider w-14 shrink-0 mt-0.5">Payment</span>
                            <span className="text-sm font-semibold text-[#08183A] capitalize">{order.payment_method === 'stripe' ? 'Online (Stripe)' : order.payment_method || '—'}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Order Items List */}
                  <div className="pt-4 border-t border-[#08183A]/5">
                    <p className="text-[10px] font-sans text-[#08183A]/40 uppercase tracking-wider mb-3">Order Items</p>
                    <div className="space-y-3">
                      {(typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])).map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-12 h-12 rounded bg-gray-50 border border-gray-100 flex items-center justify-center p-1 shrink-0">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#08183A]/5">
                    <button onClick={() => printLabel(order)}
                      className="flex items-center justify-center gap-1.5 bg-[#08183A] text-white px-3 py-2.5 rounded-xl text-xs font-semibold font-sans hover:bg-[#08183A]/80 transition-colors">
                      <Printer className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Print Label</span>
                    </button>
                    <button onClick={() => notifyWhatsApp(order)}
                      className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 rounded-xl text-xs font-semibold font-sans transition-colors">
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Notify WA</span>
                    </button>
                    <button onClick={() => openInvoice(order)}
                      className="flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-amber-500 text-[#08183A] px-3 py-2.5 rounded-xl text-xs font-semibold font-sans transition-colors">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Invoice</span>
                    </button>
                    <button onClick={() => sendInvoiceWhatsApp(order)}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-xs font-semibold font-sans transition-colors">
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Send Invoice</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Refund Modal */}
      <AnimatePresence>
        {refundModal && (
          <RefundModal
            order={refundModal}
            refunding={refunding}
            refundResult={refundResult}
            onConfirm={(breakdown) => handleRefundAndCancel(refundModal, breakdown)}
            onClose={() => { setRefundModal(null); setRefundResult(null); }}
          />
        )}
      </AnimatePresence>

      {/* Rates Modal */}
      <AnimatePresence>
        {ratesModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="font-serif text-lg font-bold text-[#08183A]">Select Shipping Rate</h2>
                <button onClick={() => setRatesModal(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-3">
                {ratesModal.rates.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No rates available for this address.</p>
                ) : (
                  ratesModal.rates.map(rate => (
                    <div key={rate.objectId} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#D4AF37] transition-colors">
                      <div className="flex items-center gap-3">
                        {rate.providerImage75 && <img src={rate.providerImage75} alt={rate.provider} className="h-8 w-8 object-contain" />}
                        <div>
                          <p className="font-bold text-[#08183A] text-sm">{rate.provider} - {rate.servicelevel?.name}</p>
                          <p className="text-xs text-gray-500">Est. {rate.estimatedDays || '?'} days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#D4AF37]">${rate.amount}</p>
                        <button onClick={() => purchaseShippoLabel(ratesModal.orderId, rate.objectId)}
                          disabled={shipping[`shippo_buy_${ratesModal.orderId}`]}
                          className="mt-1 text-xs bg-[#08183A] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 disabled:opacity-50">
                          {shipping[`shippo_buy_${ratesModal.orderId}`] ? 'Buying...' : 'Buy Label'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
