const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const readyForPickupFunc = `
async function sendReadyForPickupEmail(order) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email || order.email || address.email;
    const orderNum = order.order_number || order.id;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);

    const htmlContent = \`
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;filter:brightness(0) invert(1);" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Ready for Pickup! 🛍️</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Great news! Your Houra Jewels order <strong>#\${escapeHtml(orderNum)}</strong> is now ready for pickup.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #059669; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <h3 style="color:#059669;margin:0 0 10px 0;font-size:18px;">✓ Ready For Pickup</h3>
      <p style="margin:0;font-size:14px;color:#333;"><strong>Location:</strong> 2965 FM1385, Aubrey, TX 76227</p>
      <p style="margin:10px 0 0 0;font-size:13px;color:#777;">Please come pick it up at your convenience!</p>
    </div>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">&copy; \${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">Texas, 76227 | support@hourajewels.com | +1 940-465-6563</p>
  </div>
</div>
</body>
</html>
\`;

    await transporter.sendMail({
      from: '"Houra Jewels" <info@hourajewels.com>',
      to: customerEmail,
      subject: 'Ready for Pickup: Your order #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
    console.log('Customer ready for pickup email sent');
  } catch (err) {
    console.error('Customer ready for pickup email send failed:', err);
  }
}
\`;

const pickupCompletedFunc = `
async function sendPickupCompletedEmail(order) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email || order.email || address.email;
    const orderNum = order.order_number || order.id;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[match]);

    const htmlContent = \`
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Arial,sans-serif;">
<div style="max-width:600px; margin: 40px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
  <div style="background-color:#08183A; padding:40px 20px; text-align:center;">
    <img src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png" alt="Houra Jewels Logo" style="height:70px;width:auto;margin-bottom:15px;filter:brightness(0) invert(1);" />
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Pickup Completed! ✅</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      This email is to confirm that your Houra Jewels order <strong>#\${escapeHtml(orderNum)}</strong> has been successfully picked up.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #059669; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <h3 style="color:#059669;margin:0 0 10px 0;font-size:18px;">✓ Order Picked Up</h3>
    </div>
    <p style="color:#333; font-size:14px; line-height:1.6; margin-bottom:10px;text-align:center;">We hope you love your new pieces! Don't forget to share your look with us on Instagram.</p>
  </div>
  <div style="background-color:#f9f9f9; padding:25px; text-align:center; border-top:1px solid #eee;">
    <p style="margin:0; font-size:12px; color:#888;">&copy; \${new Date().getFullYear()} Houra Jewels. All rights reserved.</p>
    <p style="margin:5px 0 0 0; font-size:12px; color:#888;">Texas, 76227 | support@hourajewels.com | +1 940-465-6563</p>
  </div>
</div>
</body>
</html>
\`;

    await transporter.sendMail({
      from: '"Houra Jewels" <info@hourajewels.com>',
      to: customerEmail,
      subject: 'Pickup Completed: Your order #' + orderNum + ' | Houra Jewels',
      html: htmlContent
    });
    console.log('Customer pickup completed email sent');
  } catch (err) {
    console.error('Customer pickup completed email send failed:', err);
  }
}
\`;

if (!content.includes('sendReadyForPickupEmail')) {
  content = content.replace('module.exports = {', readyForPickupFunc + '\n' + pickupCompletedFunc + '\nmodule.exports = {');
  content = content.replace('module.exports = {', 'module.exports = { sendReadyForPickupEmail, sendPickupCompletedEmail,');
  fs.writeFileSync(file, content);
  console.log('Updated email.js');
} else {
  console.log('Already exists');
}
