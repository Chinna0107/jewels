const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let content = fs.readFileSync(file, 'utf8');

const target = "${Number(tax) > 0 ? `<tr>";
const replacement = "${Number(address?.signature_fee) > 0 ? `<tr>\n              <td style=\"padding: 6px 10px; color: #555; font-size: 13px; text-align: right;\">Signature Confirmation:</td>\n              <td style=\"padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;\">$$${Number(address.signature_fee).toFixed(2)}</td>\n            </tr>` : ''}\n            ${Number(address?.insurance_fee) > 0 ? `<tr>\n              <td style=\"padding: 6px 10px; color: #555; font-size: 13px; text-align: right;\">Shipping Insurance:</td>\n              <td style=\"padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;\">$$${Number(address.insurance_fee).toFixed(2)}</td>\n            </tr>` : ''}\n            ${Number(tax) > 0 ? `<tr>";

if(content.includes(target)) {
  fs.writeFileSync(file, content.replace(target, replacement));
  console.log("Successfully added fees to email!");
} else {
  console.log("Could not find target string.");
}
