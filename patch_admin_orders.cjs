const fs = require('fs');
let file = fs.readFileSync('src/pages/admin/AdminOrdersPage.jsx', 'utf8');

// Replace {order.insurance_amount} with {Number(order.insurance_amount).toFixed(2)}
file = file.replace(/\{order\.insurance_amount\}/g, '{Number(order.insurance_amount || 0).toFixed(2)}');

fs.writeFileSync('src/pages/admin/AdminOrdersPage.jsx', file);

let shippo = fs.readFileSync('src/components/admin/ShippoConfigModal.jsx', 'utf8');
shippo = shippo.replace(/\{order\.insurance_amount\}/g, '{Number(order.insurance_amount || 0).toFixed(2)}');
fs.writeFileSync('src/components/admin/ShippoConfigModal.jsx', shippo);
console.log('patched AdminOrdersPage and ShippoConfigModal');
