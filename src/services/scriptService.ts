
import { Script, ScriptExecutionRequest, ScriptExecutionResponse } from '../lib/types';
import { toast } from 'sonner';
import { initializeWebSocket, subscribeToScript } from './websocketService';
import { executeScript as runScript } from './scriptExecutionService';
import { analyzeScriptForParameters } from './parameterAnalyzerService';
import { generateUIFromParameters, generateMockUI } from './uiGeneratorService';
import { generateMockParameters } from './mockDataService';

// Re-export the initializeWebSocket function for use in App.tsx
export { initializeWebSocket };

// Re-export the subscribeToScript function
export { subscribeToScript };

// Execute a script (proxy to scriptExecutionService)
export const executeScript = async (request: ScriptExecutionRequest): Promise<ScriptExecutionResponse> => {
  return runScript(request);
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
      generatedUI: generateMockUI(script.id)
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
      script.generatedUI = generateMockUI(script.id);
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

// Update script UI components
export const updateScriptUI = async (scriptId: string, uiComponents: any[]): Promise<Script> => {
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
