
import { Parameter } from '../lib/types';

// Analyze script content to extract parameters
export const analyzeScriptForParameters = (code: string): Parameter[] => {
  // In a real implementation, this would use an LLM or parser
  // to extract parameters from the script
  const parameters: Parameter[] = [];
  
  // Check if script has function definitions
  const functionMatches = code.match(/def\s+(\w+)\s*\((.*?)\):/g);
  if (functionMatches) {
    // Find the main function (usually the last one or one called main)
    const mainFunction = functionMatches[functionMatches.length - 1];
    
    // Extract parameters from function signature
    const paramsMatch = mainFunction.match(/def\s+\w+\s*\((.*?)\):/);
    if (paramsMatch && paramsMatch[1]) {
      const paramsList = paramsMatch[1].split(',').filter(p => p.trim() !== '');
      
      // Create parameter objects
      paramsList.forEach((param, index) => {
        const paramParts = param.trim().split('=');
        const paramName = paramParts[0].trim();
        let paramDefault: any = paramParts.length > 1 ? paramParts[1].trim() : undefined;
        let paramType: Parameter['type'] = 'string';
        
        // Try to infer type from default value
        if (paramDefault) {
          if (paramDefault === 'True' || paramDefault === 'False') {
            paramType = 'boolean';
            paramDefault = paramDefault === 'True'; // Convert to actual boolean
          } else if (!isNaN(Number(paramDefault))) {
            paramType = 'number';
            paramDefault = Number(paramDefault); // Convert to actual number
          } else if (paramDefault.startsWith('[') && paramDefault.endsWith(']')) {
            paramType = 'array';
          } else if (paramDefault.startsWith('{') && paramDefault.endsWith('}')) {
            paramType = 'object';
          }
        }
        
        // Look for type hints
        if (param.includes(':')) {
          const typeHint = param.split(':')[1].split('=')[0].trim();
          if (typeHint.includes('int') || typeHint.includes('float')) {
            paramType = 'number';
          } else if (typeHint.includes('bool')) {
            paramType = 'boolean';
          } else if (typeHint.includes('list') || typeHint.includes('List')) {
            paramType = 'array';
          } else if (typeHint.includes('dict') || typeHint.includes('Dict')) {
            paramType = 'object';
          }
        }
        
        parameters.push({
          id: `param-${index}`,
          name: paramName,
          type: paramType,
          default: paramDefault,
          description: `Parameter ${paramName} for script execution`,
          required: !paramDefault
        });
      });
    }
  }
  
  // If no parameters found, add a few mock ones for demo purposes
  if (parameters.length === 0 && code.length > 0) {
    if (code.includes('print') || code.includes('matplotlib')) {
      parameters.push({
        id: 'param-output-format',
        name: 'output_format',
        type: 'string',
        default: 'text',
        description: 'Format of the output (text, json, csv)',
        options: ['text', 'json', 'csv']
      });
    }
    
    if (code.includes('data') || code.includes('pd.') || code.includes('pandas')) {
      parameters.push({
        id: 'param-row-limit',
        name: 'row_limit',
        type: 'number',
        default: 100,
        description: 'Maximum number of rows to process'
      });
    }
    
    if (code.includes('plot') || code.includes('fig') || code.includes('plt.')) {
      parameters.push({
        id: 'param-show-legend',
        name: 'show_legend',
        type: 'boolean',
        default: true,
        description: 'Whether to show legend on plots'
      });
    }
  }
  
  return parameters;
};
