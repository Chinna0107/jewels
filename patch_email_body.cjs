const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let code = fs.readFileSync(file, 'utf8');

const oldCode = `            ${Number(shipping) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Shipping:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(shipping).toFixed(2)}</td>
            </tr>\` : ''}
            ${Number(tax) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Sales Tax:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(tax).toFixed(2)}</td>
            </tr>\` : ''}`;

const newCode = `            ${Number(shipping) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Shipping:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(shipping).toFixed(2)}</td>
            </tr>\` : ''}
            ${Number(address?.signature_fee) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Signature Confirmation:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(address.signature_fee).toFixed(2)}</td>
            </tr>\` : ''}
            ${Number(address?.insurance_fee) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Shipping Insurance:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(address.insurance_fee).toFixed(2)}</td>
            </tr>\` : ''}
            ${Number(tax) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Sales Tax:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\${Number(tax).toFixed(2)}</td>
            </tr>\` : ''}`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync(file, code);
  console.log("Successfully added signature and insurance to email body html.");
} else {
  console.log("Could not find the exact old code to replace.");
}
