const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendOrderEmailToAdmin(orderNumber, total, address, items) {
  try {
    const addr = address || {};
    const itemRows = (items || []).map(i =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #f0e0c0">${i.product?.name || 'Item'}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f0e0c0;text-align:center">${i.qty}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #f0e0c0;text-align:right">$${((i.variant?.price || i.product?.price || 0) * i.qty).toFixed(2)}</td>
      </tr>`
    ).join('');
    await transporter.sendMail({
      from: `"Houra Jewels" <${process.env.EMAIL_USER}>`,
      to: 'support@hourajewels.com',
      subject: `New Order Received - ${orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #f0e0c0;border-radius:12px">
          <h2 style="color:#08183A">🛍️ New Order — ${orderNumber}</h2>
          <p><strong>Total:</strong> $${total}</p>
          <h3 style="color:#b45309;margin-top:16px">Shipping Address</h3>
          <p style="margin:0">${addr.name || ''}</p>
          <p style="margin:0">${addr.line1 || ''}</p>
          <p style="margin:0">${[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
          <p style="margin:0">${addr.country || ''}</p>
          <p style="margin:0">${addr.mobile || ''}</p>
          <h3 style="color:#b45309;margin-top:16px">Items</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:#fff7ed">
              <th style="padding:6px 8px;text-align:left">Product</th>
              <th style="padding:6px 8px">Qty</th>
              <th style="padding:6px 8px;text-align:right">Price</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <p style="margin-top:16px;color:#6b7280;font-size:12px">Check the admin dashboard for full details.</p>
        </div>
      `
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

async function sendRefundEmail({ order, refundId, refundAmount, cancelType, cancelledItems, remainingItems, transactionCharge }) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email;
    const orderNum = order.order_number || order.id;

    const cancelledRows = (cancelledItems || []).map(i => {
      const rawImageUrl = i.variant?.images?.[0] || i.product?.image_url || i.images?.[0] || '';
      const isBase64 = typeof rawImageUrl === 'string' && rawImageUrl.startsWith('data:image');
      const imageUrl = isBase64 ? '' : rawImageUrl;
      return '<tr>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;display:flex;align-items:center;">' +
          (imageUrl ? '<img src="' + (imageUrl.startsWith('/') ? ((process.env.FRONTEND_URL || 'https://hourajewels.com') + imageUrl) : imageUrl) + '" alt="' + (i.name || 'Item') + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:12px;" />' : '') +
          '<span style="color:#08183A;font-weight:bold;">' + (i.name || 'Item') + (i.color ? ' - '+i.color : '') + (i.size ? ' - Size: '+i.size : '') + '</span>' +
        '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:center">' + i.qty + '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right">$' + (i.price || 0).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    const htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:64px;width:auto;margin-bottom:8px;" />' +
        '<h1 style="color:#08183A;margin:0;font-family:serif;font-size:28px;letter-spacing:2px;">HOURA JEWELS</h1>' +
      '</div>' +
      '<h2 style="color:#08183A;text-align:center;">Order Cancelled & Refund Confirmed</h2>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Hi <strong>' + (address.name || order.user_name || 'Customer') + '</strong>,</p>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Your Houra Jewels order #' + orderNum + ' has been successfully cancelled, and your refund has been initiated.</p>' +
      
      '<h3 style="color:#08183A;border-bottom:2px solid #f0e0c0;padding-bottom:8px;margin-top:24px;">Order Details</h3>' +
      '<div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #f0e0c0;margin-bottom:24px;">' +
        '<p style="margin:4px 0;"><strong>Order #:</strong> ' + orderNum + '</p>' +
        '<p style="margin:4px 0;"><strong>Order Date:</strong> ' + new Date(order.created_at).toLocaleDateString() + '</p>' +
        '<p style="margin:4px 0;"><strong>Cancellation Date:</strong> ' + new Date().toLocaleDateString() + '</p>' +
      '</div>' +

      '<h3 style="color:#08183A;border-bottom:2px solid #f0e0c0;padding-bottom:8px;">Cancelled Items</h3>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;">' +
        '<thead><tr style="background:#fff7ed;color:#b45309;">' +
          '<th style="padding:10px;text-align:left">Product</th>' +
          '<th style="padding:10px">Qty</th>' +
          '<th style="padding:10px;text-align:right">Price</th>' +
        '</tr></thead>' +
        '<tbody>' + cancelledRows + '</tbody>' +
      '</table>' +

      '<div style="margin-top:20px;text-align:right;font-size:14px;background:#fff;padding:16px;border-radius:8px;border:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;"><strong>Refund Amount:</strong> <span style="color:#059669;font-size:16px;font-weight:bold;">$' + refundAmount.toFixed(2) + '</span></p>' +
        '<p style="margin:4px 0;color:#555;"><strong>Refund Method:</strong> Original Payment Method</p>' +
        '<p style="margin:4px 0;color:#555;"><strong>Transaction ID:</strong> ' + refundId + '</p>' +
      '</div>' +

      '<p style="color:#333;font-size:14px;line-height:1.5;margin-top:24px;text-align:center;">' +
        'The refund will be credited to your original payment method. Depending on your payment provider or bank, it may take 5–10 business days to appear in your account.' +
      '</p>' +

      '<div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;font-size:14px;color:#555;">If you have any questions regarding your cancellation or refund, please contact us at <a href="mailto:support@hourajewels.com" style="color:#b45309;text-decoration:none;">support@hourajewels.com</a>.</p>' +
        '<p style="margin:16px 0;font-size:16px;font-weight:bold;color:#08183A;">Thank you for choosing Houra Jewels. 💛</p>' +
        '<p style="margin:16px 0 4px 0;font-weight:bold;color:#08183A;font-size:16px;">Team Houra Jewels</p>' +
        '<p style="margin:4px 0;font-size:12px;color:#777;">' +
          '<a href="https://hourajewels.com" style="color:#777;text-decoration:none;">hourajewels.com</a> | ' +
          '<a href="https://www.instagram.com/hourajewels?igsh=c2llNGRzM2RpbHZ3&utm_source=qr" style="color:#777;text-decoration:none;">Instagram: @hourajewels</a>' +
        '</p>' +
        '<p style="margin:8px 0;font-size:10px;color:#aaa;">© ' + new Date().getFullYear() + ' Houra Jewels. All rights reserved.</p>' +
      '</div>' +
    '</div>';

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: customerEmail,
      subject: 'Order Cancelled & Refund Confirmation – #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
  } catch (err) {
    console.error('Customer refund email send failed:', err);
  }
}

async function sendOrderShippedEmail(order) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email || order.email || address.email;
    const orderNum = order.order_number || order.id;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;filter:brightness(0) invert(1);" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Order Shipped! ✨</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi ${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Great news! Your Houra Jewels order <strong>#${escapeHtml(orderNum)}</strong> has been shipped and is on its way to you.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #D4AF37; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <p style="margin:0 0 15px 0;color:#555;font-size:14px;">Track your package using the link below:</p>
      <a href="${order.tracking_url || '#'}" style="display:inline-block;padding:12px 24px;background-color:#08183A;color:#D4AF37;text-decoration:none;font-weight:bold;border-radius:6px;letter-spacing:1px;font-size:14px;">TRACK MY ORDER</a>
      <p style="margin:15px 0 0 0;font-size:13px;color:#777;">Tracking Number: <strong>${escapeHtml(order.tracking_number || 'N/A')}</strong></p>
    </div>
    <p style="color:#333; font-size:14px; line-height:1.6; margin-bottom:10px;text-align:center;">Please allow up to 24 hours for the tracking information to update.</p>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">&copy; ${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">Texas, 76227 | support@hourajewels.com | +1 940-465-6563</p>
  </div>
</div>
</body>
</html>
`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: customerEmail,
      subject: 'Your order has shipped! – #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
    console.log('Customer shipped email sent');
  } catch (err) {
    console.error('Customer shipped email send failed:', err);
  }
}

async function sendOrderDeliveredEmail(order) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email || order.email || address.email;
    const orderNum = order.order_number || order.id;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;filter:brightness(0) invert(1);" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Order Delivered! 🎁</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi ${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Great news! Your Houra Jewels order <strong>#${escapeHtml(orderNum)}</strong> has been marked as delivered by the carrier.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #059669; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <h3 style="color:#059669;margin:0 0 10px 0;font-size:18px;">✓ Delivered Successfully</h3>
      <p style="margin:0;font-size:13px;color:#777;">Tracking Number: <strong>${escapeHtml(order.tracking_number || 'N/A')}</strong></p>
    </div>
    <p style="color:#333; font-size:14px; line-height:1.6; margin-bottom:10px;text-align:center;">We hope you love your new pieces! Don't forget to share your look with us on Instagram.</p>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">&copy; ${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">Texas, 76227 | support@hourajewels.com | +1 940-465-6563</p>
  </div>
</div>
</body>
</html>
`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: customerEmail,
      subject: 'Delivered: Your order #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
    console.log('Customer delivered email sent');
  } catch (err) {
    console.error('Customer delivered email send failed:', err);
  }
}


async function sendOrderEmailToCustomer(orderNumber, total, address, items, email, grandTotal, discount, tax, shipping, fullOrderObj = {}) {
  try {
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);
    const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtotal = items.reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || item.price || 0) * item.qty), 0);
    
    const rows = items.map((item, idx) => {
      const imgUrl = item.variant?.image || item.product?.images?.[0] || item.product?.image_url;
      const imgHtml = imgUrl ? `<img src="${imgUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #eee;" />` : '';
      return `<tr style="border-bottom:1px solid #F6EFEF;">
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${idx + 1}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${imgHtml}
            <div>
              <div style="font-weight:700;color:#08183A;font-size:9pt;">${escapeHtml(item.product?.name || item.name || '')}</div>
              ${(item.product?.product_code || item.product_code) ? `<div style="font-size:8pt;color:#D4AF37;font-weight:600;margin-top:2px;">#${escapeHtml(item.product?.product_code || item.product_code)}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${escapeHtml(item.variant?.size || '')}</td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">${item.qty}</td>
        <td style="padding:10px 12px;color:#08183A;font-weight:600;font-size:9pt;text-align:right;">${Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</td>
        <td style="padding:10px 12px;color:#08183A;font-weight:700;font-size:9.5pt;text-align:right;">${(Number(item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}</td>
      </tr>`;
    }).join('');

    const invoiceHtml = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice #${escapeHtml(orderNumber)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  @page { size: A4; margin: 15mm 12mm 20mm 12mm; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 20px; font-size: 10pt; line-height: 1.4; background: #fff; }
  @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
</style>
</head>
<body>
<table style="width:100%;border-collapse:collapse;border-bottom:3px solid #08183A;padding-bottom:16px;margin-bottom:20px;">
  <tr>
    <td style="vertical-align:middle;width:50%;">
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" style="height:48px;width:auto;object-fit:contain;" alt="Houra Jewels Logo" />
        <div style="display:flex;flex-direction:column;">
          <span style="font-family:serif;font-weight:900;font-size:22px;color:#D4AF37;line-height:1;letter-spacing:0.12em;text-transform:uppercase;">HOURA JEWELS</span>
          <span style="font-size:10px;font-weight:600;color:#08183A;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">By S & M</span>
        </div>
      </div>
    </td>
    <td style="vertical-align:top;text-align:right;">
      <div style="font-size:20pt;font-weight:900;color:#08183A;letter-spacing:-0.5px;">INVOICE</div>
      <div style="font-size:9pt;color:#555;margin-top:6px;line-height:1.7;">
        <strong>Invoice No:</strong> #${escapeHtml(orderNumber)}<br>
        <strong>Date:</strong> ${orderDate}<br>
        <strong>Status:</strong> ${escapeHtml(fullOrderObj.status || 'paid')}
      </div>
    </td>
  </tr>
</table>

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

<table style="width:100%;border-collapse:collapse;margin-top:8px;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Subtotal</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;width:110px;">${subtotal.toFixed(2)}</td></tr>
        ${Number(discount) > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#059669;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Discount</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;color:#059669;">-${Number(discount).toFixed(2)}</td></tr>` : ''}
        ${Number(shipping) > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">${Number(shipping).toFixed(2)}</td></tr>` : ''}
        ${Number(tax) > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">${Number(tax).toFixed(2)}</td></tr>` : ''}
        <tr style="background:#FDF8F0;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#08183A;border-top:2px solid #08183A;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#D4AF37;border-top:2px solid #08183A;">${Number(total).toFixed(2)}</td></tr>
      </table>
    </td>
  </tr>
</table>
</body></html>`;

    // Generate PDF using Puppeteer
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const emailRowsHtml = (items || []).map(item => {
      const price = Number(item.variant?.price || item.product?.price || item.price || 0);
      const img = item.variant?.image || item.product?.images?.[0] || item.product?.image_url || 'https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png';
      return `
        <tr>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${img}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #eee;" />
              <div>
                <div style="font-weight: 600; color: #08183A;">${escapeHtml(item.product?.name || 'Product')}</div>
                ${item.variant?.size ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">Size: ${escapeHtml(item.variant.size)}</div>` : ''}
              </div>
            </div>
          </td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eee; text-align: center; color: #555;">${item.qty}</td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eee; text-align: right; color: #555;">$${price.toFixed(2)}</td>
          <td style="padding: 15px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #08183A;">$${(price * item.qty).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const emailBodyHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#F5F5F7;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 15px 35px rgba(0,0,0,0.05);">
  <!-- Header -->
  <div style="background-color:#08183A; padding:35px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:65px;width:auto;margin-bottom:12px;" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:26px; font-weight:700; letter-spacing: 2px; text-transform: uppercase;">Houra Jewels</h1>
    <p style="color:#ffffff; margin: 8px 0 0 0; font-size: 12px; letter-spacing: 1px; font-weight: 300;">Wear it once, Love it for ever</p>
  </div>
  
  <!-- Greeting -->
  <div style="padding:40px 30px 20px 30px;">
    <h2 style="color:#08183A; font-family:serif; font-size:22px; margin-top:0;">Thank You for Your Order! ✨</h2>
    <p style="color:#555; font-size:15px; line-height:1.6; margin-bottom:20px;">Hi ${escapeHtml(address.name || 'Customer')},</p>
    <p style="color:#555; font-size:15px; line-height:1.6; margin-bottom:25px;">
      Thank you for choosing Houra Jewels. We're pleased to confirm that your order has been successfully placed and your payment has been received.
    </p>

    <!-- Order Meta -->
    <div style="background-color:#FDF8F0; border-radius:12px; padding:20px; margin-bottom:30px; display:flex; flex-direction: column; gap: 8px;">
      <div style="display:flex; justify-content:space-between; font-size: 14px;">
        <span style="color:#555;">Order Number:</span>
        <strong style="color:#08183A;">#${escapeHtml(orderNumber)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size: 14px;">
        <span style="color:#555;">Order Date:</span>
        <strong style="color:#08183A;">${orderDate}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size: 14px;">
        <span style="color:#555;">Payment Status:</span>
        <strong style="color:#059669; text-transform:uppercase;">Paid ✓</strong>
      </div>
    </div>
  </div>

  <!-- Order Summary -->
  <div style="padding:0 30px 20px 30px;">
    <h3 style="color:#08183A; font-family:serif; font-size:18px; margin:0 0 15px 0; border-bottom: 2px solid #FDF8F0; padding-bottom: 10px;">ORDER SUMMARY</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="padding:10px; text-align:left; color:#888; font-size:11px; text-transform:uppercase; border-bottom: 1px solid #eee;">Product</th>
          <th style="padding:10px; text-align:center; color:#888; font-size:11px; text-transform:uppercase; border-bottom: 1px solid #eee;">Qty</th>
          <th style="padding:10px; text-align:right; color:#888; font-size:11px; text-transform:uppercase; border-bottom: 1px solid #eee;">Price</th>
          <th style="padding:10px; text-align:right; color:#888; font-size:11px; text-transform:uppercase; border-bottom: 1px solid #eee;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${emailRowsHtml}
      </tbody>
    </table>

    <table style="width:100%; border-collapse:collapse; margin-bottom: 30px;">
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding: 6px 10px; color: #555; font-size: 14px; text-align: right;">Subtotal:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 14px; text-align: right; font-weight: 600;">$${subtotal.toFixed(2)}</td>
            </tr>
            ${Number(discount) > 0 ? `<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 14px; text-align: right;">Discount:</td>
              <td style="padding: 6px 10px; color: #059669; font-size: 14px; text-align: right; font-weight: 600;">-$${Number(discount).toFixed(2)}</td>
            </tr>` : ''}
            ${Number(shipping) > 0 ? `<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 14px; text-align: right;">Shipping:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 14px; text-align: right; font-weight: 600;">$${Number(shipping).toFixed(2)}</td>
            </tr>` : ''}
            ${Number(tax) > 0 ? `<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 14px; text-align: right;">Sales Tax:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 14px; text-align: right; font-weight: 600;">$${Number(tax).toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 12px 10px; color: #08183A; font-size: 16px; text-align: right; font-weight: bold; border-top: 2px solid #FDF8F0;">Order Total:</td>
              <td style="padding: 12px 10px; color: #D4AF37; font-size: 18px; text-align: right; font-weight: bold; border-top: 2px solid #FDF8F0;">$${Number(total).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Two Column: Payment & Shipping -->
  <div style="padding:0 30px 30px 30px; display: flex; flex-wrap: wrap; gap: 20px;">
    <div style="flex: 1; min-width: 200px; background-color: #fafafa; padding: 20px; border-radius: 12px;">
      <h4 style="margin: 0 0 10px 0; color: #08183A; font-size: 14px; text-transform: uppercase; font-weight: bold;">Payment</h4>
      <div style="font-size: 13px; color: #555; line-height: 1.6;">
        <div>Status: <span style="color:#059669; font-weight: bold;">Paid ✓</span></div>
        <div>Method: <span style="color:#08183A; font-weight: 500;">${escapeHtml(fullOrderObj.payment_method || 'Online')}</span></div>
        ${fullOrderObj.stripe_payment_intent_id ? `<div>Transaction ID: <br><span style="font-family: monospace; font-size: 11px; color: #888;">${fullOrderObj.stripe_payment_intent_id}</span></div>` : ''}
      </div>
    </div>
    <div style="flex: 1; min-width: 200px; background-color: #fafafa; padding: 20px; border-radius: 12px;">
      <h4 style="margin: 0 0 10px 0; color: #08183A; font-size: 14px; text-transform: uppercase; font-weight: bold;">Shipping To</h4>
      <div style="font-size: 13px; color: #555; line-height: 1.6;">
        <div style="font-weight: bold; color: #08183A; margin-bottom: 4px;">${escapeHtml(address.name || '')}</div>
        <div>${escapeHtml(address.line1 || '')}</div>
        <div>${[address.city, address.state, address.pincode].filter(Boolean).map(escapeHtml).join(', ')}</div>
        <div>${escapeHtml(address.country || '')}</div>
      </div>
    </div>
  </div>

  <!-- Appreciation & Care Guide -->
  <div style="padding: 30px; background-color: #FDF8F0; text-align: center;">
    <p style="color: #08183A; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
      Every Houra Jewels order is carefully packed by our team. We truly appreciate your support and are grateful to have you as part of our growing community.
    </p>
    <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; display: inline-block; text-align: left; max-width: 400px;">
      <h4 style="margin: 0 0 8px 0; color: #D4AF37; font-size: 16px; font-family: serif;">✨ Jewelry Care Guide</h4>
      <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">
        We've attached our Jewelry Care Guide with simple tips to help maintain the shine and finish of your jewelry and keep it looking beautiful for longer.
      </p>
    </div>
    <h3 style="color: #08183A; font-family: serif; font-size: 18px; margin: 25px 0 0 0;">Thank you for supporting Houra Jewels! 💛</h3>
  </div>

  <!-- Footer -->
  <div style="background-color: #ffffff; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
    <h4 style="color: #08183A; margin: 0 0 10px 0; font-size: 14px;">Questions?</h4>
    <p style="margin: 0 0 15px 0; font-size: 13px; color: #555;">
      <a href="mailto:support@hourajewels.com" style="color: #D4AF37; text-decoration: none; font-weight: bold;">support@hourajewels.com</a> | 
      <a href="https://wa.me/19404656563" style="color: #D4AF37; text-decoration: none; font-weight: bold;">WhatsApp Chat</a>
    </p>
    <p style="margin: 0 0 10px 0; font-size: 14px; font-family: serif; font-weight: bold; color: #08183A; letter-spacing: 1px;">HOURA JEWELS</p>
    <p style="margin: 0 0 20px 0; font-size: 12px; color: #888;">
      <a href="https://hourajewels.com" style="color: #888; text-decoration: none;">hourajewels.com</a> | 
      <a href="https://instagram.com/hourajewels" style="color: #888; text-decoration: none;">Instagram: @hourajewels</a>
    </p>
    <p style="margin: 0 0 15px 0; font-size: 11px; color: #aaa;">
      <a href="https://hourajewels.com/privacy" style="color: #aaa; text-decoration: underline;">Privacy Policy</a> | 
      <a href="https://hourajewels.com/terms" style="color: #aaa; text-decoration: underline;">Terms & Conditions</a> | 
      <a href="https://hourajewels.com/shipping" style="color: #aaa; text-decoration: underline;">Shipping & Return Policy</a>
    </p>
    <p style="margin: 0; font-size: 11px; color: #bbb;">&copy; 2026 Houra Jewels. All rights reserved.</p>
    <p style="margin: 5px 0 0 0; font-size: 10px; color: #ccc;">This is an automated order confirmation email. Please retain this email for your records.</p>
  </div>
</div>
</body>
</html>`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | Houra Jewels',
      html: emailBodyHtml,
      attachments: [
        {
          filename: `Invoice-${orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        },
        {
          filename: 'Houra Jewels - Jewelry Care Guide.png',
          path: 'https://raw.githubusercontent.com/Chinna0107/jewels/main/public/images/inst.png'
        }
      ]
    });
    console.log('Customer invoice email sent for order', orderNumber);
  } catch (err) {
    console.error('Customer email error:', err);
  }
}

async function sendPaymentLinkEmail(order, paymentLinkUrl, balanceDue) {
  try {
    const address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {});
    const customerName = order.user_name || address.name || 'Customer';
    const email = order.user_email || order.email || address.email;
    if (!email) throw new Error('No email address found for customer');
    const escapeHtml = (v) => String(v ?? '').replace(/[&<>'"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[m]);

    const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Action Required</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi ${escapeHtml(customerName)},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Your order has been updated and there is an outstanding balance of <strong style="color:#D4AF37; font-size:20px;">${parseFloat(balanceDue).toFixed(2)}</strong>.
    </p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:30px;">Please click the secure link below to complete your payment so we can process your order.</p>
    <div style="text-align:center;">
      <a href="${paymentLinkUrl}" style="display:inline-block;padding:14px 28px;background-color:#08183A;color:#D4AF37;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Pay Now (${parseFloat(balanceDue).toFixed(2)})</a>
    </div>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">If you have questions, reply to this email or contact us at support@hourajewels.com</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">&copy; ${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Action Required: Payment for Order #' + (order.order_number || order.id) + ' | Houra Jewels',
      html: htmlContent
    });
    console.log('Payment link email sent to', email);
  } catch (err) {
    console.error('Payment link email error:', err);
  }
}

module.exports = { transporter, sendOrderEmailToAdmin, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail, sendPaymentLinkEmail, sendOrderEmailToCustomer };
