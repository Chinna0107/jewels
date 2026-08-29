const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

// We need to replace the prodRes query in the pre-flight check
const regex = /const prodRes = await pool\.query\('SELECT name, variants FROM products WHERE id=\\$1', \[newItem\.product\.id\]\);/g;
content = content.replace(regex, "const prodRes = await pool.query('SELECT name, variants, sizes FROM products WHERE id=$1', [newItem.product.id]);");

const blockRegex = /let variants = \[\];\s*try { variants = typeof prodRes\.rows\[0\]\?\.variants === 'string' \? JSON\.parse\(prodRes\.rows\[0\]\.variants\) : \(prodRes\.rows\[0\]\?\.variants \|\| \[\]\); } catch\(e\) {}\s*let availableStock = 0;\s*let found = false;\s*for \(let v of variants\) {\s*for \(let s of \(v\.sizes \|\| \[\]\)\) {\s*if \(\!newItem\.variant\?\.size \|\| s\.size\?\.toString\(\)\.trim\(\) === newItem\.variant\.size\) {\s*availableStock = parseInt\(s\.stock \|\| 0\);\s*found = true;\s*}\s*}\s*}/g;

const newBlock = `let variants = [];
        let sizes = [];
        try { variants = typeof prodRes.rows[0]?.variants === 'string' ? JSON.parse(prodRes.rows[0].variants) : (prodRes.rows[0]?.variants || []); } catch(e) {}
        try { sizes = typeof prodRes.rows[0]?.sizes === 'string' ? JSON.parse(prodRes.rows[0].sizes) : (prodRes.rows[0]?.sizes || []); } catch(e) {}
        
        let availableStock = 0;
        let found = false;
        
        if (variants.length > 0) {
          for (let v of variants) {
            for (let s of (v.sizes || [])) {
              if (!newItem.variant?.size || s.size?.toString().trim() === newItem.variant.size) {
                availableStock = parseInt(s.stock || 0);
                found = true;
              }
            }
          }
        } else if (sizes.length > 0) {
          for (let s of sizes) {
             if (!newItem.variant?.size || s.size?.toString().trim() === newItem.variant.size) {
               availableStock = parseInt(s.stock || 0);
               found = true;
             }
          }
        }`;

content = content.replace(blockRegex, newBlock);
fs.writeFileSync(file, content);
