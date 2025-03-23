
import { ScriptExecutionRequest, ScriptExecutionResponse } from '../../lib/types';
import { toast } from 'sonner';
import { sendWebSocketMessage, simulateScriptExecution } from '../websocket';
import { MessageType, ScriptLanguage, LANGUAGE_RESOURCE_LIMITS } from '../websocket/constants';
import { rateLimiter } from './rateLimiter';
import { sanitizeParameters } from './security';
import { 
  validatePythonScript, 
  validateRScript, 
  validateJuliaScript, 
  validateJavaScriptScript, 
  validateBashScript 
} from './validators';
import { ValidationResult } from './types';

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
export const validateScript = (code: string, language: string = 'python'): ValidationResult => {
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
