
import { toast } from 'sonner';
import { MessageType } from './constants';
import type { 
  WebSocketMessage, 
  LogMessage, 
  ExecutionStatusMessage 
} from './types';

// Map of script listeners
const listeners: Map<string, (data: any) => void> = new Map();

// Validate and process websocket messages
export const handleWebSocketMessage = (data: string): void => {
  try {
    // Validate JSON payload before processing
    const message = JSON.parse(data) as WebSocketMessage;
    
    // Validate message type
    if (!message.type) {
      console.warn('Invalid WebSocket message format: missing type');
      return;
    }
    
    // Handle different message types
    switch (message.type) {
      case MessageType.LOG:
      case MessageType.OUTPUT:
      case MessageType.VISUALIZATION:
        handleScriptMessage(message);
        break;
      
      case MessageType.EXECUTION_STATUS:
        handleExecutionStatus(message as ExecutionStatusMessage);
        break;
      
      case MessageType.SECURITY_VIOLATION:
        // Handle security violations specially
        handleSecurityViolation(message);
        break;
      
      default:
        // Unknown message type
        console.log(`Received message of type: ${message.type}`);
    }
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
  }
};

// Handle script-related messages (logs, output, visualization)
const handleScriptMessage = (message: WebSocketMessage): void => {
  // Validate scriptId
  if (!message.scriptId) {
    console.warn(`Invalid WebSocket message: missing scriptId for type ${message.type}`);
    return;
  }
  
  const scriptId = message.scriptId;
  const callback = listeners.get(scriptId);
  if (callback) {
    callback(message);
  }
};

// Handle execution status messages
const handleExecutionStatus = (message: ExecutionStatusMessage): void => {
  // Validate execution status data
  if (!message.scriptId || !message.status) {
    console.warn('Invalid execution status message');
    return;
  }
  
  // Find listener and notify
  const callback = listeners.get(message.scriptId);
  if (callback) {
    callback(message);
  }
  
  // Show appropriate notifications
  switch (message.status) {
    case 'completed':
      toast.success(`Script ${message.scriptId} execution completed`);
      break;
    
    case 'failed':
      toast.error(`Script ${message.scriptId} execution failed: ${message.error || 'Unknown error'}`);
      break;
  }
};

// Handle security violation messages
const handleSecurityViolation = (message: WebSocketMessage): void => {
  toast.error(`Security violation detected: ${message.details || 'Unknown security issue'}`);
  console.error('Security violation in script execution:', message);
};

// Subscribe to script execution updates with added security
export const subscribeToScript = (scriptId: string, callback: (data: any) => void): () => void => {
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
    if (data.type === MessageType.LOG && (!data.level || !data.message)) {
      console.warn('Invalid log message format');
      return;
    }
    
    if (data.type === MessageType.OUTPUT && data.content === undefined) {
      console.warn('Invalid output message format');
      return;
    }
    
    // Safe to pass to application code
    callback(data);
  };
  
  listeners.set(scriptId, secureCallback);
  
  // Send subscription message via the imported function
  const { sendWebSocketMessage } = require('./connection');
  sendWebSocketMessage({
    type: MessageType.SUBSCRIBE,
    scriptId
  });
  
  // Return unsubscribe function
  return () => {
    listeners.delete(scriptId);
    
    const { sendWebSocketMessage } = require('./connection');
    sendWebSocketMessage({
      type: MessageType.UNSUBSCRIBE,
      scriptId
    });
  };
};
