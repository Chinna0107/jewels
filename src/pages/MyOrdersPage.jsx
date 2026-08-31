import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, FileText, RefreshCw, Store, Truck, MapPin, MessageCircle, CreditCard, ExternalLink, Tag } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Header } from '../components/Header';
import logoUrl from '../assets/logo.png';
import { OrderCard } from '../components/OrderCard';

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
    const discountAmt = parseFloat(order.discount_amount) || 0;
    const shippingCost = parseFloat(order.shipping_fee) ?? (!isPickup && Number(order.total) - subtotal > 0 ? Number(order.total) - subtotal : 0);
    const taxAmt = parseFloat(order.tax_amount) || 0;
    const signatureFee = parseFloat(address.signature_fee) || 0;
    const insuranceFee = parseFloat(address.insurance_fee) || 0;
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Chicago', timeZoneName: 'short' })
      : '—';

    const rows = items.map((item, idx) => {
      const variantColor = (item.variant?.color || '').toLowerCase().trim();
      const matchedVariant = item.product?.variants?.find(v => (v.color || '').toLowerCase().trim() === variantColor);
      const img = item.variant?.image || matchedVariant?.images?.[0] || item.product?.images?.[0] || item.product?.image_url || item.image_url || '';
      const absImg = img && img.startsWith('http') ? img : (img ? `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}` : '');
      const code = item.variant?.size_code || item.variant?.sku || item.variant?.code || matchedVariant?.code || item.product?.product_code || item.product_code || item.sku || '';
      return `
      <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#FFFAF9'}">
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;color:#888;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;">
          <div style="display:flex;align-items:center;gap:10px;">
            ${absImg ? `<img src="${absImg}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;" />` : `<div style="width:44px;height:44px;background:#FDF8F0;border-radius:6px;border:1px solid #f0e0c0;flex-shrink:0;"></div>`}
            <div>
              <div style="font-weight:700;color:#222;font-size:9.5pt;">${escapeHtml(item.product?.name || item.name || '')}</div>
              ${code ? `<div style="font-size:8pt;color:#b8860b;font-weight:600;margin-top:2px;">#${escapeHtml(code)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${escapeHtml(item.variant?.size || item.size || '—')}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:center;font-size:9pt;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:600;">$${Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #F6EFEF;vertical-align:middle;text-align:right;font-size:9pt;font-weight:700;color:#08183A;">$${(Number(item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}</td>
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
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${new URL(logoUrl, window.location.href).href}" style="height:48px;width:auto;object-fit:contain;" alt="Houra Jewels Logo" />
        <div style="display:flex;flex-direction:column;">
          <span style="font-family:serif;font-weight:900;font-size:22px;color:#08183A;line-height:1;">Houra Jewels</span>
          <span style="font-size:10px;font-weight:600;color:#D4AF37;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">By S & M</span>
        </div>
      </div>
    </td>
    <td style="vertical-align:top;text-align:right;">
      <div style="font-size:20pt;font-weight:900;color:#08183A;letter-spacing:-0.5px;">INVOICE</div>
      <div style="font-size:9pt;color:#555;margin-top:6px;line-height:1.7;">
        <strong>Invoice No:</strong> #${escapeHtml(order.order_number || String(order.id))}<br>
        <strong>Date:</strong> ${orderDate}<br>
        <strong>Order Type:</strong> <span style="font-weight:700;color:${isPickup ? '#1d4ed8' : '#059669'};">${isPickup ? '🏪 Store Pickup' : '🚚 Shipping'}</span><br>
        <strong>Status:</strong> ${escapeHtml(order.status)}
        ${order.stripe_payment_intent_id ? `<br><strong>Transaction ID:</strong> <span style="font-family:monospace;font-size:8pt;color:#555;">${escapeHtml(order.stripe_payment_intent_id)}</span>` : ''}
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
    </td>` : `
    <td style="width:4px;"></td>
    <td style="width:50%;vertical-align:top;padding:12px;border:1px solid #e8d5b0;background:#f8fafc;border-radius:4px;">
      <div style="font-size:9pt;font-weight:700;color:#08183A;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e8d5b0;padding-bottom:5px;margin-bottom:8px;">Payment Details</div>
      <div style="font-size:9.5pt;color:#555;line-height:1.6;">
        <strong>Type:</strong> <span style="text-transform:capitalize;">${escapeHtml(order.payment_method || 'Card')}</span><br>
        ${order.stripe_payment_intent_id ? `<strong>Transaction ID:</strong> <span style="font-family:monospace;">${escapeHtml(order.stripe_payment_intent_id)}</span><br>` : ''}
        <strong>Amount Received:</strong> $${parseFloat(order.total || 0).toFixed(2)}
      </div>
    </td>
    `}
  </tr>
</table>

${!isPickup ? `
<table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
  <tr>
    <td style="width:100%;vertical-align:top;padding:12px;border:1px solid #e8d5b0;background:#f8fafc;border-radius:4px;">
      <div style="font-size:9pt;font-weight:700;color:#08183A;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e8d5b0;padding-bottom:5px;margin-bottom:8px;">Payment Details</div>
      <div style="font-size:9.5pt;color:#555;line-height:1.6;display:flex;justify-content:space-between;">
        <div><strong>Type:</strong> <span style="text-transform:capitalize;">${escapeHtml(order.payment_method || 'Card')}</span></div>
        ${order.stripe_payment_intent_id ? `<div><strong>Transaction ID:</strong> <span style="font-family:monospace;">${escapeHtml(order.stripe_payment_intent_id)}</span></div>` : ''}
        <div><strong>Amount Received:</strong> $${parseFloat(order.total || 0).toFixed(2)}</div>
      </div>
    </td>
  </tr>
</table>
` : ''}
 
<!-- ITEMS TABLE -->
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <thead>
    <tr style="background:#08183A;">
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:5%;">#</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:left;width:45%;">Item</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:15%;">Size</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:center;width:10%;">Qty</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:right;width:12%;">Unit Price</th>
      <th style="padding:10px 12px;color:#D4AF37;font-size:9pt;text-align:right;width:13%;">Total</th>
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
        ${discountAmt > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#059669;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Discount${order.coupon_code ? ' (' + order.coupon_code + ')' : ''}</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;color:#059669;">-$${discountAmt.toFixed(2)}</td></tr>` : ''}
        ${shippingCost > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$${shippingCost.toFixed(2)}</td></tr>` : ''}
        ${signatureFee > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Signature Confirmation</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$${signatureFee.toFixed(2)}</td></tr>` : ''}
        ${insuranceFee > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Shipping Insurance</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$${insuranceFee.toFixed(2)}</td></tr>` : ''}
        ${taxAmt > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$${taxAmt.toFixed(2)}</td></tr>` : ''}
        <tr style="background:#FDF8F0;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#08183A;border-top:2px solid #08183A;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#D4AF37;border-top:2px solid #08183A;">$${Number(order.total).toFixed(2)}</td></tr>
        ${parseFloat(order.refund_amount) > 0 ? `
        <tr><td colspan="2" style="padding:12px;text-align:right;border-bottom:1px solid #F6EFEF;">
          <div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:4px;padding:8px;display:inline-block;text-align:right;min-width:200px;">
            <div style="color:#DC2626;font-size:8.5pt;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Refund Processed</div>
            <div style="color:#991B1B;font-size:12pt;font-weight:800;margin-bottom:4px;">-$${parseFloat(order.refund_amount).toFixed(2)}</div>
            ${order.refund_id ? `<div style="color:#B91C1C;font-size:8pt;">Txn: ${escapeHtml(order.refund_id)}</div>` : ''}
          </div>
        </td></tr>` : ''}
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

  const handleReorder = async (order) => {
    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}
    
    for (const item of items) {
      // Reconstruct the product/variant object expected by addToCart
      const productObj = item.product || { id: item.id || item.product_id, name: item.name, price: item.price, image_url: item.image_url };
      const variantObj = item.variant || { size: item.size, color: item.color, price: item.price };
      await addToCart(productObj, variantObj, item.qty || 1, item.color || variantObj?.color);
    }
    
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
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              openInvoice={openInvoice} 
              handleReorder={handleReorder} 
            />
          ))
        )}
      </div>
    </div>
  );
}
