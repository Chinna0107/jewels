const fs = require('fs');
const path = '/Users/hemanthkancharla/.gemini/antigravity-ide/brain/a2036269-8a36-4aac-9dd1-c8891c2baf14/task.md';
let file = fs.readFileSync(path, 'utf8');
file = file.replace('- `[/]` Create `src/components/OrderCard.jsx`', '- `[x]` Create `src/components/OrderCard.jsx`');
file = file.replace('- `[ ]` Modify `src/pages/MyOrdersPage.jsx`', '- `[x]` Modify `src/pages/MyOrdersPage.jsx`');
file = file.replace('- `[ ]` Create backend route', '- `[/]` Create backend route');
fs.writeFileSync(path, file);
