
import { ScriptExecutionRequest, ScriptExecutionResponse } from '../lib/types';
import { sendWebSocketMessage, simulateScriptExecution } from './websocketService';

// Execute a script
export const executeScript = async (request: ScriptExecutionRequest): Promise<ScriptExecutionResponse> => {
  console.log('Executing script:', request.scriptId, 'with parameters:', request.parameters);
  
  // Send execution request via WebSocket if available
  const messageSent = sendWebSocketMessage({
    type: 'execute_script',
    scriptId: request.scriptId,
    parameters: request.parameters
  });
  
  if (!messageSent && window.executeScriptFallback) {
    // Use fallback mechanism if WebSocket is not available
    return window.executeScriptFallback(request.scriptId, request.parameters);
  }
  
  // Simulate a delay for the script to start executing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    executionId: `exec-${Date.now()}`,
    status: 'running',
    startTime: new Date().toISOString()
  };
};
