import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  state: string; // OAuth state parameter
  platform: string;
  shop_domain?: string;
  created_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// Database functions
export async function createOnboardingSession(platform: string, state: string): Promise<OnboardingSession | null> {
  const { data, error } = await supabase
    .from('onboarding_sessions')
    .insert({
      platform,
      state,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating session:', error);
    return null;
  }
  return data;
}

export async function getSessionByState(state: string): Promise<OnboardingSession | null> {
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
  const { data, error } = await supabase
    .from('merchants')
    .upsert({
      ...merchant,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_domain'
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error upserting merchant:', error);
    return null;
  }
  return data;
}

export async function getMerchantByDomain(shopDomain: string): Promise<Merchant | null> {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('shop_domain', shopDomain)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
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

