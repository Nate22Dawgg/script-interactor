import { toast } from 'sonner';
import { 
  WS_RECONNECT_ATTEMPTS, 
  WS_CONNECTION_TIMEOUT, 
  WS_HEARTBEAT_INTERVAL, 
  MessageType 
} from './constants';

// WebSocket connection for real-time script execution
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let heartbeatInterval: number | null = null;

// Initialize WebSocket connection
export const initializeWebSocket = (): void => {
  if (socket && socket.readyState === WebSocket.OPEN) return;
  
  // If we've reached max reconnect attempts, stop trying
  if (reconnectAttempts >= WS_RECONNECT_ATTEMPTS) {
    console.log('Max reconnect attempts reached. Stopping reconnect attempts.');
    // Reset reconnect attempts after some time to allow future attempts
    setTimeout(() => {
      reconnectAttempts = 0;
    }, 60000); // 1 minute
    return;
  }

  // Use secure WebSocket connections
  try {
    const wsUrl = import.meta.env.DEV 
      ? 'ws://localhost:8000/ws/scripts' 
      : `wss://${window.location.host}/ws/scripts`;
    
    socket = new WebSocket(wsUrl);
    
    // Set timeout for connection
    const connectionTimeout = setTimeout(() => {
      if (socket && socket.readyState !== WebSocket.OPEN) {
        socket.close();
        console.error('WebSocket connection timeout');
      }
    }, WS_CONNECTION_TIMEOUT);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      clearTimeout(connectionTimeout);
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Update global status
      (window as any).wsStatus = 'open';
      
      // Implement periodic heartbeat to keep connection alive
      heartbeatInterval = window.setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: MessageType.HEARTBEAT }));
        } else {
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
        }
      }, WS_HEARTBEAT_INTERVAL);
    };
    
    socket.onmessage = handleWebSocketMessage;
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      // Don't show toast on every error to avoid overwhelming the user
      if (reconnectAttempts === 0) {
        toast.error('Lost connection to the server. Trying to reconnect...');
      }
      
      // Update global status
      (window as any).wsStatus = 'error';
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      clearTimeout(connectionTimeout);
      
      // Clear heartbeat interval
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      
      // Update global status
      (window as any).wsStatus = 'closed';
      
      socket = null;
      reconnectAttempts++;
      
      // Try to reconnect after a delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(() => {
        initializeWebSocket();
      }, delay);
    };
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    // Set up fallback mechanism for development
    setupFallbackMechanism();
  }
};

// Get WebSocket connection status
export const getWebSocketStatus = (): 'connecting' | 'open' | 'closing' | 'closed' | 'unknown' => {
  if (!socket) return 'closed';
  
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      return 'connecting';
    case WebSocket.OPEN:
      return 'open';
    case WebSocket.CLOSING:
      return 'closing';
    case WebSocket.CLOSED:
      return 'closed';
    default:
      return 'unknown';
  }
};

// Send a message through WebSocket with validation
export const sendWebSocketMessage = (message: any): boolean => {
  // Basic message validation
  if (!message || typeof message !== 'object' || !message.type) {
    console.error('Invalid WebSocket message format');
    return false;
  }
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      const messageString = JSON.stringify(message);
      
      // Limit message size to prevent DoS
      if (messageString.length > 100000) { // 100KB limit
        console.error('WebSocket message too large');
        return false;
      }
      
      socket.send(messageString);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  return false;
};

// Handler for websocket messages
const handleWebSocketMessage = (event: MessageEvent) => {
  try {
    // Import handlers lazily to avoid circular dependencies
    const { handleWebSocketMessage: processMessage } = require('./messageHandler');
    processMessage(event.data);
  } catch (error) {
    console.error('Error in websocket message handler:', error);
  }
};

// Setup fallback for development when WebSocket connection fails
const setupFallbackMechanism = () => {
  console.log('Setting up fallback mechanism for script execution');
  
  // Create a simple polling mechanism to simulate WebSocket for development
  (window as any).executeScriptFallback = (scriptId: string, parameters: Record<string, any> = {}) => {
    console.log('Simulating script execution for:', scriptId, 'with parameters:', parameters);
    
    // Import simulation function lazily to avoid circular dependencies
    const { simulateScriptExecution } = require('./simulator');
    simulateScriptExecution(scriptId, parameters);
    
    return {
      executionId: `exec-fallback-${Date.now()}`,
      status: 'running',
      startTime: new Date().toISOString()
    };
  };
};
