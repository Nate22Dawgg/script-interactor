
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface LogMessage extends WebSocketMessage {
  scriptId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface OutputMessage extends WebSocketMessage {
  scriptId: string;
  content: string;
}

export interface ExecutionStatusMessage extends WebSocketMessage {
  scriptId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'security_violation';
  executionTime?: number;
  memory?: number;
  cpuUsage?: number;
  error?: string;
  details?: string;
}

export interface SubscriptionMessage extends WebSocketMessage {
  scriptId: string;
}

export interface ExecuteScriptMessage extends WebSocketMessage {
  scriptId: string;
  parameters: Record<string, any>;
  executionLimits: {
    timeoutSeconds: number;
    memoryLimitMB: number;
    maxLoopIterations: number;
  };
}
