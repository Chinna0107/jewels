const fs = require('fs');
let file = fs.readFileSync('src/components/OrderCard.jsx', 'utf8');
file = file.replace(/\\n/g, '\n');
fs.writeFileSync('src/components/OrderCard.jsx', file);
