
import { Parameter, Script } from '../lib/types';
import { generateUIFromParameters } from './uiGeneratorService';

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
