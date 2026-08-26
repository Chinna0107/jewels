const fs = require('fs');

// --- Patch admin.js ---
const adminJsPath = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let adminContent = fs.readFileSync(adminJsPath, 'utf8');

const targetAdminStr = `router.put('/orders/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

const replacedAdminStr = `router.put('/orders/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    const order = result.rows[0];
    
    if (order) {
      const userResult = await pool.query('SELECT email, name FROM users WHERE id=$1', [order.user_id]);
      if (userResult.rows.length > 0) {
        order.user_email = userResult.rows[0].email;
        order.user_name = userResult.rows[0].name;
      }
      
      if (status === 'shipped') {
        const { sendOrderShippedEmail } = require('../utils/email');
        await sendOrderShippedEmail(order);
      } else if (status === 'delivered') {
        const { sendOrderDeliveredEmail } = require('../utils/email');
        await sendOrderDeliveredEmail(order);
      }
    }
    
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;

if (adminContent.includes(targetAdminStr)) {
  adminContent = adminContent.replace(targetAdminStr, replacedAdminStr);
  fs.writeFileSync(adminJsPath, adminContent, 'utf8');
  console.log('Successfully patched admin.js');
} else {
  console.log('Failed to patch admin.js: Target string not found');
}


// --- Patch email.js ---
const emailJsPath = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let emailContent = fs.readFileSync(emailJsPath, 'utf8');

// Replace sendOrderShippedEmail
const targetShippedStart = "async function sendOrderShippedEmail(order) {";
const targetShippedEnd = "async function sendOrderDeliveredEmail(order) {";
let shippedBlock = emailContent.substring(emailContent.indexOf(targetShippedStart), emailContent.indexOf(targetShippedEnd));

const newShippedBlock = `async function sendOrderShippedEmail(order) {
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
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Order Shipped! ✨</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Great news! Your Houra Jewels order <strong>#\${escapeHtml(orderNum)}</strong> has been shipped and is on its way to you.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #D4AF37; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <p style="margin:0 0 15px 0;color:#555;font-size:14px;">Track your package using the link below:</p>
      <a href="\${order.tracking_url || '#'}" style="display:inline-block;padding:12px 24px;background-color:#08183A;color:#D4AF37;text-decoration:none;font-weight:bold;border-radius:6px;letter-spacing:1px;font-size:14px;">TRACK MY ORDER</a>
      <p style="margin:15px 0 0 0;font-size:13px;color:#777;">Tracking Number: <strong>\${escapeHtml(order.tracking_number || 'N/A')}</strong></p>
    </div>
    <p style="color:#333; font-size:14px; line-height:1.6; margin-bottom:10px;text-align:center;">Please allow up to 24 hours for the tracking information to update.</p>
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

`;

emailContent = emailContent.replace(shippedBlock, newShippedBlock);

// Replace sendOrderDeliveredEmail
const targetDeliveredStart = "async function sendOrderDeliveredEmail(order) {";
const targetDeliveredEnd = "module.exports =";
let deliveredBlock = emailContent.substring(emailContent.indexOf(targetDeliveredStart), emailContent.indexOf(targetDeliveredEnd));

const newDeliveredBlock = `async function sendOrderDeliveredEmail(order) {
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
    <h1 style="color:#D4AF37; margin:0; font-family:serif; font-size:28px; font-weight:700;">Order Delivered! 🎁</h1>
  </div>
  <div style="padding:40px 30px;">
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">Hi \${escapeHtml(address.name || order.user_name || 'Customer')},</p>
    <p style="color:#333; font-size:16px; line-height:1.6; margin-bottom:20px;">
      Great news! Your Houra Jewels order <strong>#\${escapeHtml(orderNum)}</strong> has been marked as delivered by the carrier.
    </p>
    <div style="background-color:#f8fafc; border-left:4px solid #059669; padding:20px; margin-bottom:30px; border-radius:0 8px 8px 0; text-align:center;">
      <h3 style="color:#059669;margin:0 0 10px 0;font-size:18px;">✓ Delivered Successfully</h3>
      <p style="margin:0;font-size:13px;color:#777;">Tracking Number: <strong>\${escapeHtml(order.tracking_number || 'N/A')}</strong></p>
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

`;

emailContent = emailContent.replace(deliveredBlock, newDeliveredBlock);

fs.writeFileSync(emailJsPath, emailContent, 'utf8');
console.log('Successfully patched email.js with premium shipped/delivered templates');
