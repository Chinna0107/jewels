const fs = require('fs');

const utilCode = `
const COUNTRIES = require('../countries');
function getCountryCode(c) {
  if (!c) return 'US';
  const cname = c.trim();
  if (cname.length === 2) return cname.toUpperCase();
  const match = COUNTRIES.find(x => x.name.toLowerCase() === cname.toLowerCase());
  return match ? match.code : 'US';
}
`;

const adminFile = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let adminContent = fs.readFileSync(adminFile, 'utf8');

if (!adminContent.includes('function getCountryCode')) {
  adminContent = adminContent.replace("const router = require('express').Router();", "const router = require('express').Router();\n" + utilCode);
  fs.writeFileSync(adminFile, adminContent);
}

const generalFile = '/Users/hemanthkancharla/jewelsbe/routes/general.js';
let generalContent = fs.readFileSync(generalFile, 'utf8');

if (!generalContent.includes('function getCountryCode')) {
  generalContent = generalContent.replace("const router = require('express').Router();", "const router = require('express').Router();\n" + utilCode);
  fs.writeFileSync(generalFile, generalContent);
}
console.log("Patched correctly.");
