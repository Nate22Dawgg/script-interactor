
import { toast } from 'sonner';

// WebSocket connection for real-time script execution
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const listeners: Map<string, (data: any) => void> = new Map();

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return;
  
  // If we've reached max reconnect attempts, stop trying
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('Max reconnect attempts reached. Stopping reconnect attempts.');
    // Reset reconnect attempts after some time to allow future attempts
    setTimeout(() => {
      reconnectAttempts = 0;
    }, 60000); // 1 minute
    return;
  }

  // In production, this would point to your actual WebSocket server
  // For development, we'll simulate WebSocket with a fallback mechanism
  try {
    const wsUrl = import.meta.env.DEV 
      ? 'ws://localhost:8000/ws/scripts' 
      : `wss://${window.location.host}/ws/scripts`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'log' || data.type === 'output' || data.type === 'visualization') {
          const scriptId = data.scriptId;
          const callback = listeners.get(scriptId);
          if (callback) {
            callback(data);
          }
        }
        
        if (data.type === 'execution_status' && data.status === 'completed') {
          toast.success(`Script ${data.scriptId} execution completed`);
        }
        
        if (data.type === 'execution_status' && data.status === 'failed') {
          toast.error(`Script ${data.scriptId} execution failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Don't show toast on every error to avoid overwhelming the user
      if (reconnectAttempts === 0) {
        toast.error('Lost connection to the server. Trying to reconnect...');
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
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

// Setup fallback for development when WebSocket connection fails
const setupFallbackMechanism = () => {
  console.log('Setting up fallback mechanism for script execution');
  
  // Create a simple polling mechanism to simulate WebSocket for development
  window.executeScriptFallback = (scriptId: string, parameters: Record<string, any> = {}) => {
    console.log('Simulating script execution for:', scriptId, 'with parameters:', parameters);
    
    // Simulate initial execution status
    simulateScriptExecution(scriptId, parameters);
    
    return {
      executionId: `exec-fallback-${Date.now()}`,
      status: 'running',
      startTime: new Date().toISOString()
    };
  };
};

// Simulate script execution with random output, logs, and visualizations
export const simulateScriptExecution = (scriptId: string, parameters: Record<string, any> = {}) => {
  const callback = listeners.get(scriptId);
  if (!callback) return;
  
  // Simulate script starting
  setTimeout(() => {
    callback({
      type: 'log',
      scriptId,
      level: 'info',
      message: `Script execution started with parameters: ${JSON.stringify(parameters)}`
    });
  }, 500);
  
  // Simulate a series of outputs
  let outputCount = 0;
  const outputInterval = setInterval(() => {
    outputCount++;
    
    // Generate random output
    callback({
      type: 'output',
      scriptId,
      content: `Output line ${outputCount}: Processing data...\n`
    });
    
    // Add some logs
    if (outputCount % 2 === 0) {
      callback({
        type: 'log',
        scriptId,
        level: 'info',
        message: `Processing step ${outputCount} completed`
      });
    }
    
    // Stop after some iterations
    if (outputCount >= 10) {
      clearInterval(outputInterval);
      
      // Simulate completion
      setTimeout(() => {
        callback({
          type: 'log',
          scriptId,
          level: 'info',
          message: 'Script execution completed successfully'
        });
        
        callback({
          type: 'output',
          scriptId,
          content: `\nExecution completed with ${outputCount} steps\nParameters: ${JSON.stringify(parameters)}\n`
        });
        
        // Simulate execution status
        callback({
          type: 'execution_status',
          scriptId,
          status: 'completed',
          executionTime: 3.45,
          memory: 128.5,
          cpuUsage: 45.2
        });
      }, 1000);
    }
  }, 800);
};

// Subscribe to script execution updates
export const subscribeToScript = (scriptId: string, callback: (data: any) => void) => {
  listeners.set(scriptId, callback);
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'subscribe',
      scriptId
    }));
  }
  
  return () => {
    listeners.delete(scriptId);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        scriptId
      }));
    }
  };
};

// Get WebSocket connection status
export const getWebSocketStatus = () => {
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

// Send a message through WebSocket
export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
};
