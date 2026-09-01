const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/utils/email.js';
let code = fs.readFileSync(file, 'utf8');

const targetString = "            ${Number(tax) > 0 ? `<tr>";
const insertString = `            \${Number(address?.signature_fee) > 0 ? \\\`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Signature Confirmation:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\\${Number(address.signature_fee).toFixed(2)}</td>
            </tr>\\\` : ''}
            \${Number(address?.insurance_fee) > 0 ? \\\`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Shipping Insurance:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\\${Number(address.insurance_fee).toFixed(2)}</td>
            </tr>\\\` : ''}
            \${Number(tax) > 0 ? \\\`<tr>`;

// We will find the targetString and replace it with insertString
// But wait, targetString appears twice (once in PDF, once in email body)
// Let's replace ONLY the second one or replace all?
// The PDF uses:
// ${Number(tax) > 0 ? `<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #F6EFEF;">${Number(tax).toFixed(2)}</td></tr>` : ''}

// The Email Body uses:
// ${Number(tax) > 0 ? `<tr>

// So we can find "            ${Number(tax) > 0 ? `<tr>"
if (code.includes("            ${Number(tax) > 0 ? `<tr>")) {
  code = code.replace(
    "            ${Number(tax) > 0 ? `<tr>",
    `            \${Number(address?.signature_fee) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Signature Confirmation:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\$\\{Number(address.signature_fee).toFixed(2)\\}</td>
            </tr>\` : ''}
            \${Number(address?.insurance_fee) > 0 ? \`<tr>
              <td style="padding: 6px 10px; color: #555; font-size: 13px; text-align: right;">Shipping Insurance:</td>
              <td style="padding: 6px 10px; color: #08183A; font-size: 13px; text-align: right; font-weight: 600;">$\\$\\{Number(address.insurance_fee).toFixed(2)\\}</td>
            </tr>\` : ''}
            \${Number(tax) > 0 ? \`<tr>`
  );
  // wait, the template literals inside string need to be careful
  // I will just read the file, split by the target string, and join.
}
