
# Script Execution Platform - Backend

This directory contains the backend code for the Script Execution Platform, providing:

- REST API for script management
- WebSocket server for real-time script execution
- Python script execution environment

## API Endpoints

- `GET /api/scripts` - List all scripts
- `GET /api/scripts/:id` - Get a specific script
- `POST /api/scripts/upload` - Upload a new script
- `PUT /api/scripts/:id` - Update script metadata
- `PUT /api/scripts/:id/ui` - Update script UI components

## WebSocket Events

The WebSocket server handles the following events:

- `execute` - Execute a script with optional parameters
- `status` - Receive script execution status updates
- `result` - Receive script execution results
- `error` - Receive error messages

## Development

To run the backend:

```bash
npm install
npm start
```

The server will run on port 8000 by default.
