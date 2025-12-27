import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlatformCardContent, PLATFORM_CONFIGS } from '../types/canvas-types';
import styles from './PlatformCard.module.css';

interface Props {
  data: PlatformCardContent;
  onConnect: (platform: string, shopUrl?: string, productCount?: number) => void;
}

export function PlatformCard({ data, onConnect }: Props) {
  const { platform, title, description, features, buttonText, connected, shopUrl, productCount, delay = 0 } = data;
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const config = PLATFORM_CONFIGS[platform];

  const handleConnect = async () => {
    if (platform === 'shopify' && !showUrlInput) {
      setShowUrlInput(true);
      return;
    }

    if (platform === 'shopify' && inputUrl) {
      setIsConnecting(true);
      
      // Clean URL
      let cleanUrl = inputUrl.trim().toLowerCase();
      cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
      cleanUrl = cleanUrl.replace(/\/$/, '');
      if (!cleanUrl.includes('.myshopify.com')) {
        cleanUrl = cleanUrl.split('.')[0] + '.myshopify.com';
      }

      try {
        // Call backend to get OAuth URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const response = await fetch(`${API_URL}/auth/shopify/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopDomain: cleanUrl })
        });

        if (!response.ok) {
          throw new Error('Failed to start OAuth');
        }

        const { authUrl } = await response.json();

        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          authUrl, 
          'ShopifyOAuth', 
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listen for OAuth completion
        const checkPopup = setInterval(() => {
          try {
            if (popup?.closed) {
              clearInterval(checkPopup);
              setIsConnecting(false);
              
              // Check localStorage for OAuth result (fallback method)
              const storedResult = localStorage.getItem('shopify_oauth_result');
              if (storedResult) {
                try {
                  const result = JSON.parse(storedResult);
                  localStorage.removeItem('shopify_oauth_result');
                  onConnect(platform, result.shopDomain, result.productCount);
                  return;
                } catch (e) {
                  console.error('Failed to parse stored result:', e);
                }
              }
              
              // Check URL params for success (legacy fallback)
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.get('oauth') === 'success') {
                const shop = urlParams.get('shop') || cleanUrl;
                window.history.replaceState({}, '', window.location.pathname);
                onConnect(platform, shop);
              }
            }
          } catch (e) {
            // Cross-origin error - popup still open
          }
        }, 500);

        // Also listen for message from callback page
        const messageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'shopify_oauth_success') {
            clearInterval(checkPopup);
            setIsConnecting(false);
            popup?.close();
            window.removeEventListener('message', messageHandler);
            onConnect(platform, event.data.shopDomain, event.data.productCount);
          }
        };
        window.addEventListener('message', messageHandler);

      } catch (error) {
        console.error('OAuth error:', error);
        setIsConnecting(false);
        // Fallback to demo mode
        onConnect(platform, cleanUrl);
      }
    } else {
      onConnect(platform);
    }
  };

  if (connected) {
    return (
      <motion.div
        className={`${styles.card} ${styles.connected}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.connectedIcon} style={{ background: config.gradient }}>
          ✓
        </div>
        <div className={styles.connectedContent}>
          <h3>Yhdistetty: {config.name}</h3>
          {shopUrl && <p className={styles.shopUrl}>{shopUrl}</p>}
          {productCount && <p className={styles.productCount}>{productCount} tuotetta synkronoitu</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
    >
      <div className={styles.header}>
        <div className={styles.platformIcon} style={{ background: config.gradient }}>
          {config.icon}
        </div>
        <div className={styles.platformInfo}>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.features}>
        {features.map((feature, i) => (
          <motion.div 
            key={i}
            className={styles.feature}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (delay + 200 + i * 100) / 1000 }}
          >
            <span className={styles.checkmark}>✓</span>
            {feature}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showUrlInput && platform === 'shopify' && (
          <motion.div
            className={styles.urlInput}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder="kauppasi.myshopify.com"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={styles.connectButton}
        style={{ background: config.gradient }}
        onClick={handleConnect}
        disabled={isConnecting || (showUrlInput && !inputUrl)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isConnecting ? (
          <span className={styles.connecting}>
            <span className={styles.spinner} />
            Yhdistetään...
          </span>
        ) : showUrlInput ? (
          'Jatka yhdistämiseen →'
        ) : (
          buttonText
        )}
      </motion.button>
    </motion.div>
  );
}

