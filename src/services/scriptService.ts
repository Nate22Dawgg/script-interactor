
import { Script, ScriptExecutionRequest, ScriptExecutionResponse, LogEntry } from '../lib/types';
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
      
      if (data.type === 'log') {
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
  console.log('Executing script:', request.scriptId);
  
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
    return mockScripts;
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
    return mockScripts.find(script => script.id === id) || null;
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
    return {
      id: `mock-${Date.now()}`,
      name: file.name.replace('.py', ''),
      description: description || 'Uploaded script',
      code: content || '# Python code will be loaded here\nprint("Hello, world!")',
      language: 'python',
      dateCreated: new Date().toISOString(),
      status: 'idle',
      logs: [],
      visualizations: []
    };
  }
};
