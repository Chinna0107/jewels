const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /'SELECT id, name, email, phone, country, avatar_url, role, is_verified, phone_verified, email_verified, created_at FROM users ORDER BY created_at DESC'/,
  "`SELECT u.id, u.name, u.email, u.phone, u.country, u.avatar_url, u.role, u.is_verified, u.phone_verified, u.email_verified, u.created_at, (SELECT row_to_json(a) FROM addresses a WHERE a.user_id = u.id AND a.is_default = TRUE LIMIT 1) as default_address FROM users u ORDER BY u.created_at DESC`"
);

fs.writeFileSync(file, content);
console.log("Patched admin users query!");
