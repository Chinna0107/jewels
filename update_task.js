const fs = require('fs');
const file = '/Users/hemanthkancharla/.gemini/antigravity-ide/brain/fd37c44a-c1fd-4626-b543-ed025cd1f31c/task.md';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/- \[\/\] Implement backend Cancellation Logic/g, '- [x] Implement backend Cancellation Logic');
content = content.replace(/- \[ \] Accept cancellation request/g, '- [x] Accept cancellation request');
content = content.replace(/- \[ \] If `balance_due == 0`/g, '- [x] If `balance_due == 0`');
content = content.replace(/- \[ \] If paid but no Stripe ID/g, '- [x] If paid but no Stripe ID');
content = content.replace(/- \[ \] Parse order items and increase stock/g, '- [x] Parse order items and increase stock');
content = content.replace(/- \[ \] Update order status to `cancelled`/g, '- [x] Update order status to `cancelled`');
content = content.replace(/- \[ \] Update `AdminOrdersPage\.jsx` table UI/g, '- [x] Update `AdminOrdersPage.jsx` table UI');
content = content.replace(/- \[ \] Show `Payment Pending`/g, '- [x] Show `Payment Pending`');
content = content.replace(/- \[ \] Display payment link/g, '- [x] Display payment link');
content = content.replace(/- \[ \] Add a `Cancel` button/g, '- [x] Add a `Cancel` button');
content = content.replace(/- \[ \] Connect Frontend Cancel button/g, '- [x] Connect Frontend Cancel button');
content = content.replace(/- \[ \] Add confirmation dialog warning/g, '- [x] Add confirmation dialog warning');
content = content.replace(/- \[ \] Handle success\/error states/g, '- [x] Handle success/error states');

fs.writeFileSync(file, content);
console.log('Task list updated!');
