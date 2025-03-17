
import { Parameter, Script } from '../lib/types';
import { generateUIFromParameters } from './uiGeneratorService';
import { validateScript } from './scriptExecutionService';

// Generate mock parameters for demo purposes
export const generateMockParameters = (script: Script): Parameter[] => {
  // This is just for demo - in production this would come from the backend
  const hasMock = script.id.includes('data') || script.name.includes('data');
  
  if (hasMock) {
    return [
      {
        id: 'param-1',
        name: 'data_source',
        type: 'string',
        default: 'sample_data.csv',
        description: 'Source data file to process',
        required: true
      },
      {
        id: 'param-2',
        name: 'n_rows',
        type: 'number',
        default: 50,
        description: 'Number of rows to process',
        required: false
      },
      {
        id: 'param-3',
        name: 'include_headers',
        type: 'boolean',
        default: true,
        description: 'Whether to include headers in the output',
        required: false
      },
      {
        id: 'param-4',
        name: 'output_format',
        type: 'string',
        default: 'json',
        description: 'Format of the output',
        required: false,
        options: ['json', 'csv', 'table']
      }
    ];
  }
  
  return [];
};

// Scan script content for malicious patterns
export const scanScriptContent = (code: string): { safe: boolean; issues: string[] } => {
  const validation = validateScript(code);
  return {
    safe: validation.valid,
    issues: validation.issues
  };
};

// Scan uploaded file for dangerous content
export const scanUploadedFile = async (file: File): Promise<{ safe: boolean; issues: string[] }> => {
  // Check file extension first
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'py') {
    return {
      safe: false,
      issues: ['Only Python (.py) files are supported']
    };
  }
  
  // Check file size
  if (file.size > 1024 * 1024) { // 1MB limit
    return {
      safe: false,
      issues: ['File size exceeds the maximum allowed limit (1MB)']
    };
  }
  
  try {
    // Read file content
    const content = await readFileAsText(file);
    
    // Scan the content
    return scanScriptContent(content);
  } catch (error) {
    return {
      safe: false,
      issues: ['Failed to read file content for security scanning']
    };
  }
};

// Helper to read file content
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};
