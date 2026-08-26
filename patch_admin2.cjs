const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("labelFileType: 'PDF'", "labelFileType: 'PDF_4x6'");

fs.writeFileSync(file, content);
