const fs = require('fs');
const path = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(path, 'utf8');

// Remove any accidental appended garbage from the previous heredoc attempt
content = content.replace(/\nPLACEHOLDER\n# now overwrite the module\.exports line and append missing functions using node\n/g, '');

// Fix the module.exports line to remove missing references
content = content.replace(
  "module.exports = { transporter, sendOrderEmailToAdmin, sendPaymentLinkEmail, sendOrderEmailToCustomer, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail };",
  "module.exports = { transporter, sendOrderEmailToAdmin, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail, sendPaymentLinkEmail, sendOrderEmailToCustomer };"
);

// Append the two missing functions right before module.exports
const moduleExportsLine = "module.exports = { transporter, sendOrderEmailToAdmin, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail, sendPaymentLinkEmail, sendOrderEmailToCustomer };";

const missingFunctions = `
async function sendOrderEmailToCustomer(orderNumber, total, address, items, email, grandTotal, discount, tax, shipping, fullOrderObj = {}) {
  try {
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);
    const orderDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtotal = items.reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || item.price || 0) * item.qty), 0);
    
    const rows = items.map((item, idx) => {
      const imgUrl = item.variant?.image || item.product?.images?.[0] || item.product?.image_url;
      const imgHtml = imgUrl ? \`<img src="\${imgUrl}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #eee;" />\` : '';
      return \`<tr style="border-bottom:1px solid #F6EFEF;">
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">\${idx + 1}</td>
        <td style="padding:10px 12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            \${imgHtml}
            <div>
              <div style="font-weight:700;color:#08183A;font-size:9pt;">\${escapeHtml(item.product?.name || item.name || '')}</div>
              \${(item.product?.product_code || item.product_code) ? \`<div style="font-size:8pt;color:#D4AF37;font-weight:600;margin-top:2px;">#\${escapeHtml(item.product?.product_code || item.product_code)}</div>\` : ''}
            </div>
          </div>
        </td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">\${escapeHtml(item.variant?.size || '')}</td>
        <td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">\${item.qty}</td>
        <td style="padding:10px 12px;color:#08183A;font-weight:600;font-size:9pt;text-align:right;">$\${Number(item.variant?.price || item.product?.price || item.price || 0).toFixed(2)}</td>
        <td style="padding:10px 12px;color:#08183A;font-weight:700;font-size:9.5pt;text-align:right;">$\${(Number(item.variant?.price || item.product?.price || item.price || 0) * item.qty).toFixed(2)}</td>
      </tr>\`;
    }).join('');

    const invoiceHtml = \`<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice #\${escapeHtml(orderNumber)}</title>
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
        <strong>Invoice No:</strong> #\${escapeHtml(orderNumber)}<br>
        <strong>Date:</strong> \${orderDate}<br>
        <strong>Status:</strong> \${escapeHtml(fullOrderObj.status || 'paid')}
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
  <tbody>\${rows}</tbody>
</table>

<table style="width:100%;border-collapse:collapse;margin-top:8px;">
  <tr>
    <td style="width:55%;"></td>
    <td style="width:45%;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Subtotal</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;width:110px;">$\${subtotal.toFixed(2)}</td></tr>
        \${Number(discount) > 0 ? \`<tr><td style="padding:7px 12px;text-align:right;color:#059669;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Discount</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;color:#059669;">-$\${Number(discount).toFixed(2)}</td></tr>\` : ''}
        \${Number(shipping) > 0 ? \`<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$\${Number(shipping).toFixed(2)}</td></tr>\` : ''}
        \${Number(tax) > 0 ? \`<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">$\${Number(tax).toFixed(2)}</td></tr>\` : ''}
        <tr style="background:#FDF8F0;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#08183A;border-top:2px solid #08183A;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#D4AF37;border-top:2px solid #08183A;">$\${Number(total).toFixed(2)}</td></tr>
      </table>
    </td>
  </tr>
</table>
</body></html>\`;

    // Generate PDF using Puppeteer
    const { default: puppeteer } = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const emailBodyHtml = \`
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Invoice #\${escapeHtml(orderNumber)}</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(address.name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Thank you for your recent purchase at Houra Jewels! Please find the detailed invoice for your order <strong>#\${escapeHtml(orderNumber)}</strong> attached to this email.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #D4AF37; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0;">
      <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
        <strong style="color:#08183A;">Total Amount:</strong>
        <strong style="color:#D4AF37;">$\${Number(total).toFixed(2)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <strong style="color:#08183A;">Order Status:</strong>
        <span style="color:#059669; font-weight:bold; text-transform:uppercase;">\${escapeHtml(fullOrderObj.status || 'PAID')}</span>
      </div>
    </div>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:10px;">If you have any questions or concerns, simply reply to this email.</p>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">&copy; \${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">Texas, 76227 | support@hourajewels.com | +1 940-465-6563</p>
  </div>
</div>
</body>
</html>\`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | Houra Jewels',
      html: emailBodyHtml,
      attachments: [
        {
          filename: \`Invoice-\${orderNumber}.pdf\`,
          content: pdfBuffer,
          contentType: 'application/pdf'
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

    const htmlContent = \`
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Action Required</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(customerName)},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Your order has been updated and there is an outstanding balance of <strong style="color:#D4AF37; font-size:20px;">$\${parseFloat(balanceDue).toFixed(2)}</strong>.
    </p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:30px;">Please click the secure link below to complete your payment so we can process your order.</p>
    <div style="text-align:center;">
      <a href="\${paymentLinkUrl}" style="display:inline-block;padding:14px 28px;background-color:#08183A;color:#D4AF37;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;">Pay Now ($\${parseFloat(balanceDue).toFixed(2)})</a>
    </div>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">If you have questions, reply to this email or contact us at support@hourajewels.com</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">&copy; \${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
  </div>
</div>
</body>
</html>\`;

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

`;

content = content.replace(moduleExportsLine, missingFunctions + moduleExportsLine);
fs.writeFileSync(path, content, 'utf8');
console.log('email.js restored successfully — all functions present!');
