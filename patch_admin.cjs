const fs = require('fs');
const file = '/Users/hemanthkancharla/jewelsbe/routes/admin.js';
let content = fs.readFileSync(file, 'utf8');

const targetRates = `// POST /api/admin/orders/:id/shippo-rates
router.post('/orders/:id/shippo-rates', authMiddleware, adminOnly, async (req, res) => {
  if (!shippoClient) return res.status(500).json({ error: 'Shippo is not configured in backend' });

  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}

    let totalWeightOz = 0;
    for (const item of items) {
      const w = parseFloat(item.variant?.weight || item.size?.weight || 0);
      totalWeightOz += (w > 0 ? w : 16) * (item.qty || 1);
    }
    if (totalWeightOz === 0) totalWeightOz = 16;

    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

    const addressFrom = {
      name: 'Houra Jewels',
      street1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94117',
      country: 'US',
      phone: '+1 555 341 9393',
      email: 'admin@hourajewels.com',
    };

    const addressTo = {
      name: address.name || 'Customer',
      street1: address.line1 || 'No Address',
      street2: address.line2 || '',
      city: address.city || 'City',
      state: address.state || '',
      zip: address.pincode || '00000',
      country: address.country || 'US',
      phone: address.mobile || '0000000000',
    };

    const parcel = {
      length: '5',
      width: '5',
      height: '5',
      distanceUnit: 'in',
      weight: totalWeightOz.toString(),
      massUnit: 'oz',
    };

    const shipmentPayload = {
      addressFrom: addressFrom,
      addressTo: addressTo,
      parcels: [parcel],
      async: false
    };

    if (addressFrom.country !== addressTo.country) {
      shipmentPayload.customsDeclaration = {
        contentsType: 'MERCHANDISE',
        nonDeliveryOption: 'RETURN',
        certify: true,
        certifySigner: 'Houra Jewels',
        eelPfc: 'NOEEI_30_37_a',
        items: [{
          description: 'Jewelry',
          quantity: 1,
          netWeight: '16',
          massUnit: 'oz',
          valueAmount: (order.total || 10).toString(),
          valueCurrency: 'USD',
          originCountry: 'US',
          tariffNumber: '711719'
        }]
      };
    }

    const shipment = await shippoClient.shipments.create(shipmentPayload);`;

const replacementRates = `// POST /api/admin/orders/:id/shippo-rates
router.post('/orders/:id/shippo-rates', authMiddleware, adminOnly, async (req, res) => {
  if (!shippoClient) return res.status(500).json({ error: 'Shippo is not configured in backend' });

  try {
    const orderRes = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const config = req.body || {};

    let items = [];
    try { items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []); } catch(e) {}

    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}

    const addressFrom = {
      name: 'Houra Jewels',
      street1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94117',
      country: 'US',
      phone: '+1 555 341 9393',
      email: 'admin@hourajewels.com',
    };

    const addressTo = {
      name: address.name || 'Customer',
      street1: address.line1 || 'No Address',
      street2: address.line2 || '',
      city: address.city || 'City',
      state: address.state || '',
      zip: address.pincode || '00000',
      country: address.country || 'US',
      phone: address.mobile || '0000000000',
    };

    let length = '6', width = '4', height = '1';
    if (config.box === '8x8x1') { length = '8'; width = '8'; height = '1'; }
    else if (typeof config.box === 'object' || config.box === 'custom') {
      const b = config.customBox || config.box;
      length = b.length?.toString() || '6';
      width = b.width?.toString() || '4';
      height = b.height?.toString() || '1';
    }

    let weight = config.weight ? parseFloat(config.weight) : 16;
    if (weight <= 0) weight = 16;

    const parcel = {
      length, width, height, distanceUnit: 'in',
      weight: weight.toString(), massUnit: 'oz',
    };

    const shipmentPayload = {
      addressFrom,
      addressTo,
      parcels: [parcel],
      async: false
    };

    const extra = {};
    if (config.signatureRequired || address.signature_required) {
      extra.signature_confirmation = 'STANDARD';
    }
    const isInsured = config.insuranceRequested || address.insurance_requested;
    const insAmt = config.insuranceAmount || address.insurance_amount;
    if (isInsured && parseFloat(insAmt) > 0) {
      extra.insurance = { amount: String(insAmt), currency: 'USD' };
    }
    if (Object.keys(extra).length > 0) shipmentPayload.extra = extra;

    if (addressFrom.country !== addressTo.country) {
      const c = config.customs || {};
      shipmentPayload.customsDeclaration = {
        contentsType: 'MERCHANDISE',
        nonDeliveryOption: 'RETURN',
        certify: true,
        certifySigner: 'Houra Jewels',
        eelPfc: 'NOEEI_30_37_a',
        items: [{
          description: c.description || 'Jewelry',
          quantity: parseInt(c.quantity) || 1,
          netWeight: c.unitWeight ? String(c.unitWeight) : '16',
          massUnit: 'oz',
          valueAmount: c.unitValue ? String(c.unitValue) : (order.total || 10).toString(),
          valueCurrency: 'USD',
          originCountry: c.countryOfOrigin || 'US',
          tariffNumber: c.harmonizationCode || '711719'
        }]
      };
    }

    const shipment = await shippoClient.shipments.create(shipmentPayload);`;

content = content.replace(targetRates, replacementRates);
content = content.replace('labelFileType: "PDF"', 'labelFileType: "PDF_4x6"');

fs.writeFileSync(file, content);
