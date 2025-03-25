
// Export all websocket service functionality
export { 
  initializeWebSocket,
  getWebSocketStatus,
  sendWebSocketMessage
} from './connection';

export {
  subscribeToScript
} from './messageHandler';

export {
  simulateScriptExecution
} from './simulator';

// Export types
export type {
  WebSocketMessage,
  LogMessage,
  OutputMessage,
  ExecutionStatusMessage
} from './types';

// Re-export constants that might be needed by consumers
export { MessageType } from './constants';
