import { MessageType, ScriptLanguage } from './constants';
import { WebSocketMessage, LogMessage, OutputMessage, ExecutionStatusMessage } from './types';

// Add the missing window property declaration
declare global {
  interface Window {
    _scriptSubscribers?: Record<string, ((message: WebSocketMessage) => void)[]>;
    executeScriptFallback?: (scriptId: string, parameters: Record<string, any>) => Promise<any>;
  }
}

// Simulate script execution for development & testing
export const simulateScriptExecution = (
  scriptId: string, 
  parameters: Record<string, any> = {},
  language: string = 'python'
): void => {
  console.log(`Simulating ${language} script execution for:`, scriptId, 'with parameters:', parameters);
  
  // Create event handlers
  const scriptSubscribers = window._scriptSubscribers || {};
  const subscribers = scriptSubscribers[scriptId] || [];
  
  if (subscribers.length === 0) {
    console.warn('No subscribers for script execution:', scriptId);
    return;
  }
  
  // Helper to notify all subscribers
  const notifySubscribers = (message: WebSocketMessage) => {
    subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  };
  
  // Send initial status
  const statusMessage: ExecutionStatusMessage = {
    type: MessageType.EXECUTION_STATUS,
    scriptId,
    status: 'running',
    timestamp: new Date().toISOString()
  };
  notifySubscribers(statusMessage);
  
  // Simulate script execution based on language
  switch (language.toLowerCase()) {
    case 'python':
      simulatePythonExecution(scriptId, parameters, notifySubscribers);
      break;
    case 'r':
      simulateRExecution(scriptId, parameters, notifySubscribers);
      break;
    case 'julia':
      simulateJuliaExecution(scriptId, parameters, notifySubscribers);
      break;
    case 'javascript':
      simulateJavaScriptExecution(scriptId, parameters, notifySubscribers);
      break;
    case 'bash':
      simulateBashExecution(scriptId, parameters, notifySubscribers);
      break;
    default:
      // Default to Python simulation
      simulatePythonExecution(scriptId, parameters, notifySubscribers);
  }
};

// Simulate Python script execution
const simulatePythonExecution = (
  scriptId: string,
  parameters: Record<string, any>,
  notifySubscribers: (message: WebSocketMessage) => void
) => {
  // Initial log message
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Python script execution started',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 500);
  
  // Import libraries log
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Importing libraries: numpy, pandas, matplotlib',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 1000);
  
  // Processing parameters
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: `Processing parameters: ${JSON.stringify(parameters)}`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 1500);
  
  // Sample output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: 'Python 3.9.5\nNumPy 1.21.0\nPandas 1.3.0\n',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 2000);
  
  // Completion status
  setTimeout(() => {
    const statusMessage: ExecutionStatusMessage = {
      type: MessageType.EXECUTION_STATUS,
      scriptId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      executionTime: 2.5,
      memory: 128
    };
    notifySubscribers(statusMessage);
  }, 2500);
};

// Simulate R script execution
const simulateRExecution = (
  scriptId: string,
  parameters: Record<string, any>,
  notifySubscribers: (message: WebSocketMessage) => void
) => {
  // Initial log message
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'R script execution started',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 500);
  
  // Loading libraries log
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Loading libraries: ggplot2, dplyr, tidyr',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 1000);
  
  // Parameter processing
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `> library(ggplot2)\n> library(dplyr)\n> args <- list(${Object.entries(parameters).map(([k, v]) => `${k}=${v}`).join(', ')})\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 1500);
  
  // Sample statistical output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `> summary(mtcars)\n   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. \n  10.40   15.43   19.20   20.09   22.80   33.90 \n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 2000);
  
  // Completion status
  setTimeout(() => {
    const statusMessage: ExecutionStatusMessage = {
      type: MessageType.EXECUTION_STATUS,
      scriptId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      executionTime: 3.1,
      memory: 256
    };
    notifySubscribers(statusMessage);
  }, 3000);
};

// Simulate Julia script execution
const simulateJuliaExecution = (
  scriptId: string,
  parameters: Record<string, any>,
  notifySubscribers: (message: WebSocketMessage) => void
) => {
  // Initial log message
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Julia script execution started',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 500);
  
  // Loading packages log
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Loading packages: DataFrames, Plots, CSV',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 1000);
  
  // Julia output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `julia> using DataFrames, Plots, CSV\n\njulia> params = Dict(${Object.entries(parameters).map(([k, v]) => `"${k}" => ${v}`).join(', ')})\nDict{String, Any} with ${Object.keys(parameters).length} entries\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 1800);
  
  // Computation output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `julia> A = rand(5,5)\n5×5 Matrix{Float64}:\n 0.123456  0.234567  0.345678  0.456789  0.567890\n 0.678901  0.789012  0.890123  0.901234  0.012345\n 0.123456  0.234567  0.345678  0.456789  0.567890\n 0.678901  0.789012  0.890123  0.901234  0.012345\n 0.123456  0.234567  0.345678  0.456789  0.567890\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 2500);
  
  // Completion status
  setTimeout(() => {
    const statusMessage: ExecutionStatusMessage = {
      type: MessageType.EXECUTION_STATUS,
      scriptId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      executionTime: 3.7,
      memory: 384
    };
    notifySubscribers(statusMessage);
  }, 3700);
};

// Simulate JavaScript script execution
const simulateJavaScriptExecution = (
  scriptId: string,
  parameters: Record<string, any>,
  notifySubscribers: (message: WebSocketMessage) => void
) => {
  // Initial log message
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'JavaScript script execution started',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 300);
  
  // JavaScript output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `> const params = ${JSON.stringify(parameters, null, 2)};\n> console.log('Parameters loaded');\nParameters loaded\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 800);
  
  // Processing log
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Processing data...',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 1200);
  
  // Sample calculation output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `> const result = Object.values(params).reduce((a, b) => a + b, 0);\n> console.log('Sum:', result);\nSum: ${Object.values(parameters).reduce((a: number, b: number) => Number(a) + Number(b), 0)}\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 1500);
  
  // Completion status
  setTimeout(() => {
    const statusMessage: ExecutionStatusMessage = {
      type: MessageType.EXECUTION_STATUS,
      scriptId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      executionTime: 1.8,
      memory: 64
    };
    notifySubscribers(statusMessage);
  }, 1800);
};

// Simulate Bash script execution
const simulateBashExecution = (
  scriptId: string,
  parameters: Record<string, any>,
  notifySubscribers: (message: WebSocketMessage) => void
) => {
  // Initial log message
  setTimeout(() => {
    const logMessage: LogMessage = {
      type: MessageType.LOG,
      scriptId,
      level: 'info',
      message: 'Bash script execution started',
      timestamp: new Date().toISOString()
    };
    notifySubscribers(logMessage);
  }, 200);
  
  // Bash environment output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `$ echo "Running in sandbox environment"\nRunning in sandbox environment\n$ uname -a\nLinux sandbox 5.10.0 #1 SMP Debian x86_64 GNU/Linux\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 600);
  
  // Parameter processing
  setTimeout(() => {
    const paramLines = Object.entries(parameters).map(([k, v]) => `$ ${k}="${v}"`).join('\n');
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `# Setting parameters\n${paramLines}\n$ echo "Parameters set"\nParameters set\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 1000);
  
  // File listing output
  setTimeout(() => {
    const outputMessage: OutputMessage = {
      type: MessageType.OUTPUT,
      scriptId,
      content: `$ ls -la\ntotal 20\ndrwxr-xr-x 2 sandbox sandbox 4096 May 15 12:34 .\ndrwxr-xr-x 4 sandbox sandbox 4096 May 15 12:34 ..\n-rw-r--r-- 1 sandbox sandbox  220 May 15 12:34 script.sh\n`,
      timestamp: new Date().toISOString()
    };
    notifySubscribers(outputMessage);
  }, 1300);
  
  // Completion status
  setTimeout(() => {
    const statusMessage: ExecutionStatusMessage = {
      type: MessageType.EXECUTION_STATUS,
      scriptId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      executionTime: 1.5,
      memory: 32
    };
    notifySubscribers(statusMessage);
  }, 1500);
};
