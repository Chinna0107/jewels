const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/index.js', 'utf8');

file = file.replace(
  /\`\%\$\\{paymentLink\\}\%\`/,
  '`%${linkUrl}%`'
);
file = file.replace(
  /\`\%\$\{paymentLink\}\%\`/,
  '`%${linkUrl}%`'
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/index.js', file);
console.log('patched index.js webhook URL properly');
