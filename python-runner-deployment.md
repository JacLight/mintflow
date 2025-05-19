# Python Runner Deployment Guide for MintFlow

This guide provides detailed instructions for deploying the MintFlow Python Runner, which is responsible for executing Python-based tasks in the MintFlow workflow automation platform.

## Overview

The Python Runner is a specialized service that:
- Consumes jobs from Redis queues (one queue per tenant)
- Executes Python code in a controlled environment
- Reports results back to the Flow Engine

## Prerequisites

- Docker installed (for containerized deployment)
- Access to a Redis/KeyDB instance
- The MintFlow Flow Engine running and accessible

## Deployment Options

### Option 1: Direct Deployment

For development or simple deployments, you can run the Python Runner directly:

```bash
# Clone the repository if you haven't already
git clone https://github.com/your-org/mintflow.git
cd mintflow

# Install dependencies
cd packages/python_runner
pip install -r requirements.txt

# Run the runner
REDIS_HOST=localhost REDIS_PORT=6379 FLOWENGINE_URL=http://localhost:3600/flowengine TENANTS=tenantA,tenantB python app.py
```

### Option 2: Docker Deployment

For more robust deployments, use Docker:

```bash
# Build the Docker image
cd mintflow
docker build -t mintflow-python-runner ./packages/python_runner

# Run the container
docker run -d --name python-runner \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e FLOWENGINE_URL=http://host.docker.internal:3600/flowengine \
  -e TENANTS=tenantA,tenantB \
  mintflow-python-runner
```

### Option 3: Docker Compose

For integration with other services, use Docker Compose:

```yaml
# docker-compose-python-runner.yml
version: '3.8'

services:
  python-runner:
    build:
      context: ./packages/python_runner
      dockerfile: Dockerfile
    container_name: python-runner
    restart: always
    environment:
      - REDIS_HOST=keydb
      - REDIS_PORT=6379
      - FLOWENGINE_URL=http://app:3600/flowengine
      - TENANTS=tenantA,tenantB
    networks:
      - mintflow-network

networks:
  mintflow-network:
    external: true
```

Run with:
```bash
docker-compose -f docker-compose-python-runner.yml up -d
```

### Option 4: Kubernetes Deployment

For production environments, deploy to Kubernetes:

1. Create a ConfigMap for configuration:

```yaml
# python-runner-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: python-runner-config
data:
  REDIS_HOST: "keydb-service"
  REDIS_PORT: "6379"
  FLOWENGINE_URL: "http://mintflow-app-service:3600/flowengine"
  TENANTS: "tenantA,tenantB"
```

2. Create a Deployment:

```yaml
# python-runner-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-runner
spec:
  replicas: 2
  selector:
    matchLabels:
      app: python-runner
  template:
    metadata:
      labels:
        app: python-runner
    spec:
      containers:
      - name: python-runner
        image: your-registry/mintflow-python-runner:latest
        envFrom:
        - configMapRef:
            name: python-runner-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

3. Apply the configuration:

```bash
kubectl apply -f python-runner-configmap.yaml
kubectl apply -f python-runner-deployment.yaml
```

## Customizing the Python Runner

### Adding Custom Python Tasks

The Python Runner executes tasks defined in the `python_logic` function in `app.py`. To add custom tasks:

1. Edit the `python_logic` function:

```python
def python_logic(taskName, taskInput):
    """
    Python tasks implementation.
    """
    if taskName == "multiplyByTwo":
        if not isinstance(taskInput, (int, float)):
            raise ValueError("Input must be a number")
        return {"result": taskInput * 2}

    elif taskName == "uppercaseString":
        if not isinstance(taskInput, str):
            raise ValueError("Input must be a string")
        return {"result": taskInput.upper()}
        
    # Add your custom task here
    elif taskName == "myCustomTask":
        # Implement your custom logic
        return {"result": "Custom task result"}

    else:
        raise ValueError(f"Unknown Python taskName: {taskName}")
```

2. Rebuild the Docker image if using containerized deployment.

### Integrating with AI/ML Libraries

For AI/ML tasks, you can integrate libraries like TensorFlow, PyTorch, or scikit-learn:

1. Add the libraries to `requirements.txt`:

```
redis==4.5.1
requests==2.28.2
tensorflow==2.12.0
```

2. Update the Dockerfile to include necessary dependencies:

```dockerfile
FROM python:3.10-slim

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY *.py /app/

CMD ["python", "app.py"]
```

3. Implement ML tasks in the `python_logic` function.

## Scaling the Python Runner

### Horizontal Scaling

To handle increased load, deploy multiple instances of the Python Runner:

- **Docker Compose**: Increase the `replicas` parameter
- **Kubernetes**: Scale the deployment with `kubectl scale deployment python-runner --replicas=5`

### Vertical Scaling

For memory-intensive ML tasks, increase the resources allocated to each runner:

- **Docker**: Use the `--memory` and `--cpus` flags
- **Kubernetes**: Adjust the resource requests and limits in the deployment YAML

## Monitoring and Troubleshooting

### Logs

The Python Runner uses Python's logging module. To view logs:

- **Direct deployment**: Logs are printed to stdout
- **Docker**: `docker logs python-runner`
- **Kubernetes**: `kubectl logs deployment/python-runner`

### Common Issues

1. **Connection to Redis fails**:
   - Verify Redis host and port are correct
   - Check network connectivity between the runner and Redis

2. **Tasks not being processed**:
   - Verify queue names match the expected format (`pythonQueue_{tenantId}`)
   - Check if jobs are being pushed to the queues

3. **Flow Engine communication fails**:
   - Verify the FLOWENGINE_URL is correct and accessible
   - Check network connectivity between the runner and Flow Engine

## Security Considerations

1. **Code Execution**: The Python Runner executes Python code, which can be a security risk. Implement proper sandboxing and input validation.

2. **Tenant Isolation**: Ensure that tasks from different tenants cannot access each other's data.

3. **Secrets Management**: Use environment variables or a secrets management solution for sensitive configuration.

## Conclusion

The Python Runner is a critical component of the MintFlow platform, enabling Python-based tasks in workflows. By following this guide, you can deploy, customize, and scale the Python Runner to meet your specific requirements.
