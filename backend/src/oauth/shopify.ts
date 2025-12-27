import crypto from 'crypto';
import { createOnboardingSession, getSessionByState, saveMerchantToken, updateSession } from '../db/supabase.js';

// Shopify OAuth configuration
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3002/auth/shopify/callback';

// Required scopes for BOBBI platform
const SHOPIFY_SCOPES = [
  'read_products',
  'read_product_listings', 
  'read_inventory',
  'read_orders',
  'read_customers',
  'read_content',
  'read_themes',
  'read_files',
  'read_locales',
  'read_translations',
  'read_price_rules',
  'read_discounts',
  'read_shipping',
  'read_analytics'
].join(',');

export interface ShopifyOAuthResult {
  success: boolean;
  accessToken?: string;
  scope?: string;
  shopDomain?: string;
  error?: string;
}

/**
 * Generate OAuth authorization URL
 */
export async function generateAuthUrl(shopDomain: string): Promise<string | null> {
  if (!SHOPIFY_CLIENT_ID) {
    console.error('[Shopify OAuth] Missing SHOPIFY_CLIENT_ID');
    return null;
  }

  // Clean up shop domain
  let cleanDomain = shopDomain.trim().toLowerCase();
  cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
  cleanDomain = cleanDomain.replace(/\/$/, '');
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = cleanDomain.split('.')[0] + '.myshopify.com';
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  // Create session in database
  const session = await createOnboardingSession('shopify', state);
  if (!session) {
    console.error('[Shopify OAuth] Failed to create session');
    return null;
  }

  // Update session with shop domain
  await updateSession(session.id, { shop_domain: cleanDomain, status: 'in_progress' });

  // Build OAuth URL
  const authUrl = new URL(`https://${cleanDomain}/admin/oauth/authorize`);
  authUrl.searchParams.set('client_id', SHOPIFY_CLIENT_ID);
  authUrl.searchParams.set('scope', SHOPIFY_SCOPES);
  authUrl.searchParams.set('redirect_uri', OAUTH_CALLBACK_URL);
  authUrl.searchParams.set('state', state);

  console.error(`[Shopify OAuth] Generated auth URL for ${cleanDomain}`);
  return authUrl.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  shopDomain: string,
  code: string,
  state: string
): Promise<ShopifyOAuthResult> {
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    return { success: false, error: 'Missing Shopify credentials' };
  }

  // Verify state
  const session = await getSessionByState(state);
  if (!session) {
    return { success: false, error: 'Invalid state - possible CSRF attack' };
  }

  // Clean domain
  let cleanDomain = shopDomain.trim().toLowerCase();
  if (!cleanDomain.includes('.myshopify.com')) {
    cleanDomain = cleanDomain + '.myshopify.com';
  }

  try {
    // Exchange code for token
    const tokenUrl = `https://${cleanDomain}/admin/oauth/access_token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Shopify OAuth] Token exchange failed:', error);
      await updateSession(session.id, { status: 'failed' });
      return { success: false, error: 'Token exchange failed' };
    }

    const data = await response.json();
    const { access_token, scope } = data;

    // Save to database
    const merchant = await saveMerchantToken(cleanDomain, access_token, scope);
    if (!merchant) {
      return { success: false, error: 'Failed to save merchant' };
    }

    // Update session
    await updateSession(session.id, { 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      merchant_id: merchant.id
    });

    console.error(`[Shopify OAuth] Successfully connected ${cleanDomain}`);

    return {
      success: true,
      accessToken: access_token,
      scope,
      shopDomain: cleanDomain
    };
  } catch (error) {
    console.error('[Shopify OAuth] Error:', error);
    await updateSession(session.id, { status: 'failed' });
    return { success: false, error: 'OAuth failed' };
  }
}

/**
 * Verify HMAC signature from Shopify
 */
export function verifyHmac(query: Record<string, string>): boolean {
  if (!SHOPIFY_CLIENT_SECRET) return false;

  const hmac = query.hmac;
  if (!hmac) return false;

  // Remove hmac from query params
  const params = { ...query };
  delete params.hmac;

  // Sort and create query string
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Calculate HMAC
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_CLIENT_SECRET)
    .update(sortedParams)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(calculatedHmac)
  );
}

/**
 * Test API connection with token
 */
export async function testConnection(shopDomain: string, accessToken: string): Promise<{
  success: boolean;
  shopName?: string;
  productCount?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, error: 'API request failed' };
    }

    const { shop } = await response.json();

    // Get product count
    const productsResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/products/count.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    let productCount = 0;
    if (productsResponse.ok) {
      const { count } = await productsResponse.json();
      productCount = count;
    }

    return {
      success: true,
      shopName: shop.name,
      productCount
    };
  } catch (error) {
    console.error('[Shopify] Connection test failed:', error);
    return { success: false, error: 'Connection test failed' };
  }
}

