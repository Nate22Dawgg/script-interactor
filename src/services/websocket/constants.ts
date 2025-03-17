
// WebSocket connection constants
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_CONNECTION_TIMEOUT = 5000; // 5 seconds
export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds
export const WS_MAX_MESSAGE_SIZE = 100000; // 100KB

// Message types
export enum MessageType {
  HEARTBEAT = 'heartbeat',
  LOG = 'log',
  OUTPUT = 'output',
  VISUALIZATION = 'visualization',
  EXECUTION_STATUS = 'execution_status', 
  SECURITY_VIOLATION = 'security_violation',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  EXECUTE_SCRIPT = 'execute_script'
}
