
import { Script, ScriptExecutionRequest } from '../lib/types';
import { validateScript } from '../services/scriptExecutionService';

/**
 * Test script execution in a sandboxed environment
 * @param script The script to test
 * @returns Test results with errors/warnings if any
 */
export const testScriptExecution = async (script: Script): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  timeToExecute?: number;
  memoryUsed?: number;
}> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // First perform static validation
  const validation = validateScript(script.code);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.issues,
      warnings: []
    };
  }
  
  // Simulate a sandboxed execution environment
  try {
    // In a real implementation, this would send the script to a backend
    // with actual sandbox capabilities. For now, we'll simulate it.
    console.log('Testing script execution in sandbox:', script.id);
    
    // Simulate script execution time and resource usage
    const executionTime = Math.random() * 2 + 0.5; // 0.5 to 2.5 seconds
    const memoryUsed = Math.random() * 50 + 10; // 10 to 60 MB
    
    // Check for simulated timeout
    if (executionTime > 2) {
      warnings.push('Script execution time is longer than recommended');
    }
    
    // Check for simulated memory usage
    if (memoryUsed > 50) {
      warnings.push('Script uses more memory than recommended');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution
    
    return {
      success: true,
      errors,
      warnings,
      timeToExecute: executionTime,
      memoryUsed
    };
  } catch (error) {
    if (error instanceof Error) {
      errors.push(`Execution error: ${error.message}`);
    } else {
      errors.push('Unknown execution error');
    }
    
    return {
      success: false,
      errors,
      warnings
    };
  }
};

/**
 * Test script parameters to ensure they're valid
 */
export const validateScriptParameters = (
  parameters: Record<string, any> = {}
): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for dangerous parameter values
  for (const [key, value] of Object.entries(parameters)) {
    if (typeof value === 'string') {
      // Check for potential code injection in string parameters
      const dangerousPatterns = [
        /\beval\s*\(/i,
        /\bexec\s*\(/i,
        /\bsystem\s*\(/i,
        /\bimport\s+os\b/i,
        /\bimport\s+subprocess\b/i,
        /\brequire\s*\(/i,
        /\b__import__\s*\(/i,
        /\bopen\s*\(/i,
        /\b\.\.\//i,  // Path traversal
        /\bhttp:\/\//i, // URLs
        /\bhttps:\/\//i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          issues.push(`Parameter "${key}" contains potentially unsafe pattern`);
          break;
        }
      }
      
      // Check for very large string values (potential DoS)
      if (value.length > 10000) {
        issues.push(`Parameter "${key}" exceeds maximum allowed length`);
      }
    } else if (typeof value === 'number') {
      // Check for very large numbers (potential DoS)
      if (value > 1000000000) {
        issues.push(`Parameter "${key}" exceeds maximum allowed value`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};
