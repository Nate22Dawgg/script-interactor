import { toast } from 'sonner';

// WebSocket connection for real-time script execution
let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const listeners: Map<string, (data: any) => void> = new Map();

// Enhanced WebSocket with security considerations
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
    }, 5000);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      clearTimeout(connectionTimeout);
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Implement periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'heartbeat' }));
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000);
    };
    
    socket.onmessage = (event) => {
      try {
        // Validate JSON payload before processing
        const data = JSON.parse(event.data);
        
        // Validate message type
        if (!data.type) {
          console.warn('Invalid WebSocket message format: missing type');
          return;
        }
        
        if (data.type === 'log' || data.type === 'output' || data.type === 'visualization') {
          // Validate scriptId
          if (!data.scriptId) {
            console.warn('Invalid WebSocket message: missing scriptId');
            return;
          }
          
          const scriptId = data.scriptId;
          const callback = listeners.get(scriptId);
          if (callback) {
            callback(data);
          }
        }
        
        if (data.type === 'execution_status') {
          // Validate execution status data
          if (!data.scriptId || !data.status) {
            console.warn('Invalid execution status message');
            return;
          }
          
          if (data.status === 'completed') {
            toast.success(`Script ${data.scriptId} execution completed`);
          }
          
          if (data.status === 'failed') {
            toast.error(`Script ${data.scriptId} execution failed: ${data.error || 'Unknown error'}`);
          }
          
          // Handle security related events
          if (data.status === 'security_violation') {
            toast.error(`Security violation detected: ${data.details || 'Unknown issue'}`);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      // Don't show toast on every error to avoid overwhelming the user
      if (reconnectAttempts === 0) {
        toast.error('Lost connection to the server. Trying to reconnect...');
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      clearTimeout(connectionTimeout);
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

// Subscribe to script execution updates with added security
export const subscribeToScript = (scriptId: string, callback: (data: any) => void) => {
  // Validate scriptId to prevent injection
  if (typeof scriptId !== 'string' || scriptId.length === 0 || scriptId.length > 100) {
    console.error('Invalid scriptId provided to subscribeToScript');
    return () => {};
  }
  
  // Create a secure wrapped callback that validates data
  const secureCallback = (data: any) => {
    // Basic validation before passing to user code
    if (!data || typeof data !== 'object' || !data.type) {
      console.warn('Invalid data received from WebSocket');
      return;
    }
    
    // Validate specific fields based on message type
    if (data.type === 'log' && (!data.level || !data.message)) {
      console.warn('Invalid log message format');
      return;
    }
    
    if (data.type === 'output' && data.content === undefined) {
      console.warn('Invalid output message format');
      return;
    }
    
    // Safe to pass to application code
    callback(data);
  };
  
  listeners.set(scriptId, secureCallback);
  
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

// Send a message through WebSocket with validation
export const sendWebSocketMessage = (message: any) => {
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
