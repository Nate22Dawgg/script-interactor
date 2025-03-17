
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
}
