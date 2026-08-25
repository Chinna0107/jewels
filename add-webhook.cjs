const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/general.js';
let code = fs.readFileSync(file, 'utf8');

const webhookRoute = `

// POST /api/general/shippo-webhook — Shippo Webhook Handler
router.post('/shippo-webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // We only care about tracking updates
    if (event === 'track_updated' && data && data.tracking_number) {
      const trackingNumber = data.tracking_number;
      const status = data.tracking_status?.status; // e.g. 'TRANSIT', 'DELIVERED'
      
      // Find the order with this tracking number
      const orderRes = await pool.query('SELECT * FROM orders WHERE tracking_number = $1 OR tracking_id = $1 LIMIT 1', [trackingNumber]);
      const order = orderRes.rows[0];
      
      if (order) {
        if (status === 'DELIVERED' && order.status !== 'delivered') {
          // Update DB
          await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['delivered', order.id]);
          // Send Email
          const { sendOrderDeliveredEmail } = require('../utils/email');
          await sendOrderDeliveredEmail(order);
          console.log(\`Shippo Webhook: Order \${order.id} marked as delivered.\`);
        } else if (status === 'TRANSIT' && order.status !== 'shipped' && order.status !== 'delivered') {
          // If for some reason it wasn't marked shipped yet, mark it now
          await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['shipped', order.id]);
          const { sendOrderShippedEmail } = require('../utils/email');
          await sendOrderShippedEmail(order);
          console.log(\`Shippo Webhook: Order \${order.id} marked as shipped in transit.\`);
        }
      }
    }
    
    // Always acknowledge webhook receipt
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Shippo Webhook Error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
`;

code = code.replace(/module\.exports = router;/, webhookRoute);
fs.writeFileSync(file, code);
console.log('Successfully injected Shippo Webhook endpoint!');
