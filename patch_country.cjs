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

// Patch admin.js
const adminFile = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let adminContent = fs.readFileSync(adminFile, 'utf8');

if (!adminContent.includes('function getCountryCode')) {
  adminContent = adminContent.replace("const router = express.Router();", "const router = express.Router();\n" + utilCode);
}
adminContent = adminContent.replace(/country: address\.country \|\| 'US'/g, "country: getCountryCode(address.country)");
// also check for addressFrom country? addressFrom is hardcoded 'US'

fs.writeFileSync(adminFile, adminContent);

// Patch general.js
const generalFile = '/Users/hemanthkancharla/jewelsbe/routes/general.js';
let generalContent = fs.readFileSync(generalFile, 'utf8');

if (!generalContent.includes('function getCountryCode')) {
  generalContent = generalContent.replace("const router = express.Router();", "const router = express.Router();\n" + utilCode);
}

// In general.js, it says: `country,` or `country: country,` inside `shippo.addresses.create`
generalContent = generalContent.replace(
  /country,\s+phone: phone \|\| '',\s+validate: true/g,
  "country: getCountryCode(country),\n      phone: phone || '',\n      validate: true"
);

fs.writeFileSync(generalFile, generalContent);
console.log("Patched both files.");
