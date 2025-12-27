import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateAuthUrl, exchangeCodeForToken, verifyHmac, testConnection } from '../oauth/shopify.js';
import { getMerchantByDomain } from '../db/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bobbi-oauth' });
});

/**
 * Start Shopify OAuth flow
 * POST /auth/shopify/start
 * Body: { shopDomain: string }
 */
app.post('/auth/shopify/start', async (req, res) => {
  const { shopDomain } = req.body;
  
  if (!shopDomain) {
    return res.status(400).json({ error: 'shopDomain is required' });
  }

  console.log(`[API] Starting OAuth for ${shopDomain}`);
  
  const authUrl = await generateAuthUrl(shopDomain);
  
  if (!authUrl) {
    return res.status(500).json({ error: 'Failed to generate auth URL' });
  }

  res.json({ authUrl });
});

/**
 * Shopify OAuth callback
 * GET /auth/shopify/callback
 * Query: code, state, shop, hmac, timestamp
 */
app.get('/auth/shopify/callback', async (req, res) => {
  const { code, state, shop, hmac } = req.query as Record<string, string>;
  
  console.log(`[API] OAuth callback for ${shop}`);

  // Verify all required params
  if (!code || !state || !shop) {
    return res.redirect(`${FRONTEND_URL}?error=missing_params`);
  }

  // Verify HMAC (optional but recommended)
  if (hmac && !verifyHmac(req.query as Record<string, string>)) {
    console.error('[API] HMAC verification failed');
    return res.redirect(`${FRONTEND_URL}?error=invalid_hmac`);
  }

  // Exchange code for token
  const result = await exchangeCodeForToken(shop, code, state);

  if (!result.success) {
    return res.redirect(`${FRONTEND_URL}?error=${encodeURIComponent(result.error || 'oauth_failed')}`);
  }

  // Test the connection
  const connectionTest = await testConnection(result.shopDomain!, result.accessToken!);

  // Send success page that communicates with parent window and closes popup
  const successHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Yhdistetty!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255,255,255,0.05);
      border-radius: 24px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #6B8E23 0%, #556B2F 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 40px;
      animation: pop 0.5s ease-out;
    }
    @keyframes pop {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    p { color: rgba(255,255,255,0.7); margin-bottom: 1rem; }
    .shop { 
      background: rgba(255,255,255,0.1); 
      padding: 0.5rem 1rem; 
      border-radius: 8px;
      font-family: monospace;
      margin-bottom: 1rem;
    }
    .closing { font-size: 0.875rem; color: rgba(255,255,255,0.5); }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>Shopify yhdistetty!</h1>
    <p>Kauppasi on nyt yhdistetty BOBBI:in.</p>
    <div class="shop">${result.shopDomain}</div>
    <p>${connectionTest.productCount || 0} tuotetta löydetty</p>
    <p class="closing">Ikkuna sulkeutuu automaattisesti...</p>
  </div>
  <script>
    // Try multiple ways to communicate with parent
    const data = {
      type: 'shopify_oauth_success',
      shopDomain: '${result.shopDomain}',
      shopName: '${connectionTest.shopName || result.shopDomain}',
      productCount: ${connectionTest.productCount || 0}
    };
    
    // Store in localStorage so parent can read it
    localStorage.setItem('shopify_oauth_result', JSON.stringify(data));
    
    // Try postMessage to opener
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(data, '*');
        console.log('Sent postMessage to opener');
      } catch(e) {
        console.log('postMessage failed:', e);
      }
    }
    
    // Also try to focus parent window
    if (window.opener) {
      try { window.opener.focus(); } catch(e) {}
    }
    
    // Close this popup after delay
    setTimeout(() => {
      window.close();
    }, 2500);
    
    // If window didn't close (some browsers block this), show manual close message
    setTimeout(() => {
      document.querySelector('.closing').textContent = 'Voit sulkea tämän ikkunan ja palata onboardingiin.';
    }, 3000);
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(successHtml);
});

/**
 * Check merchant connection status
 * GET /auth/status/:shopDomain
 */
app.get('/auth/status/:shopDomain', async (req, res) => {
  const { shopDomain } = req.params;
  
  const merchant = await getMerchantByDomain(shopDomain);
  
  if (!merchant || !merchant.access_token) {
    return res.json({ connected: false });
  }

  // Test if token is still valid
  const test = await testConnection(shopDomain, merchant.access_token);

  res.json({
    connected: test.success,
    shopName: test.shopName,
    productCount: test.productCount
  });
});

/**
 * Get Shopify data (products, etc.)
 * GET /api/shopify/:shopDomain/products
 */
app.get('/api/shopify/:shopDomain/products', async (req, res) => {
  const { shopDomain } = req.params;
  const { limit = 50 } = req.query;
  
  const merchant = await getMerchantByDomain(shopDomain);
  
  if (!merchant || !merchant.access_token) {
    return res.status(401).json({ error: 'Not connected' });
  }

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/products.json?limit=${limit}`,
      {
        headers: {
          'X-Shopify-Access-Token': merchant.access_token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Shopify API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[API] Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * Get shop info
 * GET /api/shopify/:shopDomain/shop
 */
app.get('/api/shopify/:shopDomain/shop', async (req, res) => {
  const { shopDomain } = req.params;
  
  const merchant = await getMerchantByDomain(shopDomain);
  
  if (!merchant || !merchant.access_token) {
    return res.status(401).json({ error: 'Not connected' });
  }

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': merchant.access_token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Shopify API error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('[API] Error fetching shop:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[API] BOBBI OAuth server running on http://localhost:${PORT}`);
  console.log(`[API] Callback URL: http://localhost:${PORT}/auth/shopify/callback`);
});

export default app;

