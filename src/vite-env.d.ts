
/// <reference types="vite/client" />

interface Window {
  executeScriptFallback?: (scriptId: string, parameters?: Record<string, any>) => {
    executionId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    startTime: string;
  };
}
