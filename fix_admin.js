const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "} else if (status === 'ready for pickup') {",
  "if (status === 'ready for pickup') {"
);
content = content.replace(
  "      if (status === 'shipped') {",
  "      } else if (status === 'shipped') {"
);

fs.writeFileSync(file, content);
