
import { Script, ScriptExecutionRequest, ScriptExecutionResponse, LogEntry, UIComponent, Parameter } from '../lib/types';
import { toast } from 'sonner';

// WebSocket connection for real-time script execution
let socket: WebSocket | null = null;
const listeners: Map<string, (data: any) => void> = new Map();

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  // In production, this would point to your actual WebSocket server
  const wsUrl = import.meta.env.DEV 
    ? 'ws://localhost:8000/ws/scripts' 
    : `wss://${window.location.host}/ws/scripts`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'log' || data.type === 'output' || data.type === 'visualization') {
        const scriptId = data.scriptId;
        const callback = listeners.get(scriptId);
        if (callback) {
          callback(data);
        }
      }
      
      if (data.type === 'execution_status' && data.status === 'completed') {
        toast.success(`Script ${data.scriptId} execution completed`);
      }
      
      if (data.type === 'execution_status' && data.status === 'failed') {
        toast.error(`Script ${data.scriptId} execution failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    toast.error('Lost connection to the server. Trying to reconnect...');
  };
  
  socket.onclose = () => {
    console.log('WebSocket connection closed. Attempting to reconnect...');
    // Try to reconnect after a delay
    setTimeout(() => {
      initializeWebSocket();
    }, 3000);
  };
};

// Subscribe to script execution updates
export const subscribeToScript = (scriptId: string, callback: (data: any) => void) => {
  listeners.set(scriptId, callback);
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'subscribe',
      scriptId
    }));
  }
  
  return () => {
    listeners.delete(scriptId);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        scriptId
      }));
    }
  };
};

// Execute a script
export const executeScript = async (request: ScriptExecutionRequest): Promise<ScriptExecutionResponse> => {
  // This would be a real API call in production
  // For now, we'll simulate it
  console.log('Executing script:', request.scriptId, 'with parameters:', request.parameters);
  
  // Send execution request via WebSocket for real-time updates
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'execute_script',
      scriptId: request.scriptId,
      parameters: request.parameters
    }));
  }
  
  // Simulate a delay for the script to start executing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    executionId: `exec-${Date.now()}`,
    status: 'running',
    startTime: new Date().toISOString()
  };
};

// Get all scripts
export const getScripts = async (): Promise<Script[]> => {
  // In a real app, this would fetch from your API
  // For now, we're using the mock data
  try {
    const response = await fetch('/api/scripts');
    if (!response.ok) {
      throw new Error('Failed to fetch scripts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching scripts:', error);
    
    // Fallback to mock data in case of error or during development
    const { mockScripts } = await import('../lib/mockData');
    
    // Add some ui components to the mock scripts for demo purposes
    const enhancedScripts = mockScripts.map(script => ({
      ...script,
      parameters: generateMockParameters(script),
      generatedUI: generateMockUI(script)
    }));
    
    return enhancedScripts;
  }
};

// Get a single script by ID
export const getScriptById = async (id: string): Promise<Script | null> => {
  try {
    const response = await fetch(`/api/scripts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch script');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching script ${id}:`, error);
    
    // Fallback to mock data
    const { mockScripts } = await import('../lib/mockData');
    const script = mockScripts.find(script => script.id === id) || null;
    
    if (script) {
      // Add generated UI components for demo
      script.parameters = generateMockParameters(script);
      script.generatedUI = generateMockUI(script);
    }
    
    return script;
  }
};

// Update a script
export const updateScript = async (script: Script): Promise<Script> => {
  try {
    const response = await fetch(`/api/scripts/${script.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(script),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update script');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating script ${script.id}:`, error);
    // Just return the script that was passed in for now
    return script;
  }
};

// Upload a script
export const uploadScript = async (file: File, description: string = ''): Promise<Script> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    
    const response = await fetch('/api/scripts/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload script');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading script:', error);
    
    // Create a mock script for development
    const content = await file.text();
    
    // Analyze script content to extract parameters
    const parameters = analyzeScriptForParameters(content);
    
    const newScript: Script = {
      id: `mock-${Date.now()}`,
      name: file.name.replace('.py', ''),
      description: description || 'Uploaded script',
      code: content || '# Python code will be loaded here\nprint("Hello, world!")',
      language: 'python',
      dateCreated: new Date().toISOString(),
      status: 'idle',
      logs: [],
      visualizations: [],
      parameters,
      generatedUI: generateUIFromParameters(parameters)
    };
    
    return newScript;
  }
};

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
        let paramDefault = paramParts.length > 1 ? paramParts[1].trim() : undefined;
        let paramType: Parameter['type'] = 'string';
        
        // Try to infer type from default value
        if (paramDefault) {
          if (paramDefault === 'True' || paramDefault === 'False') {
            paramType = 'boolean';
            paramDefault = paramDefault === 'True';
          } else if (!isNaN(Number(paramDefault))) {
            paramType = 'number';
            paramDefault = Number(paramDefault);
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

// Generate UI components from parameters
export const generateUIFromParameters = (parameters: Parameter[]): UIComponent[] => {
  if (parameters.length === 0) {
    return [];
  }
  
  const components: UIComponent[] = [];
  
  // Create a container for all parameters
  const paramsContainer: UIComponent = {
    id: 'ui-params-container',
    type: 'container',
    label: 'Script Parameters',
    children: []
  };
  
  // Create UI components for each parameter
  parameters.forEach(param => {
    switch (param.type) {
      case 'boolean':
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'checkbox',
          label: param.name,
          value: param.default || false,
          target: param.id
        });
        break;
      case 'number':
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'slider',
          label: param.name,
          value: param.default || 0,
          target: param.id,
          config: {
            min: 0,
            max: 100,
            step: 1
          }
        });
        break;
      case 'array':
        // For array types, we'd normally create a more complex component
        // For demo, we'll use a text input
        paramsContainer.children?.push({
          id: `ui-${param.id}`,
          type: 'input',
          label: param.name,
          value: param.default ? JSON.stringify(param.default) : '',
          target: param.id
        });
        break;
      default:
        // For string and other types
        if (param.options && param.options.length > 0) {
          paramsContainer.children?.push({
            id: `ui-${param.id}`,
            type: 'select',
            label: param.name,
            value: param.default || '',
            options: param.options,
            target: param.id
          });
        } else {
          paramsContainer.children?.push({
            id: `ui-${param.id}`,
            type: 'input',
            label: param.name,
            value: param.default || '',
            target: param.id
          });
        }
        break;
    }
  });
  
  // Add execute button
  paramsContainer.children?.push({
    id: 'ui-execute-button',
    type: 'button',
    label: 'Execute Script',
    handler: 'execute'
  });
  
  components.push(paramsContainer);
  
  // If there are visualization parameters, add visualization components
  const hasDataParams = parameters.some(p => 
    p.name.includes('data') || 
    p.name.includes('output') || 
    p.name.includes('result')
  );
  
  if (hasDataParams) {
    components.push({
      id: 'ui-visualization',
      type: 'container',
      label: 'Results Visualization',
      children: [
        {
          id: 'ui-chart',
          type: 'chart',
          label: 'Data Visualization',
          target: parameters.find(p => p.name.includes('data'))?.id
        }
      ]
    });
  }
  
  return components;
};

// Generate mock parameters for demo purposes
const generateMockParameters = (script: Script): Parameter[] => {
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

// Generate mock UI for demo purposes
const generateMockUI = (script: Script): UIComponent[] => {
  // This is just for demo - in production this would come from backend
  const hasMock = script.id.includes('data') || script.name.includes('data');
  
  if (hasMock) {
    return [
      {
        id: 'ui-1',
        type: 'container',
        label: 'Data Processing Parameters',
        children: [
          {
            id: 'ui-2',
            type: 'input',
            label: 'Data Source',
            target: 'param-1',
            value: 'sample_data.csv'
          },
          {
            id: 'ui-3',
            type: 'slider',
            label: 'Number of Rows',
            target: 'param-2',
            value: 50,
            config: {
              min: 10,
              max: 1000,
              step: 10
            }
          },
          {
            id: 'ui-4',
            type: 'checkbox',
            label: 'Include Headers',
            target: 'param-3',
            value: true
          },
          {
            id: 'ui-5',
            type: 'select',
            label: 'Output Format',
            target: 'param-4',
            value: 'json',
            options: ['json', 'csv', 'table']
          },
          {
            id: 'ui-6',
            type: 'button',
            label: 'Process Data',
            handler: 'execute'
          }
        ]
      },
      {
        id: 'ui-7',
        type: 'container',
        label: 'Visualization',
        children: [
          {
            id: 'ui-8',
            type: 'chart',
            label: 'Data Preview',
            target: 'param-1'
          }
        ]
      }
    ];
  }
  
  return [];
};

// Update script UI components
export const updateScriptUI = async (scriptId: string, uiComponents: UIComponent[]): Promise<Script> => {
  try {
    const response = await fetch(`/api/scripts/${scriptId}/ui`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uiComponents }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update script UI');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating script UI for ${scriptId}:`, error);
    
    // For dev purposes, just get the script and return it with updated UI
    const script = await getScriptById(scriptId);
    if (script) {
      script.generatedUI = uiComponents;
      return script;
    }
    
    throw error;
  }
};
