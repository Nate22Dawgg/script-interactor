
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
  parameters?: Parameter[];
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

export interface Parameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  default?: any; // Changed from string to any to allow different types
  description?: string;
  required?: boolean;
  options?: string[] | number[];
}

export interface UIComponent {
  id: string;
  type: 'input' | 'slider' | 'checkbox' | 'button' | 'select' | 'container' | 'chart' | 'table';
  label?: string;
  value?: any;
  options?: any[];
  children?: UIComponent[];
  handler?: string; // Reference to a function in the script
  target?: string; // Target parameter or visualization
  config?: any; // Additional configuration
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
