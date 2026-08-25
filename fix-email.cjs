const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let code = fs.readFileSync(file, 'utf8');

// Find the start and end of sendOrderEmailToCustomer
const startIdx = code.indexOf('async function sendOrderEmailToCustomer');
const exportsIdx = code.lastIndexOf('module.exports');

if (startIdx !== -1 && exportsIdx !== -1) {
    const before = code.substring(0, startIdx);
    const after = code.substring(exportsIdx);

    const newFunc = `async function sendOrderEmailToCustomer(orderNumber, total, address, items, customerEmail, subtotal, discount, shipping, tax) {
  try {
    const addr = address || {};
    const itemRows = (items || []).map(i => {
      const price = i.variant?.price || i.product?.price || 0;
      const imageUrl = i.variant?.images?.[0] || i.product?.image_url || i.product?.images?.[0] || '';
      return '<tr>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;display:flex;align-items:center;">' +
          (imageUrl ? '<img src="' + imageUrl + '" alt="' + (i.product?.name || 'Item') + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:12px;" />' : '') +
          '<a href="https://hourajewels.com/product/' + (i.product?.id || '') + '" style="color:#08183A;text-decoration:none;font-weight:bold;">' + (i.product?.name || 'Item') + (i.variant?.color ? ' - '+i.variant.color : '') + (i.size ? ' - Size: '+i.size : '') + '</a>' +
        '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:center">' + i.qty + '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right">$' + parseFloat(price).toFixed(2) + '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right;font-weight:bold;">$' + (parseFloat(price) * i.qty).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    const discountVal = parseFloat(discount || 0);
    const shippingVal = parseFloat(shipping || 0);
    const taxVal = parseFloat(tax || 0);
    const subtotalVal = parseFloat(subtotal || total);
    const orderTotal = (subtotalVal - discountVal + shippingVal + taxVal).toFixed(2);
    const date = new Date().toLocaleString();

    let attachments = [];
    const careGuidePath = require('path').join(__dirname, '..', 'public', 'images', 'inst.png');
    if (require('fs').existsSync(careGuidePath)) {
        attachments.push({
            filename: 'Houra Jewels – Jewelry Care Guide.png',
            path: careGuidePath
        });
    }

    const htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<h1 style="color:#08183A;margin:0;font-family:serif;font-size:28px;letter-spacing:2px;">HOURA JEWELS</h1>' +
        '<p style="color:#b45309;font-style:italic;margin-top:4px;font-size:14px;">Wear it once, Love it for ever</p>' +
      '</div>' +
      '<h2 style="color:#08183A;text-align:center;">Thank You for Your Order! ✨</h2>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Hi <strong>' + (addr.name || 'Customer') + '</strong>,</p>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Thank you for choosing Houra Jewels. We\\'re pleased to confirm that your order has been successfully placed and your payment has been received.</p>' +
      '<div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #f0e0c0;margin:24px 0;">' +
        '<p style="margin:4px 0;"><strong>Order Number:</strong> #' + orderNumber + '</p>' +
        '<p style="margin:4px 0;"><strong>Order Date:</strong> ' + date + '</p>' +
        '<p style="margin:4px 0;"><strong>Payment Status:</strong> <span style="color:#059669;font-weight:bold;">Paid ✓</span></p>' +
      '</div>' +
      '<h3 style="color:#08183A;border-bottom:2px solid #f0e0c0;padding-bottom:8px;">ORDER SUMMARY</h3>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px;background:#fff;">' +
        '<thead><tr style="background:#fff7ed;color:#b45309;">' +
          '<th style="padding:10px;text-align:left">Product</th>' +
          '<th style="padding:10px">Qty</th>' +
          '<th style="padding:10px;text-align:right">Price</th>' +
          '<th style="padding:10px;text-align:right">Total</th>' +
        '</tr></thead>' +
        '<tbody>' + itemRows + '</tbody>' +
      '</table>' +
      '<div style="margin-top:20px;text-align:right;font-size:14px;background:#fff;padding:16px;border-radius:8px;border:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;">Subtotal: $' + subtotalVal.toFixed(2) + '</p>' +
        (discountVal > 0 ? '<p style="margin:4px 0;color:#059669;">Discount: -$' + discountVal.toFixed(2) + '</p>' : '') +
        '<p style="margin:4px 0;">Shipping: ' + (shippingVal > 0 ? '$'+shippingVal.toFixed(2) : 'Free') + '</p>' +
        (taxVal > 0 ? '<p style="margin:4px 0;">Sales Tax: $' + taxVal.toFixed(2) + '</p>' : '') +
        '<p style="margin:8px 0;font-size:18px;font-weight:bold;color:#08183A;border-top:1px solid #eee;padding-top:8px;">Order Total: $' + orderTotal + '</p>' +
      '</div>' +
      '<h3 style="color:#08183A;border-bottom:2px solid #f0e0c0;padding-bottom:8px;margin-top:32px;">Shipping To</h3>' +
      '<p style="margin:4px 0;font-weight:bold;color:#333;">' + (addr.name || '') + '</p>' +
      '<p style="margin:4px 0;color:#555;">' + (addr.line1 || '') + '</p>' +
      '<p style="margin:4px 0;color:#555;">' + [addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') + '</p>' +
      '<p style="margin:4px 0;color:#555;">' + (addr.country || '') + '</p>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;margin-top:32px;">' +
        'Every Houra Jewels order is carefully packed by our team. We truly appreciate your support and are grateful to have you as part of our growing community.' +
      '</p>' +
      '<div style="background:#fff7ed;padding:20px;border-radius:8px;border:1px dashed #b45309;margin:24px 0;">' +
        '<h4 style="color:#b45309;margin:0 0 8px 0;font-size:16px;">✨ Jewelry Care Guide</h4>' +
        '<p style="color:#555;font-size:14px;margin:0;">' +
          'We\\'ve attached our Jewelry Care Guide with simple tips to help maintain the shine and finish of your jewelry and keep it looking beautiful for longer.' +
        '</p>' +
      '</div>' +
      '<p style="text-align:center;font-size:16px;font-weight:bold;color:#08183A;margin-top:32px;">' +
        'Thank you for supporting Houra Jewels! 💛' +
      '</p>' +
      '<div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;font-size:14px;color:#555;"><strong>Questions?</strong></p>' +
        '<p style="margin:4px 0;font-size:14px;"><a href="mailto:support@hourajewels.com" style="color:#b45309;text-decoration:none;">support@hourajewels.com</a> | <a href="https://wa.me/message/YOUR_WHATSAPP" style="color:#25D366;text-decoration:none;">WhatsApp Chat</a></p>' +
        '<p style="margin:16px 0 4px 0;font-weight:bold;color:#08183A;font-size:18px;">HOURA JEWELS</p>' +
        '<p style="margin:4px 0;font-size:12px;color:#777;">' +
          '<a href="https://hourajewels.com" style="color:#777;text-decoration:none;">hourajewels.com</a> | ' +
          '<a href="https://www.instagram.com/hourajewels?igsh=c2llNGRzM2RpbHZ3&utm_source=qr" style="color:#777;text-decoration:none;">Instagram: @hourajewels</a>' +
        '</p>' +
        '<p style="margin:16px 0;font-size:10px;color:#aaa;">' +
          '<a href="https://hourajewels.com/privacy-policy" style="color:#aaa;">Privacy Policy</a> | ' +
          '<a href="https://hourajewels.com/terms-conditions" style="color:#aaa;">Terms & Conditions</a> | ' +
          '<a href="https://hourajewels.com/shipping-return-policy" style="color:#aaa;">Shipping & Return Policy</a>' +
        '</p>' +
        '<p style="margin:4px 0;font-size:10px;color:#aaa;">© ' + new Date().getFullYear() + ' Houra Jewels. All rights reserved.</p>' +
        '<p style="margin:4px 0;font-size:10px;color:#aaa;">This is an automated order confirmation email. Please retain this email for your records.</p>' +
      '</div>' +
    '</div>';

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: customerEmail,
      subject: 'Order Confirmation #' + orderNumber + ' | Houra Jewels',
      html: htmlContent,
      attachments
    });
  } catch (err) {
    console.error('Customer email send failed:', err);
  }
}

`;
    
    const finalCode = before + newFunc + after;
    fs.writeFileSync(file, finalCode);
    console.log('Fixed email.js successfully!');
} else {
    console.log('Could not find boundaries.');
}
