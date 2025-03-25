export interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  language: 'python' | 'r' | 'julia' | 'javascript' | 'bash';
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
  relatedTools?: string[];
  performanceMetrics?: PerformanceMetrics;
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
  default?: any;
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
  handler?: string;
  target?: string;
  config?: any;
}

export interface ScriptExecutionRequest {
  scriptId: string;
  parameters?: Record<string, any>;
  executionLimits?: {
    timeoutSeconds?: number;
    memoryLimitMB?: number;
    maxLoopIterations?: number;
  };
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

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests?: number;
  dataProcessed?: number;
}

export interface ScalingMetrics {
  currentLoad: number;
  instanceCount: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUtilization: number;
  memoryUtilization: number;
}
