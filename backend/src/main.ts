#!/usr/bin/env node

/**
 * Napment Onboarding Backend
 * Combined Express API + WebSocket Server
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

import { generateAuthUrl, exchangeCodeForToken, verifyHmac, testConnection } from './oauth/shopify.js';
import { getMerchantByDomain } from './db/supabase.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '8001');
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://onboarding.bobbi.live';
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://onboarding.bobbi.live'
];

// ============================================================================
// Express App Setup
// ============================================================================
const app = express();

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'napment-onboarding-backend',
    version: '2.0.0',
    websocket: 'enabled'
  });
});

// ============================================================================
// Shopify OAuth Routes
// ============================================================================

// Start OAuth flow
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

// OAuth callback
app.get('/auth/shopify/callback', async (req, res) => {
  const { code, state, shop, hmac } = req.query as Record<string, string>;
  
  console.log(`[API] OAuth callback for ${shop}`);

  if (!code || !state || !shop) {
    return res.redirect(`${FRONTEND_URL}?error=missing_params`);
  }

  if (hmac && !verifyHmac(req.query as Record<string, string>)) {
    console.error('[API] HMAC verification failed');
    return res.redirect(`${FRONTEND_URL}?error=invalid_hmac`);
  }

  const result = await exchangeCodeForToken(shop, code, state);

  if (!result.success) {
    return res.redirect(`${FRONTEND_URL}?error=${encodeURIComponent(result.error || 'oauth_failed')}`);
  }

  const connectionTest = await testConnection(result.shopDomain!, result.accessToken!);

  // Success HTML that communicates with parent window
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
    const data = {
      type: 'shopify_oauth_success',
      shopDomain: '${result.shopDomain}',
      shopName: '${connectionTest.shopName || result.shopDomain}',
      productCount: ${connectionTest.productCount || 0}
    };
    
    localStorage.setItem('shopify_oauth_result', JSON.stringify(data));
    
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(data, '*');
      } catch(e) {}
    }
    
    setTimeout(() => window.close(), 2500);
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(successHtml);
});

// Check merchant status
app.get('/auth/status/:shopDomain', async (req, res) => {
  const { shopDomain } = req.params;
  
  const merchant = await getMerchantByDomain(shopDomain);
  
  if (!merchant || !merchant.access_token) {
    return res.json({ connected: false });
  }

  const test = await testConnection(shopDomain, merchant.access_token);

  res.json({
    connected: test.success,
    shopName: test.shopName,
    productCount: test.productCount
  });
});

// ============================================================================
// HTTP Server + WebSocket
// ============================================================================
const httpServer = createServer(app);

const wss = new WebSocketServer({ 
  server: httpServer,
  path: '/ws'
});

console.log('[WebSocket] Server attached to /ws path');

// ============================================================================
// WebSocket Handlers
// ============================================================================

function sendDelayed(ws: WebSocket, message: object, delay: number = 0) {
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, delay);
}

function addContent(ws: WebSocket, content: object, delay: number = 0) {
  sendDelayed(ws, {
    type: 'add_content',
    payload: { id: randomUUID(), ...content }
  }, delay);
}

function showWelcomeFlow(ws: WebSocket) {
  addContent(ws, {
    type: 'greeting',
    text: 'Tervetuloa BOBBI:in! 🚀'
  }, 100);
  
  addContent(ws, {
    type: 'question',
    text: 'Rakennetaan sinulle huippunopea verkkokauppa. Aloitetaan yhdistämällä nykyinen kauppasi.'
  }, 700);
  
  addContent(ws, {
    type: 'focus_select',
    label: 'Mikä verkkokauppa-alusta sinulla on käytössä?',
    fieldKey: 'platform',
    options: [
      { value: 'shopify', label: 'Shopify', icon: '🛍️', description: 'Suosituin valinta' },
      { value: 'woocommerce', label: 'WooCommerce', icon: '🛒', description: 'WordPress-pohjainen' },
      { value: 'custom', label: 'Muu alusta', icon: '⚙️', description: 'Kerro meille lisää' }
    ]
  }, 1400);
}

function showShopifyCard(ws: WebSocket) {
  addContent(ws, {
    type: 'question',
    text: 'Loistava valinta! Shopify on suosituin alustamme. 🎯'
  }, 100);
  
  addContent(ws, {
    type: 'platform_card',
    platform: 'shopify',
    title: 'Yhdistä Shopify-kauppasi',
    description: 'Haemme tuotteesi, kuvat ja brändisi automaattisesti.',
    features: [
      '✓ Tuotteet ja kategoriat',
      '✓ Kuvat ja media',
      '✓ Tilaukset ja asiakkaat',
      '✓ Bränditiedot'
    ],
    buttonText: 'Yhdistä Shopify'
  }, 600);
}

function showConnectionSuccess(ws: WebSocket, shopDomain?: string, productCount?: number) {
  ws.send(JSON.stringify({
    type: 'celebrate',
    payload: { message: 'Kauppa yhdistetty! 🎉' }
  }));
  
  addContent(ws, {
    type: 'greeting',
    text: 'Loistavaa! ✨'
  }, 300);
  
  addContent(ws, {
    type: 'success',
    title: 'Kauppa yhdistetty!',
    subtitle: shopDomain || 'Yhteys muodostettu onnistuneesti',
    details: [
      { label: 'Status', value: '✓ Yhdistetty' },
      { label: 'Tuotteita', value: `${productCount || 0} kpl` }
    ],
    nextLabel: 'Jatka →',
    nextAction: 'continue_setup'
  }, 800);
}

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  
  showWelcomeFlow(ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('[WebSocket] Received:', message.type, message.payload);

      if (message.type === 'user_select') {
        const { fieldKey, value } = message.payload;
        
        if (fieldKey === 'platform' && value === 'shopify') {
          showShopifyCard(ws);
        }
      }

      if (message.type === 'oauth_complete') {
        const { shopDomain, productCount } = message.payload || {};
        showConnectionSuccess(ws, shopDomain, productCount);
      }

    } catch (err) {
      console.error('[WebSocket] Parse error:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });
});

// ============================================================================
// Start Server
// ============================================================================
httpServer.listen(PORT, () => {
  console.log(`[Server] Napment Onboarding Backend running on port ${PORT}`);
  console.log(`[Server] Health: http://localhost:${PORT}/health`);
  console.log(`[Server] WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`[Server] OAuth Callback: http://localhost:${PORT}/auth/shopify/callback`);
});

