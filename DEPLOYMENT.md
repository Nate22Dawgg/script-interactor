
# Deployment Guide

This document provides guidance on deploying the Script Execution Platform to production environments.

## Prerequisites

- Docker & Docker Compose
- Access to cloud provider (AWS, GCP, or Azure)
- Domain name (optional, but recommended)
- SSL certificate (recommended for production)

## Deployment Options

### 1. Simple Docker Compose Deployment

For smaller deployments or testing:

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-directory>

# Deploy with Docker Compose
docker-compose up -d
```

Access the application at http://localhost or http://server-ip

### 2. Kubernetes Deployment (Recommended for Production)

For scalable, production deployments:

1. Build and push Docker images to a container registry:

```bash
# Build and tag images
docker build -t your-registry/script-platform-frontend:latest .
docker build -t your-registry/script-platform-backend:latest ./backend

# Push to registry
docker push your-registry/script-platform-frontend:latest
docker push your-registry/script-platform-backend:latest
```

2. Deploy to Kubernetes:

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/monitoring.yaml
```

## Auto-Scaling Configuration

The platform is configured to auto-scale based on CPU and memory usage:

- Backend services scale up when CPU exceeds 70% utilization
- Additional instances are added in increments, up to a maximum of 10
- Scaling down occurs when CPU drops below 50% for 5 minutes

## Monitoring & Logging

The deployment includes:

- Prometheus for metrics collection
- Grafana for visualization (default credentials: admin/admin_password)
- Logs are stored in Elasticsearch and viewable in Kibana

Access monitoring dashboards:
- Grafana: https://your-domain.com/grafana or http://server-ip:3000
- Prometheus: https://your-domain.com/prometheus or http://server-ip:9090

## Security Considerations

- Change default credentials for Grafana and other services
- Enable SSL/TLS for all public endpoints
- Review and adjust resource limits in docker-compose.yml or Kubernetes manifests
- Set up proper network policies to restrict access

## Maintenance

Regular maintenance tasks:

- Monitor disk usage for persistent volumes
- Rotate logs to prevent disk space issues
- Update Docker images with security patches
- Back up Redis data and configurations

## Troubleshooting

Common issues and solutions:

1. WebSocket connection failures:
   - Check network policies and firewall rules
   - Verify proper proxy configuration for WebSocket upgrade headers

2. High memory usage:
   - Adjust resource limits in configuration
   - Monitor script execution patterns and optimize

3. Slow script execution:
   - Check for resource contention
   - Optimize container resource allocation
   - Consider dedicated nodes for compute-intensive scripts
