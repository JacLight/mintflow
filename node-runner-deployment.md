# Node Runner Deployment Guide for MintFlow

This guide provides detailed instructions for deploying the MintFlow Node Runner, which is responsible for executing JavaScript/TypeScript-based tasks in the MintFlow workflow automation platform.

## Overview

The Node Runner is a specialized service that:
- Consumes jobs from Redis/KeyDB queues (one queue per tenant)
- Executes JavaScript/TypeScript code in a sandboxed environment
- Reports results back to the Flow Engine

## Prerequisites

- Node.js 18 or later installed (for direct deployment)
- Docker installed (for containerized deployment)
- Access to a Redis/KeyDB instance
- The MintFlow Flow Engine running and accessible

## Deployment Options

### Option 1: Direct Deployment

For development or simple deployments, you can run the Node Runner directly:

```bash
# Clone the repository if you haven't already
git clone https://github.com/your-org/mintflow.git
cd mintflow

# Install dependencies
cd packages/node_runner
npm install

# Build TypeScript
npm run build

# Run the runner
REDIS_HOST=localhost REDIS_PORT=6379 FLOWENGINE_URL=http://localhost:3600/flowengine TENANTS=tenantA,tenantB npm start
```

### Option 2: Docker Deployment

For more robust deployments, use Docker:

```bash
# Create a Dockerfile if one doesn't exist
cat > packages/node_runner/Dockerfile << 'EOF'
FROM node:18

WORKDIR /app

# Copy package files
COPY packages/node_runner/package*.json ./
COPY packages/common/ ../common/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/node_runner/src/ ./src/

# Build TypeScript
RUN npm run build

# Start the runner
CMD ["npm", "start"]
EOF

# Build the Docker image
cd mintflow
docker build -t mintflow-node-runner -f packages/node_runner/Dockerfile .

# Run the container
docker run -d --name node-runner \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e FLOWENGINE_URL=http://host.docker.internal:3600/flowengine \
  -e TENANTS=tenantA,tenantB \
  mintflow-node-runner
```

### Option 3: Docker Compose

For integration with other services, use Docker Compose:

```yaml
# docker-compose-node-runner.yml
version: '3.8'

services:
  node-runner:
    build:
      context: .
      dockerfile: packages/node_runner/Dockerfile
    container_name: node-runner
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
docker-compose -f docker-compose-node-runner.yml up -d
```

### Option 4: Kubernetes Deployment

For production environments, deploy to Kubernetes:

1. Create a ConfigMap for configuration:

```yaml
# node-runner-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: node-runner-config
data:
  REDIS_HOST: "keydb-service"
  REDIS_PORT: "6379"
  FLOWENGINE_URL: "http://mintflow-app-service:3600/flowengine"
  TENANTS: "tenantA,tenantB"
```

2. Create a Deployment:

```yaml
# node-runner-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-runner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-runner
  template:
    metadata:
      labels:
        app: node-runner
    spec:
      containers:
      - name: node-runner
        image: your-registry/mintflow-node-runner:latest
        envFrom:
        - configMapRef:
            name: node-runner-config
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
kubectl apply -f node-runner-configmap.yaml
kubectl apply -f node-runner-deployment.yaml
```

## Customizing the Node Runner

### Understanding the Node Runner Architecture

The Node Runner consists of several key components:

1. **worker.ts**: The main entry point that sets up Bull queues and processes jobs
2. **handleNodeJob.ts**: Processes individual node jobs
3. **sandbox.ts**: Provides a sandboxed environment for executing JavaScript code
4. **config.ts**: Loads configuration from environment variables

### Adding Custom Node Types

To add custom node types to the Node Runner:

1. Edit the `handleNodeJob.ts` file to include your custom node logic:

```typescript
// Example of adding a custom node type
export async function handleNodeJob({ nodeId, input }) {
  // Existing node types...
  
  // Custom node type
  if (nodeId === 'customNodeType') {
    // Implement your custom logic
    return { result: 'Custom node result' };
  }
  
  throw new Error(`Unknown node type: ${nodeId}`);
}
```

2. Rebuild the application if running directly, or rebuild the Docker image if using containerized deployment.

### Enhancing Sandbox Security

The Node Runner uses `isolated-vm` to provide a sandboxed environment for executing JavaScript code. To enhance security:

1. Update the `sandbox.ts` file to add additional restrictions:

```typescript
// Example of enhancing sandbox security
import ivm from 'isolated-vm';

export async function executeSandboxed(code, context) {
  const isolate = new ivm.Isolate({ memoryLimit: 128 });
  const context = await isolate.createContext();
  
  // Add more restrictions here
  // ...
  
  // Execute the code
  const result = await context.eval(code);
  return result;
}
```

## Scaling the Node Runner

### Horizontal Scaling

To handle increased load, deploy multiple instances of the Node Runner:

- **Docker Compose**: Increase the `replicas` parameter
- **Kubernetes**: Scale the deployment with `kubectl scale deployment node-runner --replicas=5`

### Queue Concurrency

The Node Runner processes multiple jobs concurrently from each queue. To adjust concurrency:

1. Edit the `worker.ts` file:

```typescript
// Change the concurrency parameter
queue.process(10, async (job) => {  // Increased from 5 to 10
  // Job processing logic
});
```

2. Or set it via environment variable:

```bash
NODE_CONCURRENCY=10 npm start
```

## Monitoring and Troubleshooting

### Logs

The Node Runner uses Winston for logging. To view logs:

- **Direct deployment**: Logs are printed to stdout
- **Docker**: `docker logs node-runner`
- **Kubernetes**: `kubectl logs deployment/node-runner`

### Bull Dashboard (Optional)

For monitoring Bull queues, you can add Bull Dashboard:

1. Add the dependency:

```bash
npm install bull-board
```

2. Update the `worker.ts` file:

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
const app = express();

// Add queues to Bull Board
const queues = TENANTS.map(tenantId => {
  const queueName = `queue_${tenantId}`;
  const queue = new Bull(queueName, { redis: { host: CONFIG.REDIS_HOST, port: CONFIG.REDIS_PORT } });
  return new BullAdapter(queue);
});

createBullBoard({ queues, serverAdapter });
serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

app.listen(3001, () => {
  console.log('Bull Board running on port 3001');
});
```

### Common Issues

1. **Connection to Redis fails**:
   - Verify Redis host and port are correct
   - Check network connectivity between the runner and Redis

2. **Tasks not being processed**:
   - Verify queue names match the expected format (`queue_{tenantId}`)
   - Check if jobs are being pushed to the queues

3. **Flow Engine communication fails**:
   - Verify the FLOWENGINE_URL is correct and accessible
   - Check network connectivity between the runner and Flow Engine

## Security Considerations

1. **Code Execution**: The Node Runner executes JavaScript code, which can be a security risk. Use the sandboxing capabilities of `isolated-vm` to restrict access to system resources.

2. **Tenant Isolation**: Ensure that tasks from different tenants cannot access each other's data.

3. **Secrets Management**: Use environment variables or a secrets management solution for sensitive configuration.

## Performance Tuning

1. **Memory Allocation**: Adjust the memory limits for the Node.js process and for individual isolates:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

2. **CPU Allocation**: For CPU-intensive tasks, consider adjusting the number of concurrent jobs to match available CPU cores.

## Conclusion

The Node Runner is a critical component of the MintFlow platform, enabling JavaScript/TypeScript-based tasks in workflows. By following this guide, you can deploy, customize, and scale the Node Runner to meet your specific requirements.
