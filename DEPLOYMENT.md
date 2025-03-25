
# Simple Deployment Guide for Script Execution Platform

This guide provides a straightforward approach to deploy your application with minimal technical knowledge required, while still allowing it to scale to approximately 100 users.

## Quick Start (5-10 minutes)

### Option 1: Deploy on Railway (Easiest)

1. **Sign up for Railway**
   - Go to [Railway.app](https://railway.app/) and create an account (they offer a free tier)

2. **Connect your GitHub repository**
   - In Railway, click "New Project" → "Deploy from GitHub repo"
   - Select this repository

3. **Configure the deployment**
   - Railway will automatically detect your Docker configuration
   - Click "Deploy" and wait for the build to complete (5-10 minutes)
   - Once deployed, Railway will provide you with a URL for your application

### Option 2: Deploy Locally with Docker Compose (More Control)

#### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine

#### Steps

1. **Clone your repository**
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Start the application**
   ```bash
   docker-compose up
   ```

3. **Access your application**
   - Open your browser and go to `http://localhost:80`

## Understanding What's Happening

When you deploy with either method:

1. The frontend (user interface) runs in a container
2. The backend (script execution service) runs in a separate container
3. Redis is used for temporary storage and messaging

This setup can easily handle up to 100 concurrent users without modifications.

## Scaling Beyond 100 Users

When you need to scale:

1. For Railway: Upgrade your plan for more resources
2. For self-hosting: Increase the resources in docker-compose.yml:
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '2'  # Increase to 4 or 8
           memory: 1G  # Increase to 2G or 4G
   ```

## Troubleshooting

- **Application not loading**: Check if all containers are running with `docker-compose ps`
- **Scripts not executing**: Check the backend logs with `docker-compose logs backend`
- **Slow performance**: Increase the resource limits in docker-compose.yml

## Need More Help?

If you encounter any issues, consult the Docker documentation or contact support at support@example.com.
