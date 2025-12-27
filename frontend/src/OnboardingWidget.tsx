import { useCallback, useRef, useEffect, useState } from 'react';
import { useMCPConnection } from './hooks/useMCPConnection';
import { 
  ChatBubble, 
  ActionButton, 
  OAuthCard, 
  ProgressIndicator, 
  InfoPanel,
  FormField,
  SelectField
} from './components';
import { 
  UIComponent, 
  ChatBubbleProps, 
  ActionButtonProps, 
  OAuthCardProps,
  ProgressIndicatorProps,
  InfoPanelProps,
  FormFieldProps,
  SelectFieldProps
} from './types/mcp-messages';
import styles from './OnboardingWidget.module.css';

interface OnboardingWidgetProps {
  wsUrl?: string;
  onReady?: () => void;
}

export function OnboardingWidget({ wsUrl, onReady }: OnboardingWidgetProps) {
  const { 
    connected, 
    components, 
    error,
    sendUserAction,
    sendFormSubmit,
    sendOAuthComplete
  } = useMCPConnection({ wsUrl });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Auto-scroll to bottom when new components are added
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [components]);

  // Notify when connected
  useEffect(() => {
    if (connected && onReady) {
      onReady();
    }
  }, [connected, onReady]);

  // Handle button clicks
  const handleAction = useCallback((action: string) => {
    sendUserAction(action);
  }, [sendUserAction]);

  // Handle form field changes
  const handleFieldChange = useCallback((id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  }, []);

  // Handle form submission (for submit buttons)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleFormSubmit = useCallback((formId: string) => {
    sendFormSubmit(formId, formData);
    setFormData({});
  }, [formData, sendFormSubmit]);

  // Handle OAuth completion
  const handleOAuthComplete = useCallback((platform: string, result: { shopUrl?: string; accessToken?: string; error?: string }) => {
    sendOAuthComplete(platform, result);
  }, [sendOAuthComplete]);

  // Render a component based on its type
  const renderComponent = (component: UIComponent) => {
    switch (component.type) {
      case 'chat_bubble':
        return <ChatBubble key={component.id} data={component as ChatBubbleProps} />;
      
      case 'action_button':
        return (
          <ActionButton 
            key={component.id} 
            data={component as ActionButtonProps}
            onClick={handleAction}
          />
        );
      
      case 'oauth_card':
        return (
          <OAuthCard 
            key={component.id}
            data={component as OAuthCardProps}
            onOAuthComplete={handleOAuthComplete}
          />
        );
      
      case 'progress_indicator':
        return <ProgressIndicator key={component.id} data={component as ProgressIndicatorProps} />;
      
      case 'info_panel':
        return <InfoPanel key={component.id} data={component as InfoPanelProps} />;
      
      case 'form_field':
        return (
          <FormField 
            key={component.id}
            data={component as FormFieldProps}
            onChange={handleFieldChange}
          />
        );
      
      case 'select_field':
        return (
          <SelectField 
            key={component.id}
            data={component as SelectFieldProps}
            onChange={handleFieldChange}
          />
        );
      
      default:
        console.warn('Unknown component type:', (component as UIComponent).type);
        return null;
    }
  };

  return (
    <div className={styles.widget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <span className={styles.logo}>✨</span>
          <h2 className={styles.title}>Onboarding</h2>
        </div>
        <div className={`${styles.status} ${connected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot} />
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content} ref={contentRef}>
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}
        
        {components.length === 0 && connected && (
          <div className={styles.waiting}>
            <div className={styles.waitingIcon}>🚀</div>
            <p>Waiting for agent...</p>
          </div>
        )}
        
        {components.map(renderComponent)}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Powered by AI Agent</p>
      </div>
    </div>
  );
}

export default OnboardingWidget;

