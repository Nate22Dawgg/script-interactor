
// This file is now just a re-export of the modularized websocket service
// for backwards compatibility with existing imports

export {
  initializeWebSocket,
  getWebSocketStatus,
  sendWebSocketMessage,
  subscribeToScript,
  simulateScriptExecution
} from './websocket';
