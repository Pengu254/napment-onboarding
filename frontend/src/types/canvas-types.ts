// Canvas content types - what the agent can send
export type ContentType = 
  | 'message'
  | 'greeting'
  | 'question'
  | 'focus_input'
  | 'focus_select'
  | 'platform_card'
  | 'success'
  | 'progress'
  | 'loading'
  | 'video'
  | 'image'
  | 'celebration';

export type PlatformType = 'shopify' | 'woocommerce' | 'magento' | 'custom';

export type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale' | 'none';

// Base content item
export interface BaseContent {
  id: string;
  type: ContentType;
  animation?: AnimationType;
  delay?: number;
}

// AI message (includes greeting, question variants)
export interface MessageContent extends BaseContent {
  type: 'message' | 'greeting' | 'question';
  text: string;
  variant?: 'greeting' | 'question' | 'response' | 'celebration';
}

// Focus input - one input at a time
export interface FocusInputContent extends BaseContent {
  type: 'focus_input';
  label: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'url';
  submitLabel?: string;
  fieldKey: string;
}

// Focus select - one choice at a time
export interface FocusSelectContent extends BaseContent {
  type: 'focus_select';
  label: string;
  options: Array<{
    value: string;
    label: string;
    icon?: string;
    description?: string;
  }>;
  fieldKey: string;
}

// Platform connection card
export interface PlatformCardContent extends BaseContent {
  type: 'platform_card';
  platform: PlatformType;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  connected?: boolean;
  shopUrl?: string;
  productCount?: number;
}

// Success state
export interface SuccessContent extends BaseContent {
  type: 'success';
  title: string;
  subtitle?: string;
  details?: Array<{ label: string; value: string }>;
  nextLabel?: string;
  nextAction?: string;
}

// Progress indicator
export interface ProgressContent extends BaseContent {
  type: 'progress';
  steps: string[];
  currentStep: number;
  showLabels?: boolean;
}

// Loading state
export interface LoadingContent extends BaseContent {
  type: 'loading';
  message: string;
  progress?: number;
}

// Video
export interface VideoContent extends BaseContent {
  type: 'video';
  url: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
}

// Image
export interface ImageContent extends BaseContent {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
}

// Celebration overlay
export interface CelebrationContent extends BaseContent {
  type: 'celebration';
  confetti?: boolean;
  message?: string;
  duration?: number;
}

// Union type
export type CanvasContent = 
  | MessageContent
  | FocusInputContent
  | FocusSelectContent
  | PlatformCardContent
  | SuccessContent
  | ProgressContent
  | LoadingContent
  | VideoContent
  | ImageContent
  | CelebrationContent;

// Canvas state
export interface CanvasState {
  contents: CanvasContent[];
  currentStep: number;
  collectedData: Record<string, unknown>;
  platform?: PlatformType;
  connected: boolean;
}

// WebSocket messages
export interface ServerToCanvasMessage {
  type: 'add_content' | 'clear' | 'replace' | 'update' | 'celebrate';
  payload: unknown;
}

export interface CanvasToServerMessage {
  type: 'user_input' | 'user_select' | 'platform_connect' | 'action' | 'oauth_complete';
  payload: {
    fieldKey?: string;
    value?: unknown;
    action?: string;
    platform?: string;
    shopDomain?: string;
    productCount?: number;
  };
}

// Platform configs
export const PLATFORM_CONFIGS = {
  shopify: {
    name: 'Shopify',
    icon: '🛍️',
    color: '#96bf48',
    gradient: 'linear-gradient(135deg, #96bf48 0%, #5e8e3e 100%)',
    features: ['Tuotteet & variaatiot', 'Tilaukset & asiakkaat', 'Brändi & kuvat', 'Inventory sync']
  },
  woocommerce: {
    name: 'WooCommerce', 
    icon: '🛒',
    color: '#96588a',
    gradient: 'linear-gradient(135deg, #96588a 0%, #6b3d61 100%)',
    features: ['Tuotteet & kategoriat', 'Tilaukset', 'Asiakasdata', 'Kuvat & media']
  },
  magento: {
    name: 'Magento',
    icon: '🧲', 
    color: '#f26322',
    gradient: 'linear-gradient(135deg, #f26322 0%, #c44d15 100%)',
    features: ['Tuotekatalogi', 'Multi-store', 'ERP-integraatio', 'B2B-tuki']
  },
  custom: {
    name: 'Muu alusta',
    icon: '⚙️',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    features: ['API-integraatio', 'CSV-tuonti', 'Manuaalinen setup', 'Custom ratkaisu']
  }
} as const;
