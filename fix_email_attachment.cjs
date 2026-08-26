const fs = require('fs');

const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `path: require('path').join(__dirname, '../assets/inst.png'),`;
const replaceStr = `href: (process.env.FRONTEND_URL || 'https://hourajewels.com') + '/images/inst.png',`;

if (!content.includes(searchStr)) {
  console.log("Could not find path attachment");
  process.exit(1);
}

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(file, content);
console.log("Attachment fixed to use URL.");
