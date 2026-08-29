const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\(SELECT row_to_json\(a\) FROM addresses a WHERE a\.user_id = u\.id AND a\.is_default = TRUE LIMIT 1\) as default_address/,
  "(SELECT json_agg(a) FROM (SELECT * FROM addresses WHERE user_id = u.id ORDER BY is_default DESC, created_at DESC) a) as addresses"
);

fs.writeFileSync(file, content);
console.log("Patched admin users query to fetch all addresses!");
