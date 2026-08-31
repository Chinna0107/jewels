const fs = require('fs');
const file = 'src/pages/admin/AdminOrdersPage.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "fetch(`${BACKEND_URL}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })",
  "fetch(`${BACKEND_URL}/admin/orders?t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })"
);
fs.writeFileSync(file, content);
console.log('Patched AdminOrdersPage.jsx to prevent caching');
