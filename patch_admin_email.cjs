const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `    // 4. Send Confirmation Emails
    try {
      const emailModule = require('../utils/email');
      const customerEmail = finalAddress?.email || '';
      
      if (emailModule.sendOrderEmailToAdmin) {
        await emailModule.sendOrderEmailToAdmin(orderNumber, total, finalAddress, items);
      }
      if (emailModule.sendOrderEmailToCustomer && customerEmail) {
        await emailModule.sendOrderEmailToCustomer(
          orderNumber,
          total,
          finalAddress,
          items,
          customerEmail,
          total,
          discount_amount || 0,
          tax_amount || 0,
          shipping_fee || 0,
          { payment_method: pMethod, status: oStatus, order_type: order_type || 'shipping' }
        );
      }
    } catch (emailErr) {
      console.error('Failed to send order emails on admin create:', emailErr);
    }

    res.json({ success: true, order: result.rows[0] });`;

content = content.replace(/    res\.json\(\{ success: true, order: result\.rows\[0\] \}\);/, replacement);

fs.writeFileSync(file, content);
console.log('Patched admin order creation to send emails!');
