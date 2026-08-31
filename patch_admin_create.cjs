const fs = require('fs');
let file = fs.readFileSync('src/pages/admin/AdminCreateOrderPage.jsx', 'utf8');

file = file.replace(
  'const calculatedInsuranceFee = shippingInsurance ? ((insuranceDeclaredValue !== "" ? parseFloat(insuranceDeclaredValue) : (subtotal - discountAmt)) * insuranceRate) : 0;',
  'const calculatedInsuranceFee = shippingInsurance ? ((insuranceDeclaredValue !== "" ? parseFloat(insuranceDeclaredValue) : (subtotal - discountAmt + calculatedTax)) * insuranceRate) : 0;'
);

file = file.replace(/insurance_amount:\s*calculatedInsuranceFee/g, 'insurance_amount: shippingInsurance ? (insuranceDeclaredValue !== "" ? parseFloat(insuranceDeclaredValue) : (subtotal - discountAmt + calculatedTax)) : 0');

file = file.replace(
  'placeholder={(subtotal - discountAmt).toFixed(2)}',
  'placeholder={(subtotal - discountAmt + calculatedTax).toFixed(2)}'
);

fs.writeFileSync('src/pages/admin/AdminCreateOrderPage.jsx', file);
console.log('patched AdminCreateOrderPage');
