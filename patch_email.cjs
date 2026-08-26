const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "const imageUrl = i.variant?.images?.[0] || i.product?.image_url || i.images?.[0] || '';",
  `const rawImageUrl = i.variant?.images?.[0] || i.product?.image_url || i.images?.[0] || '';\n      const isBase64 = typeof rawImageUrl === 'string' && rawImageUrl.startsWith('data:image');\n      const imageUrl = isBase64 ? '' : rawImageUrl;`
);
fs.writeFileSync(file, content);
