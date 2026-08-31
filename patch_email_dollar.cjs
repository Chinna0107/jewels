const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/utils/email.js', 'utf8');

file = file.replace(
  /Pay Now \(\$\{parseFloat\(balanceDue\)\.toFixed\(2\)\} USD\)/g,
  'Pay Now ($$${parseFloat(balanceDue).toFixed(2)} USD)'
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/utils/email.js', file);
console.log('patched email.js dollar sign');
