const fs = require('fs');
const path = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | Houra Jewels',
      html: htmlContent,`;

const emailBodyHtml = `    const emailBodyHtml = \`
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
</html>
\`;

    await transporter.sendMail({
      from: '"Houra Jewels" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | Houra Jewels',
      html: emailBodyHtml,`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, emailBodyHtml);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched email.js');
} else {
  console.log('Target string not found in email.js');
}
