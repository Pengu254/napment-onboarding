import { useState, useEffect, useCallback, useRef } from 'react';
import { UIComponent, MCPToFrontendMessage, FrontendToMCPMessage } from '../types/mcp-messages';

interface UseMCPConnectionOptions {
  wsUrl?: string;
  autoConnect?: boolean;
}

interface MCPConnectionState {
  connected: boolean;
  components: UIComponent[];
  error: string | null;
}

export function useMCPConnection(options: UseMCPConnectionOptions = {}) {
  const { 
    wsUrl = 'ws://localhost:3001', 
    autoConnect = true 
  } = options;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  const [state, setState] = useState<MCPConnectionState>({
    connected: false,
    components: [],
    error: null
  });

  // Send message to MCP server
  const sendMessage = useCallback((message: FrontendToMCPMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('[WS] Sent:', message.type);
    } else {
      console.warn('[WS] Cannot send - not connected');
    }
  }, []);

  // Handle incoming message
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: MCPToFrontendMessage = JSON.parse(event.data);
      console.log('[WS] Received:', message.type, message.payload);
      
      switch (message.type) {
        case 'show_component':
          setState(prev => ({
            ...prev,
            components: [...prev.components, message.payload as UIComponent]
          }));
          break;
          
        case 'update_component': {
          const { id, updates } = message.payload as { id: string; updates: Partial<UIComponent> };
          setState(prev => ({
            ...prev,
            components: prev.components.map(c => 
              c.id === id ? { ...c, ...updates } as UIComponent : c
            )
          }));
          break;
        }
        
        case 'remove_component': {
          const { id } = message.payload as { id: string };
          setState(prev => ({
            ...prev,
            components: prev.components.filter(c => c.id !== id)
          }));
          break;
        }
        
        case 'clear_all':
          setState(prev => ({ ...prev, components: [] }));
          break;
          
        default:
          console.warn('[WS] Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('[WS] Parse error:', err);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    console.log('[WS] Connecting to', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('[WS] Connected');
      setState(prev => ({ ...prev, connected: true, error: null }));
    };
    
    ws.onmessage = handleMessage;
    
    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setState(prev => ({ ...prev, connected: false }));
      
      // Auto-reconnect after 2 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('[WS] Attempting reconnect...');
        connect();
      }, 2000);
    };
    
    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      setState(prev => ({ ...prev, error: 'Connection error' }));
    };
  }, [wsUrl, handleMessage]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Action handlers
  const sendUserAction = useCallback((action: string, data?: unknown) => {
    sendMessage({
      type: 'user_action',
      payload: { action, data, timestamp: new Date().toISOString() }
    });
  }, [sendMessage]);

  const sendFormSubmit = useCallback((formId: string, data: Record<string, unknown>) => {
    sendMessage({
      type: 'form_submit',
      payload: { formId, data, timestamp: new Date().toISOString() }
    });
  }, [sendMessage]);

  const sendOAuthComplete = useCallback((platform: string, result: { shopUrl?: string; accessToken?: string; error?: string }) => {
    if (result.error) {
      sendMessage({
        type: 'oauth_error',
        payload: { platform, error: result.error }
      });
    } else {
      sendMessage({
        type: 'oauth_complete',
        payload: { platform, ...result }
      });
    }
  }, [sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendUserAction,
    sendFormSubmit,
    sendOAuthComplete
  };
}

