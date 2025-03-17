
export interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  language: 'python' | 'javascript' | 'other';
  dateCreated: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output?: string;
  executionTime?: number;
  memory?: number;
  cpuUsage?: number;
  logs?: LogEntry[];
  visualizations?: Visualization[];
  generatedUI?: UIComponent[];
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface Visualization {
  id: string;
  type: 'chart' | 'graph' | 'table' | 'image';
  data: any;
  config?: any;
}

export interface UIComponent {
  id: string;
  type: 'input' | 'slider' | 'checkbox' | 'button' | 'select' | 'container';
  label?: string;
  value?: any;
  options?: any[];
  children?: UIComponent[];
  handler?: string; // Reference to a function in the script
}

export interface ScriptExecutionRequest {
  scriptId: string;
  parameters?: Record<string, any>;
}

export interface ScriptExecutionResponse {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
}

export interface ExecutionEnvironment {
  memoryLimit: number;
  timeoutSeconds: number;
  allowedModules: string[];
}
