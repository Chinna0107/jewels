const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'src="https://hourajewels.com/assets/logo.png"',
  'src="https://raw.githubusercontent.com/Chinna0107/jewels/main/src/assets/logo.png"'
);
fs.writeFileSync(file, content);
