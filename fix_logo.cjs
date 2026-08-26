const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `src="\${process.env.FRONTEND_URL || 'https://hourajewels.com'}/logo.png"`;
const replaceStr = `src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png"`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(file, content);
console.log("Logo URL fixed.");
