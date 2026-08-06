import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, FileText, RefreshCw, Store, Truck, MapPin, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Header } from '../components/Header';
import logoUrl from '../assets/logo.png';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  'ready for pickup': 'bg-orange-100 text-orange-700 border-orange-200',
  'pickup completed': 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const SHIPPING_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const PICKUP_STEPS = ['pending', 'processing', 'ready for pickup', 'pickup completed'];

export function MyOrdersPage() {
  const navigate = useNavigate();
  const { token, orders, fetchProfile, user } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
  }, [token]);

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
    const subtotal = items.reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || item.price || 0) * item.qty), 0);
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
              <div style="font-weight:700;color:#222;font-size:9.5pt;">${escapeHtml(item.product?.name || item.name || '')}</div>
              ${code ? `<div style="font-size:8pt;color:#b8860b;font-weight:600;margin-top:2px;">#${escapeHtml(code)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${escapeHtml(item.variant?.size || item.size || '—')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:600;">$${Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</td>
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

<!-- HEADER -->
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

<!-- FROM / SHIP TO -->
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
        <strong style="color:#08183A;">${escapeHtml(address.name || user?.name || '')}</strong><br>
        ${escapeHtml(address.line1 || '')}${address.line2 ? ', ' + escapeHtml(address.line2) : ''}<br>
        ${escapeHtml(address.city || '')}, ${escapeHtml(address.state || '')} ${escapeHtml(address.pincode || '')}<br>
        ${address.mobile ? `<strong>Phone:</strong> ${escapeHtml(address.mobile)}` : ''}
      </div>
    </td>` : ''}
  </tr>
</table>

<!-- ITEMS TABLE -->
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

<!-- TOTALS -->
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

<!-- FOOTER -->
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
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.open();
      invoiceWindow.document.write(invoiceHtml(order));
      invoiceWindow.document.close();
    }
  };

  const handleReorder = (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    
    items.forEach(item => {
      // Reconstruct the product/variant object expected by addToCart
      const productObj = item.product || { id: item.id, name: item.name, price: item.price, image_url: item.image_url };
      const variantObj = item.variant || null;
      addToCart(productObj, variantObj, item.qty);
    });
    
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="My Orders" />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-serif font-bold text-[#08183A]">Order History</h2>
          <span className="text-sm font-semibold text-[#08183A]/60 bg-[#08183A]/10 px-3 py-1 rounded-full">{orders.length} Orders</span>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#08183A]" />
            </div>
            <p className="text-[#08183A] font-bold text-lg">No orders yet</p>
            <p className="text-sm text-[#08183A]/50 text-center max-w-sm">Looks like you haven't made your first order. Explore our spiritual collection today!</p>
            <Link to="/" className="mt-4 bg-gradient-to-r from-[#08183A] to-[#D4AF37] text-white text-sm font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const STATUS_STEPS = order.order_type === 'pickup' ? PICKUP_STEPS : SHIPPING_STEPS;
            const stepIdx = STATUS_STEPS.indexOf(order.status);
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-[#FDF8F0]">
                  <div>
                    <p className="text-sm font-bold text-[#08183A]">Order #{order.order_number || order.id}</p>
                    <p className="text-xs text-[#08183A]/60 mt-1">
                      Placed on {new Date(order.created_at).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-sm ${
                      order.order_type === 'pickup' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {order.order_type === 'pickup' ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      {order.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
                    </span>
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full border capitalize shadow-sm ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                    {order.payment_method === 'cod' && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        COD (${order.total - (order.advance_paid || 0)} pending)
                      </span>
                    )}
                    <p className="text-lg font-bold text-[#D4AF37]">${Number(order.total).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {order.status !== 'cancelled' && (
                  <div className="px-6 py-6 border-b border-gray-100 bg-white">
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        {STATUS_STEPS.map((step, i) => (
                          <div key={step} className="flex flex-col items-center flex-1 relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all z-10 ${
                              i <= stepIdx ? 'bg-[#08183A] border-[#08183A] text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              {i < stepIdx ? '✓' : i + 1}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ${i < stepIdx ? 'bg-[#08183A]' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center mt-2">
                        {STATUS_STEPS.map((step, i) => (
                          <span key={step} className={`text-[10px] sm:text-xs font-bold capitalize flex-1 text-center ${i <= stepIdx ? 'text-[#08183A]' : 'text-gray-400'}`}>
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Info Banner */}
                {order.order_type === 'pickup' && (
                  <div className="mx-6 mb-2 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Once your order is ready, our team will message you for pickup via <strong>WhatsApp/Text</strong> from <strong>+1 940-465-6563</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3 border-t border-blue-200 pt-3">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-blue-800">Pickup Location</p>
                        <p className="text-xs text-blue-700">2965 FM1385, Aubrey, TX 76227</p>
                        <a href="https://maps.google.com/?q=2965+FM1385,+Aubrey,+TX+76227" target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 font-bold underline hover:text-blue-800">View on Google Maps →</a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="px-6 py-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(order.items) && order.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-[#FDF8F0] rounded-xl flex items-center justify-center shrink-0 border border-[#08183A]/10 overflow-hidden">
                          {item.image_url || item.product?.image_url ? (
                            <img src={item.image_url || item.product?.image_url} alt={item.name || item.product?.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-[#08183A]/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm font-bold text-[#08183A] line-clamp-1">
                            <Link to={`/product/${item.product?.id || item.id}`} className="hover:text-[#D4AF37] transition-colors">
                              {item.name || item.product?.name || 'Product'}
                            </Link>
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs text-[#08183A]/60 bg-white px-2 py-0.5 rounded-md border border-gray-100">Qty: {item.qty || 1}</span>
                            {(item.size || item.variant?.size) && (
                              <span className="text-xs text-[#08183A]/60 bg-white px-2 py-0.5 rounded-md border border-gray-100">{item.size || item.variant?.size}</span>
                            )}
                            {(item.product?.product_code || item.product_code) && (
                              <span className="text-xs text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                                #{item.product?.product_code || item.product_code}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#08183A] pt-1">${Number(item.price || item.variant?.price || item.product?.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-4 bg-[#FDF8F0] border-t border-[#08183A]/10">
                  {order.tracking_link && (
                    <a href={order.tracking_link} target="_blank" rel="noopener noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#08183A] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-900 transition-colors shadow-sm sm:mr-auto">
                      📦 Track Order
                    </a>
                  )}
                  <button onClick={() => openInvoice(order)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#08183A] border border-[#08183A]/20 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#08183A]/5 transition-colors shadow-sm">
                    <FileText className="w-4 h-4 text-[#08183A]" /> Download Invoice
                  </button>
                  <button onClick={() => handleReorder(order)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#08183A] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#D4AF37] transition-colors shadow-sm">
                    <RefreshCw className="w-4 h-4" /> Reorder Items
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
