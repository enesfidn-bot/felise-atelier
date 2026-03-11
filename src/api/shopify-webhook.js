const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (SHOPIFY_SECRET) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const hash = crypto.createHmac('sha256', SHOPIFY_SECRET).update(JSON.stringify(req.body), 'utf8').digest('base64');
    if (hmac !== hash) return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const s = req.body;
    const allowed = ['US', 'CA', 'GB', 'AU'];
    const country = s.shipping_address?.country_code || '';
    if (!allowed.includes(country)) return res.status(200).json({ message: 'Skipped' });

    const order = {
      id: `FA-${s.order_number}`,
      product: s.line_items?.[0]?.title || 'Unknown Product',
      product_image: s.line_items?.[0]?.image?.src || '',
      customer_name: `${s.shipping_address?.first_name || ''} ${s.shipping_address?.last_name || ''}`.trim(),
      email: s.email || '',
      phone: s.shipping_address?.phone || s.phone || '',
      address: [s.shipping_address?.address1, s.shipping_address?.address2, s.shipping_address?.city, s.shipping_address?.province, s.shipping_address?.zip].filter(Boolean).join(', '),
      country,
      status: 'pending',
      tracking_number: '',
      carrier: '',
      created_at: s.created_at || new Date().toISOString(),
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(order)
    });

    if (!r.ok) { const e = await r.text(); console.error('DB error:', e); return res.status(500).json({ error: e }); }
    console.log('Order saved:', order.id, country);
    return res.status(200).json({ success: true, order_id: order.id });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
};
