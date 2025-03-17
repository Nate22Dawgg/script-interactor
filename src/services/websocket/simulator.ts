
import { MessageType } from './constants';

// Simulate script execution with random output for development
export const simulateScriptExecution = (scriptId: string, parameters: Record<string, any> = {}): void => {
  // Import listeners map lazily to avoid circular dependencies
  const { listeners } = require('./messageHandler');
  
  const callback = listeners.get(scriptId);
  if (!callback) return;
  
  // Simulate script starting
  setTimeout(() => {
    callback({
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: `Script execution started with parameters: ${JSON.stringify(parameters)}`
    });
  }, 500);
  
  // Simulate a series of outputs
  let outputCount = 0;
  const outputInterval = setInterval(() => {
    outputCount++;
    
    // Generate random output
    callback({
      type: MessageType.OUTPUT,
      scriptId,
      content: `Output line ${outputCount}: Processing data...\n`
    });
    
    // Add some logs
    if (outputCount % 2 === 0) {
      callback({
        type: MessageType.LOG,
        scriptId,
        level: 'info',
        message: `Processing step ${outputCount} completed`
      });
    }
    
    // Stop after some iterations
    if (outputCount >= 10) {
      clearInterval(outputInterval);
      
      // Simulate completion
      setTimeout(() => {
        callback({
          type: MessageType.LOG,
          scriptId,
          level: 'info',
          message: 'Script execution completed successfully'
        });
        
        callback({
          type: MessageType.OUTPUT,
          scriptId,
          content: `\nExecution completed with ${outputCount} steps\nParameters: ${JSON.stringify(parameters)}\n`
        });
        
        // Simulate execution status
        callback({
          type: MessageType.EXECUTION_STATUS,
          scriptId,
          status: 'completed',
          executionTime: 3.45,
          memory: 128.5,
          cpuUsage: 45.2
        });
      }, 1000);
    }
  }, 800);
};
