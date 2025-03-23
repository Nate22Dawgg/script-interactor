
// Enhanced security scanner for script parameters
export const sanitizeParameters = (parameters: Record<string, any>): Record<string, any> => {
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
