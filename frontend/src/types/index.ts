/**
 * Napment Onboarding Types
 */

export type Platform = 'shopify' | 'woocommerce' | 'magento' | 'custom';

export type OnboardingStep = 
  | 'welcome'
  | 'platform_select'
  | 'platform_connect'
  | 'brand_config'
  | 'agent_config'
  | 'review'
  | 'complete';

export interface OnboardingSession {
  session_id: string;
  current_step: OnboardingStep;
  platform?: Platform;
  shop_name?: string;
  shop_domain?: string;
  email?: string;
  is_connected: boolean;
  brand_config?: BrandConfig;
  agent_config?: AgentConfig;
}

export interface BrandConfig {
  template_id: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
  logo_url?: string;
  store_name: string;
}

export interface AgentConfig {
  persona_id: string;
  greeting_message: string;
  language: string;
  features: {
    product_recommendations: boolean;
    order_tracking: boolean;
    cart_assistance: boolean;
  };
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  description: string;
  icon: string;
  supported: boolean;
  features: string[];
}

export interface BrandTemplate {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
}

export interface AgentPersona {
  id: string;
  name: string;
  description: string;
  traits: string[];
  example: string;
}

