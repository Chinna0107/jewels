const fs = require('fs');
const file = '../../../jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

// Find the line where diff is calculated
const targetLine = "const diff = parseFloat((newTotal - oldTotal).toFixed(2));";
const lines = content.split('\n');
const targetIndex = lines.findIndex(l => l.includes(targetLine));

if (targetIndex > -1) {
  const validationLogic = `
    // --- Pre-flight Stock Validation ---
    for (const newItem of updatedItems) {
      if (!newItem.product?.id) continue;
      
      const wasInOld = oldItems.find(oi =>
        oi.product?.id === newItem.product.id &&
        (oi.variant?.size || '') === (newItem.variant?.size || '')
      );
      
      const oldQty = wasInOld ? (wasInOld.qty || 1) : 0;
      const newQty = newItem.qty || 1;
      const qtyIncrease = newQty - oldQty;
      
      if (qtyIncrease > 0) {
        // Fetch current stock from DB to ensure accuracy
        const prodRes = await pool.query('SELECT name, variants FROM products WHERE id=$1', [newItem.product.id]);
        if (prodRes.rows.length === 0) continue;
        
        const prodName = prodRes.rows[0].name;
        let variants = [];
        try { variants = typeof prodRes.rows[0]?.variants === 'string' ? JSON.parse(prodRes.rows[0].variants) : (prodRes.rows[0]?.variants || []); } catch(e) {}
        
        let availableStock = 0;
        let found = false;
        
        for (let v of variants) {
          for (let s of (v.sizes || [])) {
            if (!newItem.variant?.size || s.size?.toString().trim() === newItem.variant.size) {
              availableStock = parseInt(s.stock || 0);
              found = true;
            }
          }
        }
        
        if (found && availableStock < qtyIncrease) {
          return res.status(400).json({ error: \`Insufficient stock for "\${prodName}". You need \${qtyIncrease} more, but only \${availableStock} are available.\` });
        }
      }
    }
    // --- End Validation ---`;

  lines.splice(targetIndex + 1, 0, validationLogic);
  fs.writeFileSync(file, lines.join('\n'));
  console.log("Patched successfully");
} else {
  console.log("Could not find target line");
}
