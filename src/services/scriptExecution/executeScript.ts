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
import { ValidationResult, ResourceLimits, NGSScriptConfig } from './types';

// Default resource limits specifically for NGS processing
const NGS_RESOURCE_LIMITS: ResourceLimits = {
  memoryMB: 2048,
  cpuMillicores: 1000,
  diskMB: 1024,
  timeoutSeconds: 600
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
  
  // Check if this is an NGS script by examining script content or metadata
  const isNGSScript = detectNGSScript(scriptDetails?.code || '', scriptDetails?.metadata);
  
  // Apply NGS-specific limits if needed
  const defaultLimits = isNGSScript 
    ? NGS_RESOURCE_LIMITS 
    : (LANGUAGE_RESOURCE_LIMITS[language as ScriptLanguage] || 
       LANGUAGE_RESOURCE_LIMITS[ScriptLanguage.PYTHON]);
  
  // Merge default limits with any provided limits
  const executionLimits = {
    ...defaultLimits,
    ...(request.executionLimits || {})
  };
  
  // Add NGS-specific configuration if detected
  const ngsConfig: NGSScriptConfig | undefined = isNGSScript ? {
    threadCount: request.parameters?.threads || 4,
    referenceGenome: request.parameters?.reference || 'hg38',
    qualityThreshold: request.parameters?.quality || 20
  } : undefined;
  
  // Send execution request via WebSocket if available
  const messageSent = sendWebSocketMessage({
    type: MessageType.EXECUTE_SCRIPT,
    scriptId: request.scriptId,
    parameters: sanitizedParameters,
    language: language,
    executionLimits,
    ngsConfig
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

// Helper function to detect if a script is likely processing NGS data
function detectNGSScript(code: string, metadata?: any): boolean {
  // Check for common NGS libraries and functions
  const ngsKeywords = [
    'pysam', 'Bio.SeqIO', 'fastq', 'fasta', 'bam', 'sam', 'vcf', 
    'sequencing', 'alignment', 'variant', 'genome', 'bowtie', 'bwa',
    'read_depth', 'coverage', 'trimming', 'adapter'
  ];
  
  // If metadata explicitly marks it as NGS, use that
  if (metadata?.type === 'ngs' || metadata?.category === 'ngs') {
    return true;
  }
  
  // Otherwise check code content
  return ngsKeywords.some(keyword => 
    code.toLowerCase().includes(keyword.toLowerCase())
  );
}

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
