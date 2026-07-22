const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/CategoryListingPage.jsx',
  'src/pages/AboutPage.jsx',
  'src/pages/ContactPage.jsx',
  'src/components/Header.jsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Specific overrides first
  content = content.replace(/bg-\[#C16E4F\]/g, 'bg-[#08183A]');
  content = content.replace(/bg-\[#C16E4F\]\/10/g, 'bg-[#D4AF37]/10');
  content = content.replace(/bg-\[#C16E4F\]\/20/g, 'bg-[#D4AF37]/20');
  content = content.replace(/border-\[#C16E4F\]\/10/g, 'border-[#D4AF37]/20');
  content = content.replace(/border-\[#C16E4F\]/g, 'border-[#D4AF37]');
  content = content.replace(/bg-orange-50/g, 'bg-[#D4AF37]/10');
  
  // General colors
  content = content.replace(/#C16E4F/g, '#D4AF37'); // Any remaining orange to Gold
  content = content.replace(/#5C4033/g, '#08183A'); // Dark brown to Dark Blue
  content = content.replace(/#FDFBF7/g, '#FDF8F0'); // Background beige update

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated colors in ${file}`);
});
