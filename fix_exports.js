const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/module\.exports = {.*};/, 'module.exports = { transporter, sendOrderEmailToAdmin, sendPaymentLinkEmail, sendOrderEmailToCustomer, sendRefundEmail, sendOrderShippedEmail, sendOrderDeliveredEmail };');
fs.writeFileSync(file, content);
