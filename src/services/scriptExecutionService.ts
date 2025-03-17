import { ScriptExecutionRequest, ScriptExecutionResponse } from '../lib/types';
import { sendWebSocketMessage, simulateScriptExecution } from './websocket';
import { toast } from 'sonner';
import { MessageType, ScriptLanguage, LANGUAGE_RESOURCE_LIMITS } from './websocket/constants';

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

// Enhanced security scanner for script parameters
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
  
  // Get script details to determine language
  const scriptDetails = await fetch(`/api/scripts/${request.scriptId}`)
    .then(res => res.ok ? res.json() : null)
    .catch(() => null);
  
  // Determine appropriate resource limits based on language
  const language = scriptDetails?.language || 'python';
  const defaultLimits = LANGUAGE_RESOURCE_LIMITS[language as ScriptLanguage] || 
                        LANGUAGE_RESOURCE_LIMITS[ScriptLanguage.PYTHON];
  
  // Merge default limits with any provided limits
  const executionLimits = {
    ...defaultLimits,
    ...(request.executionLimits || {})
  };
  
  // Send execution request via WebSocket if available
  const messageSent = sendWebSocketMessage({
    type: MessageType.EXECUTE_SCRIPT,
    scriptId: request.scriptId,
    parameters: sanitizedParameters,
    language: language,
    executionLimits
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

// Enhanced script validation with multi-language support
export const validateScript = (code: string, language: string = 'python'): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Common checks for all languages
  if (!code || code.trim() === '') {
    issues.push('Script is empty');
    return { valid: false, issues };
  }
  
  // Language-specific checks
  switch (language.toLowerCase()) {
    case 'python':
      // Python-specific validation
      validatePythonScript(code, issues);
      break;
    case 'r':
      // R-specific validation
      validateRScript(code, issues);
      break;
    case 'julia':
      // Julia-specific validation
      validateJuliaScript(code, issues);
      break;
    case 'javascript':
      // JavaScript-specific validation
      validateJavaScriptScript(code, issues);
      break;
    case 'bash':
      // Bash-specific validation
      validateBashScript(code, issues);
      break;
    default:
      issues.push(`Unsupported language: ${language}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

// Python script validation
const validatePythonScript = (code: string, issues: string[]) => {
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
};

// R script validation
const validateRScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in R
  const dangerousOperations = [
    'system(', 'shell(', 'eval(parse', 'source(', 
    'install.packages(', 'library(parallel)', 'socket'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while(TRUE)') || code.includes('while (TRUE)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// Julia script validation
const validateJuliaScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in Julia
  const dangerousOperations = [
    'run(', 'eval(', 'include(', 'import', 'using Distributed', 
    'open(', 'download(', 'connect('
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while true') || code.includes('while (true)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// JavaScript script validation
const validateJavaScriptScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in JavaScript
  const dangerousOperations = [
    'eval(', 'Function(', 'setTimeout(', 'setInterval(', 
    'require(', 'process.', 'window.', 'document.'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while(true)') || code.includes('while (true)')) && 
      !code.includes('break') && !code.includes('return')) {
    issues.push('Contains potential infinite loop');
  }
};

// Bash script validation
const validateBashScript = (code: string, issues: string[]) => {
  // Check for potentially dangerous operations in Bash
  const dangerousOperations = [
    'rm -rf', 'mkfs', 'dd', '> /dev/', '| sh', 
    'curl | bash', 'wget | sh', 'sudo'
  ];
  
  dangerousOperations.forEach(op => {
    if (code.includes(op)) {
      issues.push(`Contains potentially unsafe operation: ${op}`);
    }
  });
  
  // Check for infinite loops
  if ((code.includes('while true') || code.includes('while :')) && 
      !code.includes('break') && !code.includes('exit')) {
    issues.push('Contains potential infinite loop');
  }
};
