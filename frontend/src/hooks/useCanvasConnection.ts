import { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasContent, ServerToCanvasMessage, CanvasToServerMessage, CanvasState } from '../types/canvas-types';

interface UseCanvasConnectionOptions {
  wsUrl?: string;
}

// Get WebSocket URL based on current environment
const getDefaultWsUrl = (): string => {
  // Runtime detection - check if we're in production (HTTPS)
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    
    console.log('[Canvas] Detecting WS URL:', { protocol, hostname });
    
    // Production: onboarding.bobbi.live -> wss://onboarding-api.bobbi.live/ws
    if (protocol === 'https:') {
      const apiHost = hostname.replace('onboarding.', 'onboarding-api.');
      const wsUrl = `wss://${apiHost}/ws`;
      console.log('[Canvas] Using production WS:', wsUrl);
      return wsUrl;
    }
    
    // Staging or other HTTPS domains
    if (hostname.includes('.bobbi.live')) {
      const apiHost = hostname.replace('onboarding.', 'onboarding-api.');
      const wsUrl = `wss://${apiHost}/ws`;
      console.log('[Canvas] Using staging WS:', wsUrl);
      return wsUrl;
    }
  }
  
  // Local development fallback
  console.log('[Canvas] Using local WS: ws://localhost:3001');
  return 'ws://localhost:3001';
};

export function useCanvasConnection(options: UseCanvasConnectionOptions = {}) {
  const { wsUrl = getDefaultWsUrl() } = options;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  const [state, setState] = useState<CanvasState>({
    contents: [],
    currentStep: 0,
    collectedData: {},
    connected: false
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | undefined>();

  // Send message to server
  const sendMessage = useCallback((message: CanvasToServerMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: ServerToCanvasMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'add_content':
          setState(prev => ({
            ...prev,
            contents: [...prev.contents, message.payload as CanvasContent]
          }));
          break;
          
        case 'clear':
          setState(prev => ({ ...prev, contents: [] }));
          break;
          
        case 'replace':
          setState(prev => ({
            ...prev,
            contents: [message.payload as CanvasContent]
          }));
          break;
          
        case 'update': {
          const { id, updates } = message.payload as { id: string; updates: Partial<CanvasContent> };
          setState(prev => ({
            ...prev,
            contents: prev.contents.map(c => 
              c.id === id ? { ...c, ...updates } as CanvasContent : c
            )
          }));
          break;
        }
        
        case 'celebrate':
          const celebrationData = message.payload as { message?: string };
          setCelebrationMessage(celebrationData.message);
          setShowCelebration(true);
          break;
      }
    } catch (err) {
      console.error('[Canvas] Parse error:', err);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setWsConnected(true);
      setState(prev => ({ ...prev, connected: true }));
    };
    
    ws.onmessage = handleMessage;
    
    ws.onclose = () => {
      setWsConnected(false);
      setState(prev => ({ ...prev, connected: false }));
      
      // Auto-reconnect
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 2000);
    };
    
    ws.onerror = () => {
      console.error('[Canvas] WebSocket error');
    };
  }, [wsUrl, handleMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  // User actions
  const submitInput = useCallback((fieldKey: string, value: string) => {
    setState(prev => ({
      ...prev,
      collectedData: { ...prev.collectedData, [fieldKey]: value }
    }));
    sendMessage({
      type: 'user_input',
      payload: { fieldKey, value }
    });
  }, [sendMessage]);

  const submitSelect = useCallback((fieldKey: string, value: string) => {
    setState(prev => ({
      ...prev,
      collectedData: { ...prev.collectedData, [fieldKey]: value }
    }));
    sendMessage({
      type: 'user_select',
      payload: { fieldKey, value }
    });
  }, [sendMessage]);

  const connectPlatform = useCallback((platform: string, shopUrl?: string, productCount?: number) => {
    setState(prev => ({
      ...prev,
      platform: platform as CanvasState['platform'],
      connected: true,
      collectedData: { ...prev.collectedData, shopUrl }
    }));
    
    // Send oauth_complete when we have a shopUrl (OAuth was successful)
    if (shopUrl) {
      sendMessage({
        type: 'oauth_complete',
        payload: { platform, shopDomain: shopUrl, productCount }
      });
    } else {
      sendMessage({
        type: 'platform_connect',
        payload: { value: platform }
      });
    }
  }, [sendMessage]);

  const triggerAction = useCallback((action: string) => {
    sendMessage({
      type: 'action',
      payload: { action }
    });
  }, [sendMessage]);

  const hideCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationMessage(undefined);
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    ...state,
    wsConnected,
    showCelebration,
    celebrationMessage,
    submitInput,
    submitSelect,
    connectPlatform,
    triggerAction,
    hideCelebration
  };
}

