# Langflow Integration with MintFlow Python Runner

## Overview

This document outlines the integration strategy for incorporating Langflow's vector store capabilities into MintFlow using the Python runner. The goal is to enable AI-heavy tasks in MintFlow by leveraging Langflow's extensive LangChain component library.

## Current Implementation

### MintFlow Python Runner

MintFlow currently has two Python runner implementations:

1. **app.py**: A basic Python runner that processes tasks from Redis queues and executes predefined Python functions.
2. **pure_runner.py**: A more flexible runner that can execute arbitrary Python code sent from the flow engine.

Both runners follow a similar pattern:
- Poll Redis queues for tasks
- Execute Python code
- Return results to the flow engine via HTTP

### Langflow Vector Store Components

Langflow has a comprehensive implementation of vector store components:

1. **Base Component Structure**:
   - `LCVectorStoreComponent`: Abstract base class for all vector store components
   - Provides common functionality like document searching, caching, and result formatting

2. **Vector Store Implementations**:
   - Multiple vector store implementations (Chroma, FAISS, Pinecone, etc.)
   - Each implementation extends the base component and implements the `build_vector_store` method

3. **Component Features**:
   - Document ingestion
   - Vector search
   - Similarity and MMR search types
   - Result formatting

### MintFlow LangChain Plugin

We've implemented vector store factories in the MintFlow LangChain plugin:

1. **Component Registry**:
   - Singleton registry for managing component factories
   - Allows dynamic registration and retrieval of components

2. **Vector Store Factories**:
   - `ChromaFactory`: Creates Chroma vector stores
   - `FAISSFactory`: Creates FAISS vector stores
   - `PineconeFactory`: Creates Pinecone vector stores

3. **RAG Plugin**:
   - Enhanced with vector store creation capabilities
   - Supports multiple vector store types
   - Provides fallback to Redis for storage

## Integration Strategy

### 1. Enhanced Python Runner

Create an enhanced Python runner that can:

1. **Load Langflow Components**:
   - Import and initialize Langflow vector store components
   - Support dynamic component loading based on task requirements

2. **Execute LangChain Tasks**:
   - Process vector store operations (creation, search, etc.)
   - Handle document processing and embedding generation
   - Support RAG workflows

3. **Integrate with MintFlow Flow Engine**:
   - Receive tasks from Redis queues
   - Return results to the flow engine
   - Handle errors and exceptions

### 2. Implementation Plan

1. **Create a new Python runner file**:
   ```python
   # langflow_runner.py
   import os
   import time
   import json
   import redis
   import requests
   import logging
   import threading
   
   # Import Langflow components
   from langflow.components.vectorstores import (
       ChromaVectorStoreComponent,
       FAISSVectorStoreComponent,
       PineconeVectorStoreComponent
   )
   
   # Setup logging and Redis connection
   # ...
   
   # Component registry
   component_registry = {}
   
   def register_components():
       """Register all available Langflow components."""
       component_registry["chroma"] = ChromaVectorStoreComponent
       component_registry["faiss"] = FAISSVectorStoreComponent
       component_registry["pinecone"] = PineconeVectorStoreComponent
       # Add more components as needed
   
   def process_langflow_task(tenant_id, task_data):
       """Process a Langflow task."""
       flow_id = task_data.get("flowId")
       node_id = task_data.get("nodeId")
       component_type = task_data.get("componentType")
       component_config = task_data.get("config", {})
       
       try:
           # Get component class from registry
           component_class = component_registry.get(component_type)
           if not component_class:
               raise ValueError(f"Unknown component type: {component_type}")
           
           # Initialize component with config
           component = component_class(**component_config)
           
           # Execute component method
           method_name = task_data.get("method", "build_vector_store")
           method = getattr(component, method_name)
           result = method()
           
           # Return result to flow engine
           notify_completion(tenant_id, flow_id, node_id, result)
       except Exception as e:
           logging.error(f"Error in Langflow task: {str(e)}")
           notify_failure(tenant_id, flow_id, node_id, str(e))
   
   # Main worker loop
   # ...
   ```

2. **Update Dockerfile**:
   ```dockerfile
   FROM python:3.10-slim
   
   WORKDIR /app
   
   # Install Redis client and requests
   RUN pip install redis requests
   
   # Install Langflow and its dependencies
   RUN pip install langflow langchain chromadb faiss-cpu pinecone-client
   
   # Copy runner code
   COPY langflow_runner.py .
   
   # Run the runner
   CMD ["python", "langflow_runner.py"]
   ```

3. **Update docker-compose.yml**:
   ```yaml
   services:
     # ...
     langflow-runner:
       build:
         context: ./packages/python_runner
         dockerfile: Dockerfile.langflow
       environment:
         - REDIS_HOST=redis
         - REDIS_PORT=6379
         - FLOWENGINE_URL=http://server:3000/flowengine
         - TENANTS=tenantA,tenantB
       depends_on:
         - redis
         - server
   ```

### 3. MintFlow Plugin Updates

1. **Create a LangflowPlugin**:
   - Define actions that map to Langflow components
   - Implement input/output schema for each action
   - Handle communication with the Python runner

2. **Update RAGPlugin**:
   - Add support for Langflow vector stores
   - Implement methods to convert between MintFlow and Langflow data formats

## Benefits

1. **Leverage Existing Code**:
   - Reuse Langflow's extensive component library
   - Avoid reimplementing vector store integrations

2. **Flexibility**:
   - Support multiple vector store types
   - Easy to add new components as needed

3. **Performance**:
   - Offload AI-heavy tasks to Python
   - Utilize optimized Python libraries for vector operations

## Challenges and Considerations

1. **Data Transfer**:
   - Efficient serialization/deserialization of data between Node.js and Python
   - Handling large document collections

2. **Error Handling**:
   - Robust error reporting from Python to Node.js
   - Graceful failure handling

3. **Security**:
   - Sandboxing Python code execution
   - Limiting resource usage

4. **Deployment**:
   - Managing Python dependencies
   - Container orchestration

## Next Steps

1. Implement the enhanced Python runner
2. Create test cases for vector store operations
3. Integrate with the MintFlow flow engine
4. Add support for additional Langflow components
5. Document the integration for users
