const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
const code = fs.readFileSync(file, 'utf8');

const lines = code.split('\n');
const imgLines = lines.filter(l => l.includes('<img'));
console.log(imgLines.join('\n'));
