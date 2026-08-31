const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/utils/email.js', 'utf8');

file = file.replace(
  /\$\{parseFloat\(balanceDue\)\.toFixed\(2\)\}<\/strong>/g,
  '$\${parseFloat(balanceDue).toFixed(2)} USD</strong>'
);

file = file.replace(
  /Pay Now \(\$\{parseFloat\(balanceDue\)\.toFixed\(2\)\}\)/g,
  'Pay Now ($${parseFloat(balanceDue).toFixed(2)} USD)'
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/utils/email.js', file);
console.log('patched email.js');
