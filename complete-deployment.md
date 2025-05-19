# Complete MintFlow Deployment Guide

This guide provides a comprehensive approach to deploying the entire MintFlow platform, including all infrastructure services and runner instances.

## Overview

MintFlow consists of several components that work together:

1. **Infrastructure Services**:
   - KeyDB/Redis: For job queues and caching
   - PostgreSQL: Primary database
   - MongoDB: Document database
   - Weaviate/QDrant: Vector databases for AI features

2. **Application Components**:
   - Main Server: Handles API requests, WebSocket connections, and UI serving
   - Runner Instances: Additional instances of the main server with communication services disabled, focused solely on executing workflow tasks

3. **Main Application**:
   - Core MintFlow server
   - Web UI

## Deployment Options

### Option 1: All-in-One Docker Compose Deployment

This approach deploys all components together using a single docker-compose file.

#### Step 1: Create a Complete Docker Compose File

Create a file named `docker-compose-complete.yml`:

```yaml
version: '3.8'

services:
  # Infrastructure Services
  keydb:
    image: eqalpha/keydb
    container_name: keydb
    restart: always
    ports:
      - "6379:6379"
    networks:
      - mintflow-network
    volumes:
      - keydb_data:/data

  postgres:
    image: postgres
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: mintflow
    ports:
      - "5432:5432"
    networks:
      - mintflow-network
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo
    container_name: mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    ports:
      - "27017:27017"
    networks:
      - mintflow-network
    volumes:
      - mongo_data:/data/db

  weaviate:
    image: semitechnologies/weaviate
    container_name: weaviate
    restart: always
    environment:
      QUERY_DEFAULTS_LIMIT: 50
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: "true"
      PERSISTENCE_DATA_PATH: "/var/lib/weaviate"
      DEFAULT_VECTORIZER_MODULE: "text2vec-openai"
      ENABLE_MODULES: "text2vec-openai"
    ports:
      - "8080:8080"
    networks:
      - mintflow-network

  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant
    ports:
      - "6333:6333"
    networks:
      - mintflow-network      
    volumes:
      - qdrant_data:/qdrant/storage

  # Main application server
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mintflow-app
    restart: always
    depends_on:
      - keydb
      - postgres
      - mongodb
      - weaviate
      - qdrant
    environment:
      - REDIS_HOST=keydb
      - REDIS_PORT=6379
      - DATABASE_URL=postgres://admin:admin@postgres:5432/mintflow
      - MONGO_URI=mongodb://admin:admin@mongodb:27017
      - WEAVIATE_URL=http://weaviate:8080
      - QDRANT_URL=http://qdrant:6333
      - RUNNER_MODE=false
    ports:
      - "3600:3600"
    networks:
      - mintflow-network

  # Runner instance (same codebase, different configuration)
  runner:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mintflow-runner
    restart: always
    depends_on:
      - keydb
      - postgres
      - mongodb
      - weaviate
      - qdrant
    environment:
      - REDIS_HOST=keydb
      - REDIS_PORT=6379
      - DATABASE_URL=postgres://admin:admin@postgres:5432/mintflow
      - MONGO_URI=mongodb://admin:admin@mongodb:27017
      - WEAVIATE_URL=http://weaviate:8080
      - QDRANT_URL=http://qdrant:6333
      - RUNNER_MODE=true
      - TENANTS=tenantA,tenantB
    networks:
      - mintflow-network

networks:
  mintflow-network:
    driver: bridge

volumes:
  keydb_data:
  postgres_data:
  mongo_data:
  qdrant_data:
```


#### Step 3: Deploy Everything

```bash
docker-compose -f docker-compose-complete.yml up -d
```

This will start all services, including the infrastructure, main application, and both runners.

### Option 2: Modular Deployment

For more flexibility, you can deploy components separately:

1. **Infrastructure Services**:
   ```bash
   docker-compose up -d
   ```

2. **Main Application**:
   ```bash
   docker build -t mintflow-app .
   docker run -d --name mintflow-app \
     --network mintflow-network \
     -p 3600:3600 \
     -e DATABASE_URL=postgres://admin:admin@postgres:5432/mintflow \
     -e MONGO_URI=mongodb://admin:admin@mongodb:27017 \
     -e WEAVIATE_URL=http://weaviate:8080 \
     -e KEYDB_URL=redis://keydb:6379 \
     mintflow-app
   ```

3. **Runner Instance**:
   ```bash
   docker run -d --name mintflow-runner \
     --network mintflow-network \
     -e REDIS_HOST=keydb \
     -e REDIS_PORT=6379 \
     -e DATABASE_URL=postgres://admin:admin@postgres:5432/mintflow \
     -e MONGO_URI=mongodb://admin:admin@mongodb:27017 \
     -e WEAVIATE_URL=http://weaviate:8080 \
     -e RUNNER_MODE=true \
     -e TENANTS=tenantA,tenantB \
     mintflow-app
   ```


## Kubernetes Deployment

For production environments, Kubernetes provides better scalability and management.

### Step 1: Create Kubernetes Manifests

Create the following Kubernetes manifest files:

**infrastructure.yaml**:
```yaml
# KeyDB StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: keydb
spec:
  serviceName: keydb
  replicas: 1
  selector:
    matchLabels:
      app: keydb
  template:
    metadata:
      labels:
        app: keydb
    spec:
      containers:
      - name: keydb
        image: eqalpha/keydb
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: keydb-data
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: keydb-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi

# KeyDB Service
apiVersion: v1
kind: Service
metadata:
  name: keydb-service
spec:
  selector:
    app: keydb
  ports:
  - port: 6379
    targetPort: 6379

# Similar definitions for PostgreSQL, MongoDB, Weaviate, and QDrant
# ...
```

**app.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mintflow-app
spec:
  replicas: 2
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
        image: your-registry/mintflow-app:latest
        ports:
        - containerPort: 3600
        env:
        - name: DATABASE_URL
          value: postgres://admin:admin@postgres-service:5432/mintflow
        - name: MONGO_URI
          value: mongodb://admin:admin@mongodb-service:27017
        - name: WEAVIATE_URL
          value: http://weaviate-service:8080
        - name: KEYDB_URL
          value: redis://keydb-service:6379
        - name: QDRANT_URL
          value: http://qdrant-service:6333

# Service for the app
apiVersion: v1
kind: Service
metadata:
  name: mintflow-app-service
spec:
  selector:
    app: mintflow-app
  ports:
  - port: 3600
    targetPort: 3600
  type: ClusterIP
```

**runner.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mintflow-runner
spec:
  replicas: 3
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
          value: keydb-service
        - name: REDIS_PORT
          value: "6379"
        - name: DATABASE_URL
          value: postgres://admin:admin@postgres-service:5432/mintflow
        - name: MONGO_URI
          value: mongodb://admin:admin@mongodb-service:27017
        - name: WEAVIATE_URL
          value: http://weaviate-service:8080
        - name: RUNNER_MODE
          value: "true"
        - name: TENANTS
          value: tenantA,tenantB
```


### Step 2: Deploy to Kubernetes

```bash
kubectl apply -f infrastructure.yaml
kubectl apply -f app.yaml
kubectl apply -f runner.yaml
```

## Scaling Considerations

### Horizontal Scaling

Both runners are designed to be horizontally scalable. You can run multiple instances of each runner to handle increased load.

For Docker Compose, you can use the `--scale` option:
```bash
docker-compose -f docker-compose-complete.yml up -d --scale runner=3
```

For Kubernetes:
```bash
kubectl scale deployment mintflow-runner --replicas=5
```

### Tenant Isolation

For multi-tenant deployments, consider:

1. **Dedicated Runners**: Deploy separate runner instances for high-priority tenants
2. **Resource Quotas**: Allocate resources based on tenant priority
3. **Queue Prioritization**: Implement priority queues in Redis/KeyDB

## Monitoring and Management

### Health Checks

Add health check endpoints to your runners and configure Docker or Kubernetes to use them:

```yaml
# In Kubernetes deployment
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
```

### Logging

Centralize logs using a solution like ELK Stack or Datadog:

1. **Docker**: Use the Docker logging driver
   ```bash
   docker run --log-driver=fluentd --log-opt fluentd-address=localhost:24224
   ```

2. **Kubernetes**: Deploy a logging agent as a DaemonSet

### Metrics

Monitor key metrics:

1. **Queue Lengths**: Track the number of jobs in each queue
2. **Processing Times**: Monitor how long jobs take to process
3. **Error Rates**: Track failed jobs and error types

## Security Considerations

1. **Network Security**: 
   - Use network policies to restrict communication between services
   - Implement TLS for all service-to-service communication

2. **Secrets Management**:
   - Use Docker secrets or Kubernetes secrets for sensitive information
   - Consider a dedicated secrets management solution like HashiCorp Vault

3. **Code Execution**:
   - Implement proper sandboxing for code execution in runners
   - Regularly update dependencies to patch security vulnerabilities

## Backup and Recovery

1. **Database Backups**:
   - Set up regular backups for PostgreSQL and MongoDB
   - Test restoration procedures periodically

2. **Configuration Backups**:
   - Version control your Docker Compose and Kubernetes manifests
   - Document all environment-specific configurations

## Conclusion

This guide provides a comprehensive approach to deploying the MintFlow platform, with a focus on the runners. By following these instructions, you can set up a scalable, reliable, and secure deployment that meets your specific requirements.

For more detailed information about deploying MintFlow, refer to the deployment guide:
- [MintFlow Deployment Guide](deployment-guide.md)
