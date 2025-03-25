
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PythonShell } = require('python-shell');

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname, 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// In-memory storage for demo purposes
// In a production app, you would use a database
const scripts = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'execute') {
        const scriptId = data.scriptId;
        const script = scripts.find(s => s.id === scriptId);
        
        if (!script) {
          ws.send(JSON.stringify({
            type: 'error',
            scriptId,
            message: 'Script not found'
          }));
          return;
        }
        
        // Update script status
        script.status = 'running';
        
        // Send status update
        ws.send(JSON.stringify({
          type: 'status',
          scriptId,
          status: 'running'
        }));
        
        // Execute script
        const scriptPath = path.join(scriptsDir, `${scriptId}.py`);
        
        const options = {
          mode: 'text',
          pythonPath: 'python3',
          pythonOptions: ['-u'], // unbuffered output
          scriptPath: scriptsDir,
          args: data.params || []
        };
        
        // Execute script with PythonShell
        PythonShell.run(scriptPath, options)
          .then(results => {
            // Update script status and logs
            script.status = 'completed';
            script.logs = results;
            
            // Send final results
            ws.send(JSON.stringify({
              type: 'result',
              scriptId,
              status: 'completed',
              logs: results
            }));
          })
          .catch(err => {
            // Update script status and logs
            script.status = 'error';
            script.logs = [err.toString()];
            
            // Send error
            ws.send(JSON.stringify({
              type: 'error',
              scriptId,
              status: 'error',
              message: err.toString()
            }));
          });
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// REST API Routes

// Get all scripts
app.get('/api/scripts', (req, res) => {
  res.json(scripts);
});

// Get script by ID
app.get('/api/scripts/:id', (req, res) => {
  const scriptId = req.params.id;
  const script = scripts.find(s => s.id === scriptId);
  
  if (!script) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  res.json(script);
});

// Upload a new script
app.post('/api/scripts/upload', express.raw({ type: 'application/octet-stream', limit: process.env.MAX_SCRIPT_SIZE || '10mb' }), (req, res) => {
  try {
    // Get file info from headers
    const fileName = req.headers['x-file-name'];
    const description = req.headers['x-description'] || '';
    
    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }
    
    // Generate script ID and clean name
    const scriptId = `script_${Date.now()}`;
    const cleanName = path.basename(fileName.toString()).replace(/\.py$/, '');
    
    // Save script to file
    const scriptPath = path.join(scriptsDir, `${scriptId}.py`);
    fs.writeFileSync(scriptPath, req.body);
    
    // Create script object
    const newScript = {
      id: scriptId,
      name: cleanName,
      description: description.toString(),
      language: 'python',
      dateCreated: new Date().toISOString(),
      status: 'idle',
      logs: [],
      visualizations: [],
      parameters: [],
      generatedUI: []
    };
    
    // Add to in-memory storage
    scripts.push(newScript);
    
    res.status(201).json(newScript);
  } catch (error) {
    console.error('Error uploading script:', error);
    res.status(500).json({ error: 'Failed to upload script' });
  }
});

// Update script
app.put('/api/scripts/:id', express.json(), (req, res) => {
  const scriptId = req.params.id;
  const scriptIndex = scripts.findIndex(s => s.id === scriptId);
  
  if (scriptIndex === -1) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  // Update script object (retain id and code)
  const updatedScript = {
    ...scripts[scriptIndex],
    ...req.body,
    id: scriptId // Ensure ID doesn't change
  };
  
  scripts[scriptIndex] = updatedScript;
  
  res.json(updatedScript);
});

// Update script UI
app.put('/api/scripts/:id/ui', express.json(), (req, res) => {
  const scriptId = req.params.id;
  const scriptIndex = scripts.findIndex(s => s.id === scriptId);
  
  if (scriptIndex === -1) {
    return res.status(404).json({ error: 'Script not found' });
  }
  
  // Update UI components
  scripts[scriptIndex].generatedUI = req.body.uiComponents || [];
  
  res.json(scripts[scriptIndex]);
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
