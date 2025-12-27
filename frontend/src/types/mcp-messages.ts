// UI Component types that can be rendered
export type ComponentType = 
  | 'chat_bubble'
  | 'action_button'
  | 'oauth_card'
  | 'form_field'
  | 'progress_indicator'
  | 'info_panel'
  | 'select_field'
  | 'multi_select';

export type PlatformType = 'shopify' | 'woocommerce' | 'magento' | 'custom';

// Base component props
export interface BaseComponentProps {
  id: string;
  type: ComponentType;
}

// Chat bubble
export interface ChatBubbleProps extends BaseComponentProps {
  type: 'chat_bubble';
  message: string;
  isAgent: boolean;
  timestamp?: string;
}

// Action button
export interface ActionButtonProps extends BaseComponentProps {
  type: 'action_button';
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

// OAuth card
export interface OAuthCardProps extends BaseComponentProps {
  type: 'oauth_card';
  platform: PlatformType;
  title: string;
  description: string;
  buttonText: string;
  connected?: boolean;
  shopUrl?: string;
}

// Form field
export interface FormFieldProps extends BaseComponentProps {
  type: 'form_field';
  fieldType: 'text' | 'email' | 'url' | 'password';
  label: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
}

// Progress indicator
export interface ProgressIndicatorProps extends BaseComponentProps {
  type: 'progress_indicator';
  steps: string[];
  currentStep: number;
}

// Info panel
export interface InfoPanelProps extends BaseComponentProps {
  type: 'info_panel';
  title: string;
  content: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

// Select field
export interface SelectFieldProps extends BaseComponentProps {
  type: 'select_field';
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
}

// Multi select
export interface MultiSelectProps extends BaseComponentProps {
  type: 'multi_select';
  label: string;
  options: { value: string; label: string }[];
  selected?: string[];
}

// Union type
export type UIComponent = 
  | ChatBubbleProps
  | ActionButtonProps
  | OAuthCardProps
  | FormFieldProps
  | ProgressIndicatorProps
  | InfoPanelProps
  | SelectFieldProps
  | MultiSelectProps;

// Messages from MCP server
export interface MCPToFrontendMessage {
  type: 'show_component' | 'update_component' | 'remove_component' | 'clear_all' | 'set_layout';
  payload: unknown;
}

// Messages to MCP server
export interface FrontendToMCPMessage {
  type: 'user_action' | 'form_submit' | 'oauth_complete' | 'oauth_error';
  payload: unknown;
}

// Platform configurations for OAuth
export const PLATFORM_CONFIG = {
  shopify: {
    name: 'Shopify',
    icon: '🛍️',
    color: '#96bf48',
    oauthUrl: (shopUrl: string, clientId: string) => 
      `https://${shopUrl}/admin/oauth/authorize?client_id=${clientId}&scope=read_products,write_products,read_orders&redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`
  },
  woocommerce: {
    name: 'WooCommerce',
    icon: '🛒',
    color: '#96588a',
    oauthUrl: null // Uses REST API keys
  },
  magento: {
    name: 'Magento',
    icon: '🧲',
    color: '#f26322',
    oauthUrl: null
  },
  custom: {
    name: 'Custom Platform',
    icon: '⚙️',
    color: '#6366f1',
    oauthUrl: null
  }
} as const;

