const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let code = fs.readFileSync(file, 'utf8');

// Fix 1: i.price
code = code.replace(
  /'<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right"> \+ \(i\.price \|\| 0\)\.toFixed\(2\)/g,
  `'<td style="padding:12px;border-bottom:1px solid #f0e0c0;text-align:right">$' + (i.price || 0).toFixed(2)`
);

// Fix 2: refundAmount
code = code.replace(
  /'<p style="margin:4px 0;"><strong>Refund Amount:<\/strong> <span style="color:#059669;font-size:16px;font-weight:bold;"> \+ refundAmount\.toFixed\(2\)/g,
  `'<p style="margin:4px 0;"><strong>Refund Amount:</strong> <span style="color:#059669;font-size:16px;font-weight:bold;">$' + refundAmount.toFixed(2)`
);

fs.writeFileSync(file, code);
console.log('Fixed missing dollar signs in utils/email.js!');
