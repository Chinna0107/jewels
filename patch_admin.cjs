const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

// Replace addressFrom
content = content.replace(
  /const addressFrom = {[\s\S]*?};/,
  `const addressFrom = {
      name: 'Houra Jewels',
      street1: '2965 FM1385',
      city: 'Aubrey',
      state: 'TX',
      zip: '76227',
      country: 'US',
      phone: '+1 737 258 3478',
      email: 'info@hourajewels.com',
    };`
);

// Replace weight calculation
content = content.replace(
  /let weight = config\.weight \? parseFloat\(config\.weight\) : 16;\s*if \(weight <= 0\) weight = 16;/,
  `let totalItemWeight = 0;
    items.forEach(item => {
      let w = parseFloat(item.weight) || 0;
      totalItemWeight += w * (item.qty || 1);
    });
    let baseWeight = config.weight ? parseFloat(config.weight) : 16;
    let weight = totalItemWeight + baseWeight;
    if (weight <= 0) weight = 16;`
);

fs.writeFileSync(file, content);
console.log("Patched admin.js successfully!");
