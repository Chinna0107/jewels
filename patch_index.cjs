const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/index.js', 'utf8');

file = file.replace(
  /UPDATE orders SET balance_due=0, payment_link_url=NULL,\s*edit_history = edit_history \|\| \$1::jsonb\s*WHERE payment_link_url ILIKE \$2/,
  `UPDATE orders SET balance_due=0, payment_link_url=NULL,
            transaction_id = COALESCE(transaction_id, $3),
            edit_history = edit_history || $1::jsonb
           WHERE payment_link_url ILIKE $2`
);

file = file.replace(
  /\[JSON\.stringify\(\[\{ timestamp: new Date\(\)\.toISOString\(\), note: 'Balance paid via Stripe payment link', amount: session\.amount_total \/ 100 \}\]\), \`%\$\{paymentLink\}%\`\]/,
  `[JSON.stringify([{ timestamp: new Date().toISOString(), note: 'Balance paid via Stripe payment link', amount: session.amount_total / 100 }]), \`%\${paymentLink}%\`, session.payment_intent || session.id]`
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/index.js', file);
console.log('patched index.js');
