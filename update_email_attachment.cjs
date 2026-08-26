const fs = require('fs');

const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const searchStr = `attachments: [
        {
          filename: \`Invoice-\${orderNumber}.pdf\`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]`;

const replaceStr = `attachments: [
        {
          filename: \`Invoice-\${orderNumber}.pdf\`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        },
        {
          filename: 'Houra Jewels - Jewelry Care Guide.png',
          path: require('path').join(__dirname, '../assets/inst.png'),
          contentType: 'image/png'
        }
      ]`;

if (!content.includes(searchStr)) {
  console.log("Could not find attachments array");
  process.exit(1);
}

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(file, content);
console.log("Attachment patched.");
