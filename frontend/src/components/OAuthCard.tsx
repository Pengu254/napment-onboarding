import { useState, useCallback } from 'react';
import { OAuthCardProps, PLATFORM_CONFIG } from '../types/mcp-messages';
import styles from './OAuthCard.module.css';

interface Props {
  data: OAuthCardProps;
  onOAuthComplete: (platform: string, result: { shopUrl?: string; accessToken?: string; error?: string }) => void;
}

export function OAuthCard({ data, onOAuthComplete }: Props) {
  const { platform, title, description, buttonText, connected, shopUrl } = data;
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputShopUrl, setInputShopUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  const config = PLATFORM_CONFIG[platform];

  const handleConnect = useCallback(() => {
    if (platform === 'shopify') {
      // For Shopify, we need the shop URL first
      if (!showUrlInput) {
        setShowUrlInput(true);
        return;
      }
      
      if (!inputShopUrl) {
        return;
      }

      setIsConnecting(true);
      
      // Clean up the shop URL
      let cleanUrl = inputShopUrl.trim().toLowerCase();
      cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
      cleanUrl = cleanUrl.replace(/\/$/, '');
      if (!cleanUrl.includes('.myshopify.com')) {
        cleanUrl = cleanUrl.replace('.myshopify.com', '') + '.myshopify.com';
      }
      
      // In a real implementation, this would open an OAuth popup
      // For demo, we simulate the OAuth flow
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Simulate OAuth popup (in production, this would be real Shopify OAuth)
      const popup = window.open(
        'about:blank',
        'ShopifyOAuth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );
      
      if (popup) {
        // Simulate OAuth completion after 2 seconds
        popup.document.write(`
          <html>
            <head>
              <title>Connecting to Shopify...</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                  color: white;
                }
                .spinner {
                  width: 50px;
                  height: 50px;
                  border: 4px solid rgba(255,255,255,0.2);
                  border-top-color: #96bf48;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
                h2 { margin-top: 24px; }
                p { opacity: 0.7; }
              </style>
            </head>
            <body>
              <div class="spinner"></div>
              <h2>🛍️ Connecting to Shopify</h2>
              <p>Authenticating with ${cleanUrl}...</p>
            </body>
          </html>
        `);
        
        // Simulate OAuth success
        setTimeout(() => {
          popup.close();
          setIsConnecting(false);
          onOAuthComplete(platform, { 
            shopUrl: cleanUrl,
            accessToken: 'demo_token_' + Date.now()
          });
        }, 2500);
      }
    } else {
      // For other platforms, just simulate connection
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        onOAuthComplete(platform, { accessToken: 'demo_token' });
      }, 1500);
    }
  }, [platform, inputShopUrl, showUrlInput, onOAuthComplete]);

  if (connected) {
    return (
      <div className={`${styles.card} ${styles.connected}`}>
        <div className={styles.icon} style={{ background: config.color }}>
          <span>{config.icon}</span>
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>✅ {config.name} Connected</h3>
          {shopUrl && <p className={styles.shopUrl}>{shopUrl}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ background: config.color }}>
        <span>{config.icon}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        {showUrlInput && platform === 'shopify' && (
          <div className={styles.urlInput}>
            <input
              type="text"
              placeholder="yourstore.myshopify.com"
              value={inputShopUrl}
              onChange={(e) => setInputShopUrl(e.target.value)}
              className={styles.input}
              autoFocus
            />
          </div>
        )}
        
        <button
          className={styles.connectButton}
          style={{ 
            background: isConnecting ? 'rgba(255,255,255,0.1)' : config.color 
          }}
          onClick={handleConnect}
          disabled={isConnecting || (showUrlInput && !inputShopUrl)}
        >
          {isConnecting ? (
            <>
              <span className={styles.spinner}></span>
              Connecting...
            </>
          ) : showUrlInput ? (
            'Continue with Shopify'
          ) : (
            buttonText
          )}
        </button>
      </div>
    </div>
  );
}

