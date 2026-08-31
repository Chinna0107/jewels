const pool = require('./jewelsbe/db');
require('dotenv').config({path: './jewelsbe/.env'});
(async () => {
  const result = await pool.query("SELECT items FROM orders WHERE order_number='HJ-000071'");
  let items = result.rows[0].items;
  if (typeof items === 'string') items = JSON.parse(items);
  
  const itemsWeight = items.reduce((sum, item) => {
    let specificWeight = item.variant?.weight;
    if (!specificWeight && item.product?.variants) {
      const vColor = (item.variant?.color || '').toLowerCase().trim();
      const matchV = item.product.variants.find(v => (v.color || '').toLowerCase().trim() === vColor);
      if (matchV && matchV.sizes) {
        const matchS = matchV.sizes.find(s => String(s.size) === String(item.variant?.size));
        if (matchS && matchS.weight) specificWeight = matchS.weight;
      }
    }
    const pWeight = parseFloat(specificWeight || item.product?.weight || item.weight || 0);
    console.log({
      vColor: item.variant?.color, 
      vSize: item.variant?.size,
      specificWeight,
      pWeight
    });
    return sum + (pWeight * (item.qty || 1));
  }, 0);
  console.log("ITEMS WEIGHT:", itemsWeight);
  process.exit();
})();
