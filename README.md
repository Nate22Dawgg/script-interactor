
# Script Execution Platform

This project provides a web-based platform for uploading, managing, and executing Python scripts with a real-time interface.

## Features

- Upload Python scripts
- Execute scripts with parameters
- Real-time execution feedback via WebSockets
- Script management (listing, viewing, updating)
- Containerized deployment with Docker

## Architecture

The application consists of:

1. **Frontend**: A React-based web application
2. **Backend**: Node.js server with Express and WebSockets
3. **Execution Environment**: Python script execution engine

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.x (for script execution)

### Running with Docker

1. Clone this repository
2. Build and start the containers:
   ```
   docker-compose up
   ```
3. Access the application at http://localhost

## Development

For local development:

1. Start the backend:
   ```
   cd backend
   npm install
   npm start
   ```

2. Start the frontend:
   ```
   npm install
   npm run dev
   ```

## License

This project is open-source and available under the MIT License.
