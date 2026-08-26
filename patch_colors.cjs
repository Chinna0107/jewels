const fs = require('fs');
const path = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(path, 'utf8');

// The PDF HTML part has:
// <span style="font-family:serif;font-weight:900;font-size:22px;color:#08183A;line-height:1;">Houra Jewels</span>
// <span style="font-size:10px;font-weight:600;color:#D4AF37;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">By S & M</span>

// We want Houra Jewels to be GOLD (#D4AF37) and By S & M to be DARK BLUE (#08183A)

content = content.replace(
  '<span style="font-family:serif;font-weight:900;font-size:22px;color:#08183A;line-height:1;">Houra Jewels</span>',
  '<span style="font-family:serif;font-weight:900;font-size:22px;color:#D4AF37;line-height:1;letter-spacing:0.12em;text-transform:uppercase;">HOURA JEWELS</span>'
);

content = content.replace(
  '<span style="font-size:10px;font-weight:600;color:#D4AF37;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">By S & M</span>',
  '<span style="font-size:10px;font-weight:600;color:#08183A;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">By S & M</span>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed colors in email.js');
