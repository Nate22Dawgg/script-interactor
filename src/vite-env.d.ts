
/// <reference types="vite/client" />

interface Window {
  _scriptSubscribers?: Record<string, ((message: any) => void)[]>;
  executeScriptFallback?: (scriptId: string, parameters?: Record<string, any>) => {
    executionId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    startTime: string;
  };
}
