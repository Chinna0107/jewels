const pool = require('./jewelsbe/db');
(async () => {
  const result = await pool.query("SELECT items FROM orders WHERE order_number='HJ-000071'");
  console.log(JSON.stringify(result.rows[0].items, null, 2));
  process.exit();
})();
