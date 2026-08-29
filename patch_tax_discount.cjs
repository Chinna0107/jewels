const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const tax = parseFloat\(order\.tax_amount\) \|\| 0;\n    const discount = parseFloat\(order\.discount_amount\) \|\| 0;/;

const replacement = `    const tax = req.body.tax_amount !== undefined ? parseFloat(req.body.tax_amount) : (parseFloat(order.tax_amount) || 0);
    const discount = req.body.discount_amount !== undefined ? parseFloat(req.body.discount_amount) : (parseFloat(order.discount_amount) || 0);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
