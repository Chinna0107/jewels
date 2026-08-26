const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const puppeteer = require('puppeteer');", "// Dynamic import for puppeteer used inside function");
content = content.replace(
  "const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });",
  "const { default: puppeteer } = await import('puppeteer');\n    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });"
);

fs.writeFileSync(file, content);
console.log("Puppeteer ESM error fixed.");
