const fs = require('fs');
let file = fs.readFileSync('/Users/hemanthkancharla/jewelsbe/routes/admin.js', 'utf8');

const newRoute = `
// GET /api/admin/users/:id/orders
router.get('/users/:id/orders', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      \`SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC\`,
      [req.params.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

file = file.replace('// PUT /api/admin/orders/:id/status', newRoute + '\n// PUT /api/admin/orders/:id/status');
fs.writeFileSync('/Users/hemanthkancharla/jewelsbe/routes/admin.js', file);
console.log('Added /api/admin/users/:id/orders');
