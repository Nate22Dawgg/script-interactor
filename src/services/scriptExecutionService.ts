
import { ScriptExecutionRequest, ScriptExecutionResponse } from '../lib/types';
import { sendWebSocketMessage, simulateScriptExecution } from './websocketService';
import { toast } from 'sonner';

// Rate limiting implementation
const rateLimiter = {
  requestCounts: new Map<string, number>(),
  lastReset: Date.now(),
  maxRequests: 10, // Max 10 executions per minute per script
  resetInterval: 60000, // 1 minute in milliseconds
  
  checkLimit(scriptId: string): boolean {
    // Reset counts if interval has passed
    const now = Date.now();
    if (now - this.lastReset > this.resetInterval) {
      this.requestCounts.clear();
      this.lastReset = now;
    }
    
    // Get current count for this script
    const currentCount = this.requestCounts.get(scriptId) || 0;
    
    // Check if limit is exceeded
    if (currentCount >= this.maxRequests) {
      return false;
    }
    
    // Increment count
    this.requestCounts.set(scriptId, currentCount + 1);
    return true;
  }
};

// Security scanner for script parameters
const sanitizeParameters = (parameters: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  // Process each parameter to prevent injection attacks
  for (const [key, value] of Object.entries(parameters)) {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }
    
    if (typeof value === 'string') {
      // Remove potentially dangerous patterns for command injection
      let sanitizedValue = value
        .replace(/;/g, '') // Remove semicolons
        .replace(/&/g, '&amp;') // Escape ampersands
        .replace(/</g, '&lt;') // Escape < 
        .replace(/>/g, '&gt;') // Escape >
        .replace(/`/g, '') // Remove backticks
        .replace(/\$/g, '') // Remove $ signs
        .replace(/\|/g, ''); // Remove pipes
        
      sanitized[key] = sanitizedValue;
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeParameters(value);
    } else {
      // For numbers, booleans, etc.
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Execute a script with added security measures
export const executeScript = async (request: ScriptExecutionRequest): Promise<ScriptExecutionResponse> => {
  console.log('Executing script:', request.scriptId, 'with parameters:', request.parameters);
  
  // Check rate limits
  if (!rateLimiter.checkLimit(request.scriptId)) {
    toast.error('Rate limit exceeded. Please try again later.');
    throw new Error('Rate limit exceeded for script execution');
  }
  
  // Sanitize parameters
  const sanitizedParameters = request.parameters ? sanitizeParameters(request.parameters) : {};
  
  // Send execution request via WebSocket if available
  const messageSent = sendWebSocketMessage({
    type: 'execute_script',
    scriptId: request.scriptId,
    parameters: sanitizedParameters,
    executionLimits: {
      timeoutSeconds: 60,
      memoryLimitMB: 128,
      maxLoopIterations: 10000
    }
  });
  
  if (!messageSent && window.executeScriptFallback) {
    // Use fallback mechanism if WebSocket is not available
    return window.executeScriptFallback(request.scriptId, sanitizedParameters);
  }
  
  // Simulate a delay for the script to start executing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    executionId: `exec-${Date.now()}`,
    status: 'running',
    startTime: new Date().toISOString()
  };
};

// Add script validation functions
export const validateScript = (code: string): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for potentially dangerous imports
  const dangerousImports = [
    'os.system', 'subprocess.', 'eval(', 'exec(', '__import__', 
    'importlib', 'pickle.', 'marshal.', 'open(', 'file(', 
    'requests.', 'urllib.', 'socket.'
  ];
  
  dangerousImports.forEach(imp => {
    if (code.includes(imp)) {
      issues.push(`Contains potentially unsafe operation: ${imp}`);
    }
  });
  
  // Check for infinite loops (simplistic approach)
  if ((code.includes('while True') || code.includes('while 1')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
  
  // Check for excessive resource usage
  if (code.includes('range(') && !code.includes('len(')) {
    const rangeMatches = code.match(/range\s*\(\s*(\d+)/g);
    if (rangeMatches) {
      rangeMatches.forEach(match => {
        const numberMatch = match.match(/\d+/);
        if (numberMatch && parseInt(numberMatch[0]) > 1000000) {
          issues.push('Contains very large range operation');
        }
      });
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};
