#!/usr/bin/env python3
"""
Langflow Runner for MintFlow

This script handles the communication between MintFlow and Langflow.
It listens for tasks from MintFlow, executes them using Langflow,
and returns the results back to MintFlow.
"""

import os
import json
import time
import redis
import requests
import logging
from typing import Dict, Any, List, Optional, Union
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("langflow_runner")

# Get configuration from environment variables
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
FLOWENGINE_URL = os.environ.get("FLOWENGINE_URL", "http://localhost:3000/flowengine")
TENANTS = os.environ.get("TENANTS", "default").split(",")

# Connect to Redis
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

# Import Langflow components
try:
    from langchain.vectorstores import Chroma, FAISS, Pinecone, Qdrant, Weaviate, Redis as RedisVectorStore, Milvus
    from langchain.document_loaders import (
        PyPDFLoader, Docx2txtLoader, TextLoader, CSVLoader, JSONLoader, 
        WebBaseLoader, GitHubIssueLoader, MongoDBLoader
    )
    from langchain.text_splitter import (
        CharacterTextSplitter, TokenTextSplitter, RecursiveCharacterTextSplitter, MarkdownTextSplitter
    )
    from langchain.embeddings import OpenAIEmbeddings, HuggingFaceEmbeddings, CohereEmbeddings
    from langchain.chat_models import ChatOpenAI, ChatAnthropic, ChatGoogleGenerativeAI
    from langchain.prompts import PromptTemplate, ChatPromptTemplate, FewShotPromptTemplate
    from langchain.output_parsers import StructuredOutputParser, JSONOutputParser
    from langchain.chains import LLMChain, SequentialChain, TransformChain, RetrievalQA, ConversationalRetrievalChain
    from langchain.agents import AgentExecutor, create_react_agent, create_openai_functions_agent, create_plan_and_execute_agent
    from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory, VectorStoreRetrieverMemory
    from langchain.schema import Document
    from langgraph.graph import StateGraph
    logger.info("Successfully imported Langflow components")
except ImportError as e:
    logger.error(f"Failed to import Langflow components: {e}")
    raise

class LangflowRunner:
    """
    Runner for Langflow tasks
    """
    
    def __init__(self):
        """
        Initialize the runner
        """
        self.vector_stores = {}
        self.graphs = {}
        self.agents = {}
        self.documents = {}
        
    def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task from MintFlow
        
        Args:
            task: The task to process
            
        Returns:
            The result of the task
        """
        try:
            component_type = task.get("componentType")
            method = task.get("method")
            config = task.get("config", {})
            input_data = task.get("input", {})
            
            logger.info(f"Processing task: {component_type}.{method}")
            
            # Vector store operations
            if component_type in ["chroma", "faiss", "pinecone", "qdrant", "weaviate", "redis", "milvus"]:
                if method == "create_vector_store":
                    return self.create_vector_store(component_type, config, input_data)
                elif method == "add_documents":
                    return self.add_documents(config.get("vectorStoreId"), input_data)
                elif method == "search_documents":
                    return self.search_documents(config.get("vectorStoreId"), input_data)
                elif method == "delete_documents":
                    return self.delete_documents(config.get("vectorStoreId"), input_data)
            
            # LangGraph operations
            elif component_type == "langgraph":
                if method == "create_graph":
                    return self.create_graph(config, input_data)
                elif method == "run_graph":
                    return self.run_graph(config.get("graphId"), input_data, config)
                elif method == "update_graph":
                    return self.update_graph(config.get("graphId"), input_data)
            
            # Agent operations
            elif component_type == "agent":
                if method == "create_agent":
                    return self.create_agent(config, input_data)
                elif method == "run_agent":
                    return self.run_agent(config.get("agentId"), input_data)
                elif method == "add_tools":
                    return self.add_tools(config.get("agentId"), input_data)
            
            # Document operations
            elif component_type == "document":
                if method == "load_document":
                    return self.load_document(config.get("type"), input_data)
                elif method == "split_document":
                    return self.split_document(input_data.get("document"), config)
                elif method == "transform_document":
                    return self.transform_document(input_data.get("document"), config.get("transformation"), input_data.get("options", {}))
            
            logger.error(f"Unknown task: {component_type}.{method}")
            return {"error": f"Unknown task: {component_type}.{method}"}
        
        except Exception as e:
            logger.error(f"Error processing task: {e}")
            logger.error(traceback.format_exc())
            return {"error": str(e)}
    
    def create_vector_store(self, store_type: str, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a vector store
        
        Args:
            store_type: The type of vector store to create
            config: The configuration for the vector store
            input_data: The input data for the vector store
            
        Returns:
            The created vector store
        """
        logger.info(f"Creating vector store of type {store_type}")
        
        # Convert MintFlow config to Langflow config
        langflow_config = self._convert_config(config)
        
        # Create the vector store based on the type
        if store_type == "chroma":
            from langchain.vectorstores import Chroma
            from langchain.embeddings import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings()
            vector_store = Chroma(
                collection_name=langflow_config.get("collection_name", "default"),
                embedding_function=embeddings,
                persist_directory=langflow_config.get("persist_directory", "./chroma_db")
            )
        
        elif store_type == "faiss":
            from langchain.vectorstores import FAISS
            from langchain.embeddings import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings()
            vector_store = FAISS(
                embedding_function=embeddings
            )
        
        elif store_type == "pinecone":
            from langchain.vectorstores import Pinecone
            from langchain.embeddings import OpenAIEmbeddings
            import pinecone
            
            pinecone.init(
                api_key=langflow_config.get("api_key"),
                environment=langflow_config.get("environment")
            )
            
            embeddings = OpenAIEmbeddings()
            vector_store = Pinecone(
                index=pinecone.Index(langflow_config.get("index_name")),
                embedding_function=embeddings,
                text_key=langflow_config.get("text_key", "text")
            )
        
        elif store_type == "qdrant":
            from langchain.vectorstores import Qdrant
            from langchain.embeddings import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings()
            vector_store = Qdrant(
                client=langflow_config.get("client"),
                collection_name=langflow_config.get("collection_name", "default"),
                embedding_function=embeddings
            )
        
        elif store_type == "weaviate":
            from langchain.vectorstores import Weaviate
            from langchain.embeddings import OpenAIEmbeddings
            import weaviate
            
            client = weaviate.Client(
                url=langflow_config.get("url")
            )
            
            embeddings = OpenAIEmbeddings()
            vector_store = Weaviate(
                client=client,
                index_name=langflow_config.get("index_name", "Document"),
                text_key=langflow_config.get("text_key", "content"),
                embedding=embeddings
            )
        
        # Generate a unique ID for the vector store
        import uuid
        vector_store_id = str(uuid.uuid4())
        
        # Store the vector store
        self.vector_stores[vector_store_id] = vector_store
        
        return {
            "id": vector_store_id,
            "type": store_type,
            "namespace": langflow_config.get("collection_name", "default"),
            "documentCount": 0,
            "dimensions": 1536  # Default for OpenAI embeddings
        }
    
    def add_documents(self, vector_store_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add documents to a vector store
        
        Args:
            vector_store_id: The ID of the vector store
            input_data: The input data containing the documents
            
        Returns:
            The result of adding the documents
        """
        logger.info(f"Adding documents to vector store {vector_store_id}")
        
        # Get the vector store
        vector_store = self.vector_stores.get(vector_store_id)
        if not vector_store:
            raise ValueError(f"Vector store {vector_store_id} not found")
        
        # Get the documents
        documents = input_data.get("documents", [])
        embeddings = input_data.get("embeddings")
        
        # Convert MintFlow documents to Langflow documents
        langflow_documents = []
        for doc in documents:
            langflow_documents.append(
                Document(
                    page_content=doc.get("content"),
                    metadata=doc.get("metadata", {})
                )
            )
        
        # Add the documents to the vector store
        if embeddings:
            # If embeddings are provided, use them
            vector_store.add_embeddings(
                text_embeddings=list(zip([doc.page_content for doc in langflow_documents], embeddings)),
                metadatas=[doc.metadata for doc in langflow_documents]
            )
        else:
            # Otherwise, let the vector store compute the embeddings
            vector_store.add_documents(langflow_documents)
        
        # Generate IDs for the documents
        import uuid
        document_ids = [str(uuid.uuid4()) for _ in documents]
        
        return {
            "count": len(documents),
            "ids": document_ids
        }
    
    def search_documents(self, vector_store_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Search for documents in a vector store
        
        Args:
            vector_store_id: The ID of the vector store
            input_data: The input data containing the query
            
        Returns:
            The search results
        """
        logger.info(f"Searching documents in vector store {vector_store_id}")
        
        # Get the vector store
        vector_store = self.vector_stores.get(vector_store_id)
        if not vector_store:
            raise ValueError(f"Vector store {vector_store_id} not found")
        
        # Get the query
        query = input_data.get("query")
        k = input_data.get("k", 4)
        search_type = input_data.get("searchType", "similarity")
        filter_criteria = input_data.get("filter")
        
        # Search the vector store
        if search_type == "similarity":
            results = vector_store.similarity_search(
                query=query,
                k=k,
                filter=filter_criteria
            )
        elif search_type == "mmr":
            results = vector_store.max_marginal_relevance_search(
                query=query,
                k=k,
                filter=filter_criteria
            )
        elif search_type == "hybrid":
            # Not all vector stores support hybrid search
            if hasattr(vector_store, "hybrid_search"):
                results = vector_store.hybrid_search(
                    query=query,
                    k=k,
                    filter=filter_criteria
                )
            else:
                results = vector_store.similarity_search(
                    query=query,
                    k=k,
                    filter=filter_criteria
                )
        
        # Convert Langflow documents to MintFlow documents
        mintflow_results = []
        for i, doc in enumerate(results):
            import uuid
            mintflow_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": 1.0 - (i * 0.05),  # Mock score since not all vector stores return scores
                "id": str(uuid.uuid4())
            })
        
        return mintflow_results
    
    def delete_documents(self, vector_store_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Delete documents from a vector store
        
        Args:
            vector_store_id: The ID of the vector store
            input_data: The input data containing the document IDs or filter
            
        Returns:
            The result of deleting the documents
        """
        logger.info(f"Deleting documents from vector store {vector_store_id}")
        
        # Get the vector store
        vector_store = self.vector_stores.get(vector_store_id)
        if not vector_store:
            raise ValueError(f"Vector store {vector_store_id} not found")
        
        # Get the document IDs or filter
        ids = input_data.get("ids")
        filter_criteria = input_data.get("filter")
        
        # Delete the documents
        if ids:
            # Not all vector stores support deleting by IDs
            if hasattr(vector_store, "delete"):
                vector_store.delete(ids)
                count = len(ids)
            else:
                raise ValueError(f"Vector store {vector_store_id} does not support deleting by IDs")
        elif filter_criteria:
            # Not all vector stores support deleting by filter
            if hasattr(vector_store, "delete_by_metadata"):
                vector_store.delete_by_metadata(filter_criteria)
                count = 1  # We don't know how many documents were deleted
            else:
                raise ValueError(f"Vector store {vector_store_id} does not support deleting by filter")
        else:
            raise ValueError("Either ids or filter must be provided")
        
        return {
            "count": count
        }
    
    def create_graph(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a LangGraph workflow
        
        Args:
            config: The configuration for the graph
            input_data: The input data containing the nodes and edges
            
        Returns:
            The created graph
        """
        logger.info(f"Creating LangGraph workflow: {config.get('name')}")
        
        # Get the graph configuration
        name = config.get("name")
        description = config.get("description")
        entry_point = config.get("entry_point")
        
        # Get the nodes and edges
        nodes = input_data.get("nodes", [])
        edges = input_data.get("edges", [])
        
        # Create the graph
        from langgraph.graph import StateGraph
        
        # Define the state
        class GraphState(dict):
            """State for the graph."""
            def __init__(self, **kwargs):
                super().__init__(**kwargs)
            
            def __getattr__(self, key):
                if key in self:
                    return self[key]
                raise AttributeError(f"'{type(self).__name__}' object has no attribute '{key}'")
            
            def __setattr__(self, key, value):
                self[key] = value
        
        # Create the graph
        graph = StateGraph(GraphState)
        
        # Add the nodes
        for node in nodes:
            node_id = node.get("id")
            node_type = node.get("type")
            node_config = node.get("config", {})
            
            # Create the node based on the type
            if node_type == "llm":
                from langchain.chat_models import ChatOpenAI
                
                llm = ChatOpenAI(
                    model=node_config.get("model", "gpt-3.5-turbo"),
                    temperature=node_config.get("temperature", 0.7)
                )
                
                def llm_node(state):
                    query = state.get("query", "")
                    response = llm.invoke(query)
                    return {"response": response.content}
                
                graph.add_node(node_id, llm_node)
            
            elif node_type == "tool":
                tool_name = node_config.get("name")
                
                def tool_node(state):
                    query = state.get("query", "")
                    # Mock tool execution
                    return {"result": f"Tool {tool_name} executed with query: {query}"}
                
                graph.add_node(node_id, tool_node)
            
            elif node_type == "custom":
                # Custom nodes are defined by their code
                code = node_config.get("code", "")
                
                # Create a function from the code
                # This is a security risk in a real implementation
                # In a real implementation, we would use a sandbox
                exec_globals = {}
                exec(code, exec_globals)
                
                if "custom_node" in exec_globals:
                    graph.add_node(node_id, exec_globals["custom_node"])
                else:
                    raise ValueError(f"Custom node {node_id} does not define a custom_node function")
        
        # Add the edges
        for edge in edges:
            source = edge.get("source")
            target = edge.get("target")
            condition = edge.get("condition")
            
            if condition:
                # Create a conditional edge
                def edge_condition(state):
                    # Evaluate the condition
                    # This is a security risk in a real implementation
                    # In a real implementation, we would use a sandbox
                    return eval(condition, {"state": state})
                
                graph.add_conditional_edges(source, edge_condition, {True: target, False: None})
            else:
                # Create a normal edge
                graph.add_edge(source, target)
        
        # Set the entry point
        if entry_point:
            graph.set_entry_point(entry_point)
        elif nodes:
            # Use the first node as the entry point
            graph.set_entry_point(nodes[0].get("id"))
        
        # Compile the graph
        compiled_graph = graph.compile()
        
        # Generate a unique ID for the graph
        import uuid
        graph_id = str(uuid.uuid4())
        
        # Store the graph
        self.graphs[graph_id] = compiled_graph
        
        return {
            "graphId": graph_id,
            "name": name,
            "description": description,
            "nodes": nodes,
            "edges": edges
        }
    
    def run_graph(self, graph_id: str, input_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a LangGraph workflow
        
        Args:
            graph_id: The ID of the graph
            input_data: The input data for the graph
            config: Additional configuration for the run
            
        Returns:
            The result of running the graph
        """
        logger.info(f"Running LangGraph workflow {graph_id}")
        
        # Get the graph
        graph = self.graphs.get(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")
        
        # Get the configuration
        max_iterations = config.get("max_iterations")
        stream_output = config.get("stream_output", False)
        
        # Run the graph
        if stream_output:
            # Stream the output
            steps = []
            for step in graph.stream(input_data):
                steps.append(step)
            
            # Get the final output
            output = steps[-1]
        else:
            # Run the graph normally
            output = graph.invoke(input_data)
            steps = []  # We don't have steps in non-streaming mode
        
        return {
            "output": output,
            "steps": steps
        }
    
    def update_graph(self, graph_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a LangGraph workflow
        
        Args:
            graph_id: The ID of the graph
            input_data: The input data containing the updated graph
            
        Returns:
            The updated graph
        """
        logger.info(f"Updating LangGraph workflow {graph_id}")
        
        # Get the graph
        graph = self.graphs.get(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")
        
        # Get the updated configuration
        name = input_data.get("name")
        description = input_data.get("description")
        nodes = input_data.get("nodes")
        edges = input_data.get("edges")
        
        # Create a new graph with the updated configuration
        # This is a simplified implementation
        # In a real implementation, we would update the existing graph
        if nodes and edges:
            # Create a new graph
            result = self.create_graph(
                {
                    "name": name,
                    "description": description
                },
                {
                    "nodes": nodes,
                    "edges": edges
                }
            )
            
            # Update the graph ID
            result["graphId"] = graph_id
            
            # Update the stored graph
            self.graphs[graph_id] = self.graphs[result["graphId"]]
            del self.graphs[result["graphId"]]
            
            return result
        else:
            # Just update the metadata
            return {
                "graphId": graph_id,
                "name": name,
                "description": description
            }
    
    def create_agent(self, config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create an agent
        
        Args:
            config: The configuration for the agent
            input_data: The input data containing the tools
            
        Returns:
            The created agent
        """
        logger.info(f"Creating agent: {config.get('name')}")
        
        # Get the agent configuration
        name = config.get("name")
        description = config.get("description")
        llm_config = config.get("llm", {})
        
        # Get the tools
        tools = input_data.get("tools", [])
        
        # Create the LLM
        llm_provider = llm_config.get("provider", "openai")
        llm_model = llm_config.get("model", "gpt-3.5-turbo")
        llm_temperature = llm_config.get("temperature", 0.7)
        
        if llm_provider == "openai":
            from langchain.chat_models import ChatOpenAI
            
            llm = ChatOpenAI(
                model=llm_model,
                temperature=llm_temperature
            )
        elif llm_provider == "anthropic":
            from langchain.chat_models import ChatAnthropic
            
            llm = ChatAnthropic(
                model=llm_model,
                temperature=llm_temperature
            )
        elif llm_provider == "google":
            from langchain.chat_models import ChatGoogleGenerativeAI
            
            llm = ChatGoogleGenerativeAI(
                model=llm_model,
                temperature=llm_temperature
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider}")
        
        # Create the tools
        from langchain.tools import Tool
        
        agent_tools = []
        for tool in tools:
            tool_name = tool.get("name")
            tool_description = tool.get("description")
            tool_type = tool.get("type")
            tool_config = tool.get("config", {})
            
            if tool_type == "function":
                # Create a function tool
                def tool_func(input_str):
                    # Mock function execution
                    return f"Function {tool_name} executed with input: {input_str}"
                
                agent_tools.append(
                    Tool(
                        name=tool_name,
                        func=tool_func,
                        description=tool_description
                    )
                )
            
            elif tool_type == "retrieval":
                # Create a retrieval tool
                vector_store_id = tool_config.get("vectorStoreId")
                vector_store = self.vector_stores.get(vector_store_id)
                
                if not vector_store:
                    raise ValueError(f"Vector store {vector_store_id} not found")
                
                def retrieval_func(input_str):
                    # Search the vector store
                    results = vector_store.similarity_search(input_str, k=3)
                    return "\n\n".join([doc.page_content for doc in results])
                
                agent_tools.append(
                    Tool(
                        name=tool_name,
                        func=retrieval_func,
                        description=tool_description
                    )
                )
            
            elif tool_type == "web":
                # Create a web tool
                def web_func(input_str):
                    # Mock web search
                    return f"Web search for: {input_str}"
                
                agent_tools.append(
                    Tool(
                        name=tool_name,
                        func=web_func,
                        description=tool_description
                    )
                )
            
            elif tool_type == "custom":
                # Create a custom tool
                code = tool_config.get("code", "")
                
                # Create a function from the code
                # This is a security risk in a real implementation
                # In a real implementation, we would use a sandbox
                exec_globals = {}
                exec(code, exec_globals)
                
                if "tool_func" in exec_globals:
                    agent_tools.append(
                        Tool(
                            name=tool_name,
                            func=exec_globals["tool_func"],
                            description=tool_description
                        )
                    )
                else:
                    raise ValueError(f"Custom tool {tool_name} does not define a tool_func function")
        
        # Create the agent
        from langchain.agents import create_openai_functions_agent
        from langchain.prompts import ChatPromptTemplate
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant. Use the tools available to you to help the user."),
            ("human", "{input}")
        ])
        
        # Create the agent
        agent = create_openai_functions_agent(llm, agent_tools, prompt)
        
        # Create the agent executor
        from langchain.agents import AgentExecutor
        
        agent_executor = AgentExecutor(agent=agent, tools=agent_tools, verbose=True)
        
        # Generate a unique ID for the agent
        import uuid
        agent_id = str(uuid.uuid4())
        
        # Store the agent
        self.agents[agent_id] = agent_executor
        
        return {
            "agentId": agent_id,
            "name": name,
            "description": description,
            "tools": tools
        }
    
    def run_agent(self, agent_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run an agent
        
        Args:
            agent_id: The ID of the agent
            input_data: The input data for the agent
            
        Returns:
            The result of running the agent
        """
        logger.info(f"Running agent {agent_id}")
        
        # Get the agent
        agent = self.agents.get(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        
        # Get the input
        query = input_data.get("query")
        history = input_data.get("history", [])
        
        # Run the agent
        result = agent.invoke({"input": query})
        
        # Extract the steps
        steps = []
        if "intermediate_steps" in result:
            for action, observation in result["intermediate_steps"]:
                steps.append({
                    "tool": action.tool,
                    "input": action.tool_input,
                    "output": observation
                })
        
        return {
            "response": result["output"],
            "steps": steps
        }
    
    def add_tools(self, agent_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add tools to an agent
        
        Args:
            agent_id: The ID of the agent
            input_data: The input data containing the tools
            
        Returns:
            The result of adding the tools
        """
        logger.info(f"Adding tools to agent {agent_id}")
        
        # Get the agent
        agent_executor = self.agents.get(agent_id)
        if not agent_executor:
            raise ValueError(f"Agent {agent_id} not found")
        
        # Get the tools
        tools = input_data.get("tools", [])
        
        # Create the tools
        from langchain.tools import Tool
        
        new_tools = []
        for tool in tools:
            tool_name = tool.get("name")
            tool_description = tool.get("description")
            tool_type = tool.get("type")
            tool_config = tool.get("config", {})
            
            if tool_type == "function":
                # Create a function tool
                def tool_func(input_str):
                    # Mock function execution
                    return f"Function {tool_name} executed with input: {input_str}"
                
                new_tools.append(
                    Tool(
                        name=tool_name,
                        func=tool_func,
                        description=tool_description
                    )
                )
            
            elif tool_type == "web":
                # Create a web tool
                def web_func(input_str):
                    # Mock web search
                    return f"Web search for: {input_str}"
                
                new_tools.append(
                    Tool(
                        name=tool_name,
                        func=web_func,
                        description=tool_description
                    )
                )
            
            elif tool_type == "custom":
                # Create a custom tool
                code = tool_config.get("code", "")
                
                # Create a function from the code
                # This is a security risk in a real implementation
                # In a real implementation, we would use a sandbox
                exec_globals = {}
                exec(code, exec_globals)
                
                if "tool_func" in exec_globals:
                    new_tools.append(
                        Tool(
                            name=tool_name,
                            func=exec_globals["tool_func"],
                            description=tool_description
                        )
                    )
                else:
                    raise ValueError(f"Custom tool {tool_name} does not define a tool_func function")
        
        # Add the tools to the agent
        agent_executor.tools.extend(new_tools)
        
        return {
            "agentId": agent_id,
            "toolCount": len(tools)
        }
    
    def load_document(self, doc_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Load a document
        
        Args:
            doc_type: The type of document to load
            input_data: The input data containing the source
            
        Returns:
            The loaded document
        """
        logger.info(f"Loading document of type {doc_type}")
        
        # Get the source and options
        source = input_data.get("source")
        options = input_data.get("options", {})
        
        # Load the document based on the type
        if doc_type == "pdf":
            from langchain.document_loaders import PyPDFLoader
            
            loader = PyPDFLoader(source)
            docs = loader.load()
        
        elif doc_type == "docx":
            from langchain.document_loaders import Docx2txtLoader
            
            loader = Docx2txtLoader(source)
            docs = loader.load()
        
        elif doc_type == "txt":
            from langchain.document_loaders import TextLoader
            
            loader = TextLoader(source)
            docs = loader.load()
        
        elif doc_type == "csv":
            from langchain.document_loaders import CSVLoader
            
            loader = CSVLoader(source)
            docs = loader.load()
        
        elif doc_type == "json":
            from langchain.document_loaders import JSONLoader
            
            loader = JSONLoader(
                file_path=source,
                jq_schema=options.get("jq_schema", ".")
            )
            docs = loader.load()
        
        elif doc_type == "html":
            from langchain.document_loaders import BSHTMLLoader
            
            loader = BSHTMLLoader(source)
            docs = loader.load()
        
        elif doc_type == "url":
            from langchain.document_loaders import WebBaseLoader
            
            loader = WebBaseLoader(source)
            docs = loader.load()
        
        else:
            raise ValueError(f"Unsupported document type: {doc_type}")
        
        # Combine the documents into a single document
        combined_content = "\n\n".join([doc.page_content for doc in docs])
        combined_metadata = {
            "source": source,
            "type": doc_type
        }
        
        # Generate a unique ID for the document
        import uuid
        document_id = str(uuid.uuid4())
        
        # Store the document
        self.documents[document_id] = {
            "content": combined_content,
            "metadata": combined_metadata
        }
        
        return {
            "id": document_id,
            "content": combined_content,
            "metadata": combined_metadata
        }
    
    def split_document(self, document: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Split a document into chunks
        
        Args:
            document: The document to split
            config: The configuration for splitting
            
        Returns:
            The split document chunks
        """
        logger.info(f"Splitting document {document.get('id')}")
        
        # Get the document content and metadata
        content = document.get("content")
        metadata = document.get("metadata", {})
        
        # Get the configuration
        chunk_size = config.get("chunkSize", 1000)
        chunk_overlap = config.get("chunkOverlap", 200)
        separators = config.get("separators")
        
        # Create the text splitter
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=separators
        )
        
        # Split the document
        chunks = text_splitter.split_text(content)
        
        # Create documents from the chunks
        documents = []
        for i, chunk in enumerate(chunks):
            import uuid
            documents.append({
                "id": str(uuid.uuid4()),
                "content": chunk,
                "metadata": {
                    **metadata,
                    "chunk": i
                }
            })
        
        return documents
    
    def transform_document(self, document: Dict[str, Any], transformation: str, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform a document
        
        Args:
            document: The document to transform
            transformation: The transformation to apply
            options: Additional options for the transformation
            
        Returns:
            The transformed document
        """
        logger.info(f"Transforming document {document.get('id')} with {transformation}")
        
        # Get the document content and metadata
        content = document.get("content")
        metadata = document.get("metadata", {})
        
        # Apply the transformation
        if transformation == "html_to_text":
            from bs4 import BeautifulSoup
            
            soup = BeautifulSoup(content, "html.parser")
            transformed_content = soup.get_text()
        
        elif transformation == "markdown_to_text":
            import re
            
            # Remove headers
            transformed_content = re.sub(r"#+ ", "", content)
            
            # Remove bold/italic
            transformed_content = re.sub(r"\*\*|\*|__|\|", "", transformed_content)
            
            # Remove links
            transformed_content = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", transformed_content)
            
            # Remove images
            transformed_content = re.sub(r"!\[([^\]]+)\]\([^)]+\)", "", transformed_content)
            
            # Remove code blocks
            transformed_content = re.sub(r"```[\s\S]*?```", "", transformed_content)
            
            # Remove inline code
            transformed_content = re.sub(r"`([^`]+)`", r"\1", transformed_content)
        
        elif transformation == "translate":
            language = options.get("language", "fr")
            
            # In a real implementation, we would use a translation service
            # For now, we'll just mock the translation
            transformed_content = f"[Translated to {language}] {content[:100]}..."
        
        elif transformation == "summarize":
            from langchain.chat_models import ChatOpenAI
            from langchain.chains.summarize import load_summarize_chain
            from langchain.schema import Document
            
            llm = ChatOpenAI(temperature=0)
            chain = load_summarize_chain(llm, chain_type="stuff")
            doc = Document(page_content=content, metadata=metadata)
            summary = chain.run([doc])
            transformed_content = summary
        
        else:
            raise ValueError(f"Unsupported transformation: {transformation}")
        
        # Generate a unique ID for the transformed document
        import uuid
        document_id = str(uuid.uuid4())
        
        return {
            "id": document_id,
            "content": transformed_content,
            "metadata": {
                **metadata,
                "transformation": transformation
            }
        }
    
    def _convert_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert MintFlow configuration to Langflow configuration
        
        Args:
            config: MintFlow configuration
            
        Returns:
            Langflow configuration
        """
        langflow_config = {}
        
        # Map common fields
        if "apiKey" in config:
            langflow_config["api_key"] = config["apiKey"]
        
        if "namespace" in config:
            langflow_config["collection_name"] = config["namespace"]
        
        if "collectionName" in config:
            langflow_config["collection_name"] = config["collectionName"]
        
        # Vector store specific mappings
        if "url" in config:
            langflow_config["persist_directory"] = config["url"]
        
        # LLM specific mappings
        if "model" in config:
            langflow_config["model_name"] = config["model"]
        
        if "temperature" in config:
            langflow_config["temperature"] = config["temperature"]
        
        if "maxTokens" in config:
            langflow_config["max_tokens"] = config["maxTokens"]
        
        # Document specific mappings
        if "chunkSize" in config:
            langflow_config["chunk_size"] = config["chunkSize"]
        
        if "chunkOverlap" in config:
            langflow_config["chunk_overlap"] = config["chunkOverlap"]
        
        # Copy any other fields as-is
        for key, value in config.items():
            if key not in ["apiKey", "namespace", "collectionName", "url", "model", "temperature", "maxTokens", "chunkSize", "chunkOverlap"]:
                langflow_config[key] = value
        
        return langflow_config


def main():
    """
    Main function
    """
    logger.info("Starting Langflow Runner")
    
    # Create the runner
    runner = LangflowRunner()
    
    # Process tasks for each tenant
    for tenant in TENANTS:
        logger.info(f"Processing tasks for tenant: {tenant}")
        
        # Create the queue name
        queue_name = f"langflow:{tenant}"
        
        # Process tasks in a loop
        while True:
            try:
                # Get a task from the queue
                task_json = redis_client.lpop(queue_name)
                
                if task_json:
                    # Parse the task
                    task = json.loads(task_json)
                    
                    # Process the task
                    result = runner.process_task(task)
                    
                    # Send the result back to MintFlow
                    task_id = task.get("id")
                    if task_id:
                        result_queue = f"langflow:result:{task_id}"
                        redis_client.rpush(result_queue, json.dumps(result))
                        redis_client.expire(result_queue, 3600)  # Expire after 1 hour
                else:
                    # No tasks, sleep for a bit
                    time.sleep(1)
            
            except Exception as e:
                logger.error(f"Error processing task: {e}")
                logger.error(traceback.format_exc())
                time.sleep(1)


if __name__ == "__main__":
    main()
