# MintFlow Deployment Guide

This guide explains how to deploy MintFlow, with a specific focus on deploying the server in runner mode.

## Overview

MintFlow uses a microservices architecture with the following components:

1. **Infrastructure Services**: Databases and caches (PostgreSQL, MongoDB, KeyDB, Weaviate, QDrant)
2. **Main Application**: The core MintFlow server
3. **Runner Instances**: Additional instances of the main server with communication services disabled
   - These instances only process workflow tasks and don't handle API requests

## Deployment Options

### Option 1: Docker Compose (Development/Testing)

This is the simplest deployment method, suitable for development and testing environments.

#### Step 1: Set up Infrastructure

```bash
# Start the infrastructure services
docker-compose up -d
```

This will start PostgreSQL, MongoDB, KeyDB, Weaviate, and QDrant.

#### Step 2: Deploy the Main Server and Runner Instances

Create a docker-compose file that includes both the main server and runner instances:

```yaml
# docker-compose-complete.yml
version: '3.8'

services:
  # Main application server
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mintflow-app
    restart: always
    environment:
      - REDIS_HOST=192.168.88.143
      - REDIS_PORT=6379
      - MONGO_URI=mongodb://appmint_admin:fBIwmIfEvpU@192.168.88.140:27017,192.168.88.141:27017/admin?authSource=admin&replicaSet=rs0
      - RUNNER_MODE=false
    ports:
      - "3600:3600"
    networks:
      - mintflow-network
    depends_on:
      - keydb
      - postgres
      - mongodb
      - weaviate

  # Runner instance (same codebase, different configuration)
  runner:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mintflow-runner
    restart: always
    environment:
      - REDIS_HOST=192.168.88.143
      - REDIS_PORT=6379
      - MONGO_URI=mongodb://appmint_admin:fBIwmIfEvpU@192.168.88.140:27017,192.168.88.141:27017/admin?authSource=admin&replicaSet=rs0
      - RUNNER_MODE=true
      - TENANTS=tenantA,tenantB
    networks:
      - mintflow-network
    depends_on:
      - keydb
      - postgres
      - mongodb
      - weaviate

networks:
  mintflow-network:
    external: true
```

Then start the services:

```bash
docker-compose -f docker-compose-complete.yml up -d
```

You can scale the runner instances as needed:

```bash
docker-compose -f docker-compose-complete.yml up -d --scale runner=3
```

### Option 2: Kubernetes Deployment (Production)

For production environments, Kubernetes provides better scalability and management.

#### Step 1: Create Kubernetes Manifests

Create deployment manifests for the main application and runner instances:

**Main Application Deployment (app-deployment.yaml):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mintflow-app
spec:
  replicas: 2  # Adjust based on your needs
  selector:
    matchLabels:
      app: mintflow-app
  template:
    metadata:
      labels:
        app: mintflow-app
    spec:
      containers:
      - name: mintflow-app
        image: your-registry/mintflow:latest
        env:
        - name: REDIS_HOST
          value: 192.168.88.143
        - name: REDIS_PORT
          value: "6379"
        - name: MONGO_URI
          value: mongodb://appmint_admin:fBIwmIfEvpU@192.168.88.140:27017,192.168.88.141:27017/admin?authSource=admin&replicaSet=rs0
        - name: RUNNER_MODE
          value: "false"
        ports:
        - containerPort: 3600
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**Runner Deployment (runner-deployment.yaml):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mintflow-runner
spec:
  replicas: 3  # Adjust based on your needs
  selector:
    matchLabels:
      app: mintflow-runner
  template:
    metadata:
      labels:
        app: mintflow-runner
    spec:
      containers:
      - name: mintflow-runner
        image: your-registry/mintflow:latest
        env:
        - name: REDIS_HOST
          value: 192.168.88.143
        - name: REDIS_PORT
          value: "6379"
        - name: MONGO_URI
          value: mongodb://appmint_admin:fBIwmIfEvpU@192.168.88.140:27017,192.168.88.141:27017/admin?authSource=admin&replicaSet=rs0
        - name: RUNNER_MODE
          value: "true"
        - name: TENANTS
          value: tenantA,tenantB
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### Step 2: Build and Push Docker Image

```bash
# Build the MintFlow image
docker build -t your-registry/mintflow:latest .

# Push image to your registry
docker push your-registry/mintflow:latest
```

#### Step 3: Deploy to Kubernetes

```bash
kubectl apply -f app-deployment.yaml
kubectl apply -f runner-deployment.yaml
```

### Option 3: Serverless Deployment

For workloads with variable demand, consider serverless options:

1. **AWS ECS with Fargate**: Deploy both application and runner containers with auto-scaling
2. **Google Cloud Run**: Deploy stateless containers with auto-scaling

## Scaling Considerations

### Horizontal Scaling

Both the main application and runner instances are designed to be horizontally scalable. You can run multiple instances to handle increased load.

For Kubernetes:
```bash
# Scale the main application
kubectl scale deployment mintflow-app --replicas=3

# Scale the runners
kubectl scale deployment mintflow-runner --replicas=5
```

### Tenant Isolation

The runner instances are designed to process jobs from tenant-specific queues. You can:

1. Deploy separate runner instances for high-priority tenants
2. Configure different concurrency levels per tenant

## Monitoring and Logging

1. **Logs**: Both runners use structured logging. Collect these logs with a solution like ELK Stack or Datadog.
2. **Metrics**: Monitor Redis queue lengths to detect backpressure.
3. **Health Checks**: Implement health check endpoints in the runners.

## Environment Variables

### Environment Variables

| Variable | Description | Production Value |
|----------|-------------|-----------------|
| REDIS_HOST | Redis/KeyDB host | 192.168.88.143 |
| REDIS_PORT | Redis/KeyDB port | 6379 |
| REDIS_CONN | Redis/KeyDB connection string | redis://192.168.88.143:6379 |
| MONGO_URI | MongoDB connection string | mongodb://appmint_admin:fBIwmIfEvpU@192.168.88.140:27017,192.168.88.141:27017/admin?authSource=admin&replicaSet=rs0 |
| RUNNER_MODE | Enable/disable runner mode | true (for runner instances) |
| TENANTS | Comma-separated list of tenant IDs | tenantA,tenantB |

## Security Considerations

1. **Network Security**: Runner instances should only be accessible from within your cluster/VPC
2. **Tenant Isolation**: Ensure proper isolation between tenant data
3. **Secrets Management**: Use Kubernetes Secrets or a vault solution for sensitive configuration

## Conclusion

MintFlow can be deployed with dedicated runner instances (which are just the main server with communication services disabled) that connect to a shared Redis instance for job queues. By following this guide, you can deploy and scale both the main application and runner instances to meet your workload requirements.
