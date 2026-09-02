const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "      }\n      } else if (status === 'shipped') {",
  "      } else if (status === 'shipped') {"
);

fs.writeFileSync(file, content);
