
# Script Execution Platform - Backend

This directory contains the backend code for the Script Execution Platform.

## Structure

- `index.js` - Main entry point for the backend server
- `routes/` - API endpoints
- `services/` - Business logic
- `models/` - Data models
- `middleware/` - Express middleware

## Running Locally

```bash
npm install
npm start
```

## Environment Variables

- `PORT` - Port to run the server on (default: 8000)
- `NODE_ENV` - Environment (development/production)
- `MAX_SCRIPT_SIZE` - Maximum script size in bytes
- `MAX_EXECUTION_TIME` - Maximum execution time in seconds
```
