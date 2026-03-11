// Vercel Serverless Function — receives Shopify order webhooks
// File: api/shopify-webhook.js

const crypto = require('crypto');

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Shopify webhook signature (optional but recommended)
  const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';
  
  if (SHOPIFY_WEBHOOK_SECRET) {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const body = JSON.stringify(req.body);
    const hash = crypto
      .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('base64');
    
    if (hmac !== hash) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const shopifyOrder = req.body;

    // Filter: only US, CA, GB, AU orders
    const allowedCountries = ['US', 'CA', 'GB', 'AU'];
    const countryCode = shopifyOrder.shipping_address?.country_code || '';
    
    if (!allowedCountries.includes(countryCode)) {
      return res.status(200).json({ message: 'Order skipped — country not in scope' });
    }

    // Transform Shopify order to Felise Atelier format
    const order = {
      id: `FA-${shopifyOrder.order_number}`,
      product: shopifyOrder.line_items?.[0]?.title || 'Unknown Product',
      productImage: shopifyOrder.line_items?.[0]?.image?.src || '',
      customerName: `${shopifyOrder.shipping_address?.first_name || ''} ${shopifyOrder.shipping_address?.last_name || ''}`.trim(),
      email: shopifyOrder.email || '',
      phone: shopifyOrder.shipping_address?.phone || shopifyOrder.phone || '',
      address: [
        shopifyOrder.shipping_address?.address1,
        shopifyOrder.shipping_address?.address2,
        shopifyOrder.shipping_address?.city,
        shopifyOrder.shipping_address?.province,
        shopifyOrder.shipping_address?.zip,
      ].filter(Boolean).join(', '),
      country: countryCode,
      status: 'pending',
      trackingNumber: '',
      carrier: '',
      createdAt: shopifyOrder.created_at || new Date().toISOString(),
    };

    // Log the order (you can see this in Vercel dashboard → Logs)
    console.log('New order received:', order.id, order.customerName, countryCode);

    // Return success — the order data will be stored client-side
    // In production, you'd save this to a database like Supabase
    return res.status(200).json({ 
      success: true, 
      order: order,
      message: `Order ${order.id} received` 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
