const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let code = fs.readFileSync(file, 'utf8');

const regex = /async function sendRefundEmail[\s\S]*$/;

const newEmails = `async function sendRefundEmail({ order, refundId, refundAmount, cancelType, cancelledItems, remainingItems, transactionCharge }) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email;
    const orderNum = order.order_number || order.id;

    const cancelledRows = (cancelledItems || []).map(i => {
      const imageUrl = i.variant?.images?.[0] || i.product?.image_url || i.images?.[0] || '';
      return '<tr>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;display:flex;align-items:center;">' +
          (imageUrl ? '<img src="' + imageUrl + '" alt="' + (i.name || 'Item') + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:12px;" />' : '') +
          '<span style="color:#08183A;font-weight:bold;">' + (i.name || 'Item') + (i.color ? ' - '+i.color : '') + (i.size ? ' - Size: '+i.size : '') + '</span>' +
        '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:center">' + i.qty + '</td>' +
        '<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right">$' + (i.price || 0).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    const htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
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
    try { address = typeof order.address === \'string\' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email;
    const orderNum = order.order_number || order.id;

    const htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<h1 style="color:#08183A;margin:0;font-family:serif;font-size:28px;letter-spacing:2px;">HOURA JEWELS</h1>' +
      '</div>' +
      '<h2 style="color:#08183A;text-align:center;">Great news! Your order has shipped ✨</h2>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Hi <strong>' + (address.name || order.user_name || 'Customer') + '</strong>,</p>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Your Houra Jewels order #' + orderNum + ' is on its way to you.</p>' +
      
      '<div style="background:#fff;padding:16px;border-radius:8px;border:1px solid #f0e0c0;margin:24px 0;text-align:center;">' +
        '<p style="margin:4px 0 16px 0;color:#555;">Track your package using the link below:</p>' +
        '<a href="' + (order.tracking_url || '#') + '" style="display:inline-block;padding:12px 24px;background:#08183A;color:#D4AF37;text-decoration:none;font-weight:bold;border-radius:6px;letter-spacing:1px;">TRACK MY ORDER</a>' +
        '<p style="margin:16px 0 4px 0;font-size:13px;color:#777;">Tracking Number: <strong>' + (order.tracking_number || 'N/A') + '</strong></p>' +
      '</div>' +

      '<p style="color:#333;font-size:14px;line-height:1.5;margin-top:24px;text-align:center;">' +
        'Please allow up to 24 hours for the tracking information to update.' +
      '</p>' +

      '<div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;font-size:14px;color:#555;">If you have any questions, please contact us at <a href="mailto:support@hourajewels.com" style="color:#b45309;text-decoration:none;">support@hourajewels.com</a>.</p>' +
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
      subject: 'Your order has shipped! – #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
  } catch (err) {
    console.error('Customer shipped email send failed:', err);
  }
}

async function sendOrderDeliveredEmail(order) {
  try {
    let address = {};
    try { address = typeof order.address === \'string\' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email;
    const orderNum = order.order_number || order.id;

    const htmlContent = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #f0e0c0;border-radius:12px;background:#FAFAFA;">' +
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<h1 style="color:#08183A;margin:0;font-family:serif;font-size:28px;letter-spacing:2px;">HOURA JEWELS</h1>' +
      '</div>' +
      '<h2 style="color:#08183A;text-align:center;">Your order has been delivered! 🎁</h2>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Hi <strong>' + (address.name || order.user_name || 'Customer') + '</strong>,</p>' +
      '<p style="color:#333;font-size:15px;line-height:1.5;">Great news! Your Houra Jewels order #' + orderNum + ' has been marked as delivered by the carrier.</p>' +
      
      '<div style="background:#fff;padding:24px;border-radius:8px;border:1px solid #f0e0c0;margin:24px 0;text-align:center;">' +
        '<h3 style="color:#059669;margin:0 0 12px 0;">✓ Delivered Successfully</h3>' +
        '<p style="margin:4px 0;color:#555;font-size:14px;">Tracking Number: <strong>' + (order.tracking_number || 'N/A') + '</strong></p>' +
      '</div>' +

      '<p style="color:#333;font-size:14px;line-height:1.5;margin-top:24px;text-align:center;">' +
        'We hope you love your new pieces! Don\\'t forget to share your look with us on Instagram.' +
      '</p>' +

      '<div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #f0e0c0;">' +
        '<p style="margin:4px 0;font-size:14px;color:#555;">If you haven\\'t received your package, please contact us at <a href="mailto:support@hourajewels.com" style="color:#b45309;text-decoration:none;">support@hourajewels.com</a>.</p>' +
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
      subject: 'Delivered: Your order #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
  } catch (err) {
    console.error('Customer delivered email send failed:', err);
  }
}

module.exports = { transporter, sendOrderEmailToAdmin, sendOrderEmailToCustomer, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail };
`;

code = code.replace(regex, newEmails);
fs.writeFileSync(file, code);
console.log('Successfully updated email.js with new templates!');
