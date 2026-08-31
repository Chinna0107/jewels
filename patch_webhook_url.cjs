const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/index.js', 'utf8');

file = file.replace(
  /\`\%(\$|\{)paymentLink(\}|\%)\`/,
  '`%${linkUrl}%`'
);

file = file.replace(
  /edit_history = edit_history \|\| \$1::jsonb/g,
  'edit_history = COALESCE(edit_history, \'[]\'::jsonb) || $1::jsonb,\n            status = CASE WHEN status = \'pending\' THEN \'paid\' ELSE status END'
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/index.js', file);
console.log('patched index.js webhook URL and status');
