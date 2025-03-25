import { Connection, Edge, Node } from '@xyflow/react';

/**
 * Checks if a connection between two nodes is valid based on their types
 * @param connection The connection to validate
 * @param nodes All nodes in the flow
 * @param edges All edges in the flow
 * @returns Whether the connection is valid
 */
export function isValidConnection(
    connection: Connection,
    nodes: Node[],
    edges: Edge[]
): boolean {
    // Get the source and target nodes
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    if (!sourceNode || !targetNode) {
        return false;
    }

    // Don't allow connections to self
    if (connection.source === connection.target) {
        return false;
    }

    // Parse the handle data from the connection
    const sourceHandleData = connection.sourceHandle
        ? scapeJSONParse(connection.sourceHandle)
        : null;
    const targetHandleData = connection.targetHandle
        ? scapeJSONParse(connection.targetHandle)
        : null;

    // Check if the source node already has a connection from this handle
    const sourceHasConnection = edges.some(
        (edge) =>
            edge.source === connection.source &&
            edge.sourceHandle === connection.sourceHandle
    );

    // Check if the target node already has a connection to this handle
    const targetHasConnection = edges.some(
        (edge) =>
            edge.target === connection.target &&
            edge.targetHandle === connection.targetHandle
    );

    // If either node already has a connection on the specific handle, don't allow another
    if (sourceHasConnection || targetHasConnection) {
        return false;
    }

    // If we have handle data with output_types and input_types, check compatibility
    if (sourceHandleData?.output_types && targetHandleData?.input_types) {
        // Check if any of the output types match any of the input types
        return sourceHandleData.output_types.some((outputType: string) =>
            targetHandleData.input_types.includes(outputType)
        );
    }

    // If we have handle data with input_types and the source doesn't have output_types,
    // we should not allow the connection
    if (!sourceHandleData?.output_types && targetHandleData?.input_types) {
        return false;
    }

    // If we have handle data with output_types and the target doesn't have input_types,
    // we should not allow the connection
    if (sourceHandleData?.output_types && !targetHandleData?.input_types) {
        return false;
    }

    // If we're connecting from a source to a target, check node type compatibility
    if (sourceNode.type === 'improved' && targetNode.type === 'improved') {
        // For improved nodes, we require explicit type compatibility
        return false;
    }

    // If we don't have specific type information, allow the connection for non-improved nodes
    return true;
}

/**
 * Safely parses a JSON string, returning null if parsing fails
 * @param jsonString The JSON string to parse
 * @returns The parsed object or null if parsing fails
 */
export function scapeJSONParse(jsonString: string): any {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return null;
    }
}

/**
 * Safely stringifies an object to JSON, handling circular references
 * @param obj The object to stringify
 * @returns The JSON string
 */
export function scapedJSONStringfy(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    });
}

/**
 * Handles keydown events for textareas to prevent propagation
 * @param event The keyboard event
 */
export function handleKeyDown(event: React.KeyboardEvent): void {
    // Stop propagation to prevent ReactFlow from capturing keyboard events
    // when editing text in a node
    event.stopPropagation();
}

/**
 * Checks if a node has a tool mode property
 * @param template The node template
 * @returns Whether the node has a tool mode
 */
export function checkHasToolMode(template: Record<string, any>): boolean {
    return Object.values(template).some(
        (field) => field && field.tool_mode === true
    );
}

/**
 * Finds the last node in a flow
 * @param nodes All nodes in the flow
 * @param edges All edges in the flow
 * @param startNodeId The ID of the node to start from
 * @returns The last node in the flow
 */
export function findLastNode(
    nodes: Node[],
    edges: Edge[],
    startNodeId: string
): Node | undefined {
    // Find nodes that have no outgoing edges
    const endNodes = nodes.filter(
        (node) => !edges.some((edge) => edge.source === node.id)
    );

    if (endNodes.length === 0) {
        return undefined;
    }

    // If there's only one end node, return it
    if (endNodes.length === 1) {
        return endNodes[0];
    }

    // If there are multiple end nodes, find the one that's reachable from the start node
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];

    while (queue.length > 0) {
        const currentNodeId = queue.shift()!;
        visited.add(currentNodeId);

        // Find all nodes connected to the current node
        const connectedNodeIds = edges
            .filter((edge) => edge.source === currentNodeId)
            .map((edge) => edge.target);

        // If there are no connected nodes, check if this is an end node
        if (connectedNodeIds.length === 0) {
            const endNode = endNodes.find((node) => node.id === currentNodeId);
            if (endNode) {
                return endNode;
            }
        }

        // Add unvisited connected nodes to the queue
        for (const nodeId of connectedNodeIds) {
            if (!visited.has(nodeId)) {
                queue.push(nodeId);
            }
        }
    }

    // If no end node is reachable from the start node, return the first end node
    return endNodes[0];
}
