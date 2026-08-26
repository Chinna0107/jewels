const fs = require('fs');

const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const targetFunctionStart = "async function sendOrderEmailToCustomer(";
const indexStart = content.indexOf(targetFunctionStart);
if (indexStart === -1) {
  console.log("Could not find sendOrderEmailToCustomer");
  process.exit(1);
}

const searchBlock = `    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | Houra Jewels',
      html: htmlContent,
      attachments: [
        {
          filename: \`Invoice-\${orderNumber}.pdf\`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });`;

const replaceBlock = `
    // Generate new email body template
    const emailItemRows = items.map(item => {
      const imageUrl = item.variant?.images?.[0] || item.product?.image_url || item.images?.[0] || '';
      const finalImage = imageUrl ? (imageUrl.startsWith('/') ? ((process.env.FRONTEND_URL || 'https://hourajewels.com') + imageUrl) : imageUrl) : '';
      const price = (item.variant?.price || item.product?.price || item.price || 0);
      const itemTotal = price * (item.qty || 1);
      return \`
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;">
            \${finalImage ? \`<img src="\${finalImage}" alt="Product" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:12px;" />\` : ''}
            <div>
              <div style="color:#08183A;font-weight:bold;font-size:14px;">\${escapeHtml(item.name || item.product?.name || 'Item')}</div>
              <div style="color:#6b7280;font-size:12px;margin-top:2px;">\${item.color ? escapeHtml(item.color) + ' | ' : ''}\${item.size ? escapeHtml(item.size) : ''}</div>
            </div>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">\${item.qty}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">$\${price.toFixed(2)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-weight:bold;">$\${itemTotal.toFixed(2)}</td>
        </tr>
      \`;
    }).join('');

    const emailBodyHtml = \`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { text-align: center; padding: 40px 20px 20px; }
  .logo { max-width: 120px; height: auto; }
  .brand-name { color: #08183A; font-size: 24px; font-weight: bold; margin: 15px 0 5px; letter-spacing: 2px; }
  .tagline { color: #D4AF37; font-size: 14px; font-style: italic; margin: 0; }
  .content { padding: 30px; color: #374151; line-height: 1.6; }
  h1 { color: #08183A; font-size: 22px; margin-top: 0; }
  .section-title { font-size: 14px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
  table { width: 100%; border-collapse: collapse; }
  .summary-table td { padding: 8px 0; font-size: 14px; }
  .summary-table .label { color: #6b7280; }
  .summary-table .value { text-align: right; font-weight: bold; color: #111827; }
  .total-row td { border-top: 2px solid #08183A; padding-top: 15px; font-size: 18px; color: #08183A; }
  .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
  .footer { background-color: #08183A; color: #ffffff; text-align: center; padding: 30px 20px; font-size: 12px; }
  .footer a { color: #D4AF37; text-decoration: none; margin: 0 10px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img class="logo" src="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}/logo.png" alt="Houra Jewels Logo">
      <div class="brand-name">HOURA JEWELS</div>
      <p class="tagline">Wear it once, Love it forever</p>
    </div>
    
    <div class="content">
      <h1>Thank You for Your Order! ✨</h1>
      <p>Hi <strong>\${escapeHtml(address.name || 'Customer')}</strong>,</p>
      <p>Thank you for choosing Houra Jewels. We’re pleased to confirm that your order has been successfully placed and your payment has been received.</p>
      
      <div class="info-box">
        <strong>Order Number:</strong> #\${orderNumber}<br>
        <strong>Order Date:</strong> \${orderDate}<br>
        <strong>Payment Status:</strong> Paid ✓
      </div>

      <div class="section-title">ORDER SUMMARY</div>
      <table style="margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding:10px 8px;text-align:left;color:#9ca3af;font-size:12px;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Product</th>
            <th style="padding:10px 8px;text-align:center;color:#9ca3af;font-size:12px;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Qty</th>
            <th style="padding:10px 8px;text-align:right;color:#9ca3af;font-size:12px;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Price</th>
            <th style="padding:10px 8px;text-align:right;color:#9ca3af;font-size:12px;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          \${emailItemRows}
        </tbody>
      </table>

      <table class="summary-table" style="width: 250px; margin-left: auto;">
        <tr><td class="label">Subtotal:</td><td class="value">$\${subtotal.toFixed(2)}</td></tr>
        \${Number(discount) > 0 ? \`<tr><td class="label" style="color:#059669;">Discount:</td><td class="value" style="color:#059669;">-$\${Number(discount).toFixed(2)}</td></tr>\` : ''}
        \${Number(shipping) > 0 ? \`<tr><td class="label">Shipping:</td><td class="value">$\${Number(shipping).toFixed(2)}</td></tr>\` : ''}
        \${Number(tax) > 0 ? \`<tr><td class="label">Sales Tax:</td><td class="value">$\${Number(tax).toFixed(2)}</td></tr>\` : ''}
        <tr class="total-row"><td class="label" style="color:#08183A;font-weight:bold;">Order Total:</td><td class="value" style="color:#D4AF37;">$\${Number(grandTotal).toFixed(2)}</td></tr>
      </table>

      <div class="section-title" style="margin-top: 40px;">PAYMENT</div>
      <div class="info-box" style="margin-bottom: 0;">
        <strong>Status:</strong> Paid ✓<br>
        <strong>Method:</strong> <span style="text-transform:capitalize;">\${escapeHtml(fullOrderObj.payment_method || 'Online')}</span><br>
        \${fullOrderObj.stripe_payment_intent_id ? \`<strong>Transaction ID:</strong> <span style="font-family:monospace;font-size:12px;">\${fullOrderObj.stripe_payment_intent_id}</span>\` : ''}
      </div>

      <div class="section-title">SHIPPING TO</div>
      <div class="info-box">
        <strong>\${escapeHtml(address.name || 'Customer')}</strong><br>
        \${escapeHtml(address.line1 || '')}\${address.line2 ? ', ' + escapeHtml(address.line2) : ''}<br>
        \${escapeHtml(address.city || '')}, \${escapeHtml(address.state || '')} \${escapeHtml(address.pincode || '')}<br>
        \${address.country ? escapeHtml(address.country) + '<br>' : ''}
        \${address.mobile ? '<strong>Phone:</strong> ' + escapeHtml(address.mobile) : ''}
      </div>

      <p style="margin-top: 30px;">Every Houra Jewels order is carefully packed by our team. We truly appreciate your support and are grateful to have you as part of our growing community.</p>

      <div class="info-box" style="background-color: #fffbeb; border-color: #fde68a; margin-top: 25px;">
        <strong style="color: #b45309;">✨ Jewelry Care Guide</strong>
        <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">We’ve attached our Jewelry Care Guide with simple tips to help maintain the shine and finish of your jewelry and keep it looking beautiful for longer.</p>
      </div>

      <p style="text-align: center; margin-top: 40px; font-weight: bold; color: #08183A; font-size: 18px;">Thank you for supporting Houra Jewels! 💛</p>
    </div>

    <div class="footer">
      <div style="margin-bottom: 20px;">
        <strong style="font-size: 14px;">Questions?</strong><br>
        support@hourajewels.com | <a href="https://wa.me/19404656563" style="color: #fff; text-decoration: underline;">WhatsApp Chat</a>
      </div>
      <div style="margin-bottom: 20px;">
        <strong>HOURA JEWELS</strong><br>
        <a href="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}" style="color: #D4AF37;">www.hourajewels.com</a> | 
        <a href="https://instagram.com/hourajewels" style="color: #D4AF37;">Instagram: @hourajewels</a>
      </div>
      <div style="margin-bottom: 20px; font-size: 11px;">
        <a href="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}/privacy">Privacy Policy</a> | 
        <a href="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}/terms">Terms & Conditions</a> | 
        <a href="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}/shipping-policy">Shipping & Return Policy</a>
      </div>
      <div style="color: #9ca3af; font-size: 10px;">
        © \${new Date().getFullYear()} Houra Jewels. All rights reserved.<br>
        This is an automated order confirmation email. Please retain this email for your records.
      </div>
    </div>
  </div>
</body>
</html>
\`;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Order Confirmation #' + orderNumber + ' | Houra Jewels',
      html: emailBodyHtml,
      attachments: [
        {
          filename: \`Invoice-\${orderNumber}.pdf\`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });`;

if (!content.includes(searchBlock)) {
  console.log("Could not find the target code to replace!");
  process.exit(1);
}

content = content.replace(searchBlock, replaceBlock);
fs.writeFileSync(file, content);
console.log("Email template patched successfully!");
