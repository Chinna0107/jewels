const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const newTotal = Math\.max\(0, newItemsTotal \+ shipping \+ tax - discount\);/;

const replacement = `    const signature_fee = parseFloat(req.body.signature_fee) || 0;
    const insurance_fee = parseFloat(req.body.insurance_fee) || 0;
    const newTotal = Math.max(0, newItemsTotal + shipping + tax + signature_fee + insurance_fee - discount);`;

content = content.replace(regex, replacement);

const updateQueryRegex = /UPDATE orders SET items=\$1, address=\$2, total=\$3, tax_amount=\$4, discount_amount=\$5, note=\$6 WHERE id=\$7/;
const newUpdateQuery = `UPDATE orders SET items=$1, address=$2, total=$3, tax_amount=$4, discount_amount=$5, note=$6 WHERE id=$7`; // Actually it's already accepting these.

// Wait, I need to check the exact UPDATE orders query in routes/admin.js.
fs.writeFileSync(file, content);
