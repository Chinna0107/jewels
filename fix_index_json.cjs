const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/index.js', 'utf8');

file = file.replace('app.use(express.json());', '');

file = file.replace(
  'const path = require(\'path\');',
  'app.use(express.json());\nconst path = require(\'path\');'
);

fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/index.js', file);
console.log('patched index.js express.json');
