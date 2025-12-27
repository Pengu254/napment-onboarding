import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

if (!isSupabaseConfigured) {
  console.warn('[Supabase] Not configured - running in demo mode (data not persisted)');
}

// Create client only if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Types
export interface Merchant {
  id: string;
  shop_domain: string;
  shop_name?: string;
  email?: string;
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  access_token?: string;
  scope?: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  metadata?: Record<string, unknown>;
}

export interface OnboardingSession {
  id: string;
  merchant_id?: string;
  state: string;
  platform: string;
  shop_domain?: string;
  created_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// In-memory storage for demo mode
const inMemorySessions: Map<string, OnboardingSession> = new Map();
const inMemoryMerchants: Map<string, Merchant> = new Map();

// Database functions with fallback to in-memory
export async function createOnboardingSession(platform: string, state: string): Promise<OnboardingSession | null> {
  if (!supabase) {
    const session: OnboardingSession = {
      id: crypto.randomUUID(),
      state,
      platform,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    inMemorySessions.set(state, session);
    return session;
  }

  const { data, error } = await supabase
    .from('onboarding_sessions')
    .insert({ platform, state, status: 'pending' })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating session:', error);
    return null;
  }
  return data;
}

export async function getSessionByState(state: string): Promise<OnboardingSession | null> {
  if (!supabase) {
    return inMemorySessions.get(state) || null;
  }

  const { data, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('state', state)
    .single();

  if (error) {
    console.error('[Supabase] Error getting session:', error);
    return null;
  }
  return data;
}

export async function updateSession(id: string, updates: Partial<OnboardingSession>): Promise<boolean> {
  if (!supabase) {
    for (const [key, session] of inMemorySessions) {
      if (session.id === id) {
        inMemorySessions.set(key, { ...session, ...updates });
        return true;
      }
    }
    return false;
  }

  const { error } = await supabase
    .from('onboarding_sessions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error updating session:', error);
    return false;
  }
  return true;
}

export async function createOrUpdateMerchant(merchant: Partial<Merchant>): Promise<Merchant | null> {
  if (!supabase) {
    const existing = inMemoryMerchants.get(merchant.shop_domain || '');
    const updated: Merchant = {
      id: existing?.id || crypto.randomUUID(),
      shop_domain: merchant.shop_domain || '',
      platform: merchant.platform || 'shopify',
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      onboarding_completed: merchant.onboarding_completed || false,
      ...merchant
    } as Merchant;
    inMemoryMerchants.set(updated.shop_domain, updated);
    return updated;
  }

  const { data, error } = await supabase
    .from('merchants')
    .upsert({
      ...merchant,
      updated_at: new Date().toISOString()
    }, { onConflict: 'shop_domain' })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error upserting merchant:', error);
    return null;
  }
  return data;
}

export async function getMerchantByDomain(shopDomain: string): Promise<Merchant | null> {
  if (!supabase) {
    return inMemoryMerchants.get(shopDomain) || null;
  }

  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('shop_domain', shopDomain)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[Supabase] Error getting merchant:', error);
    return null;
  }
  return data;
}

export async function saveMerchantToken(
  shopDomain: string, 
  accessToken: string, 
  scope: string
): Promise<Merchant | null> {
  return createOrUpdateMerchant({
    shop_domain: shopDomain,
    platform: 'shopify',
    access_token: accessToken,
    scope,
    onboarding_completed: false
  });
}
