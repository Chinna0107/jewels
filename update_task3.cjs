const fs = require('fs');
const path = '/Users/hemanthkancharla/.gemini/antigravity-ide/brain/a2036269-8a36-4aac-9dd1-c8891c2baf14/task.md';
let file = fs.readFileSync(path, 'utf8');
file = file.replace('- `[/]` Modify `src/pages/admin/AdminCustomersPage.jsx`', '- `[x]` Modify `src/pages/admin/AdminCustomersPage.jsx`');
fs.writeFileSync(path, file);
