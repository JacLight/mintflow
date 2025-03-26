/**
 * Node Service
 * 
 * A central service for fetching, caching, and accessing nodes throughout the application.
 * This service can be used both inside and outside of React components.
 */

import { getMintflowClient } from './mintflow-client';

// Node type definition
export interface Node {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    groups?: string[];
    inputSchema?: any;
    outputSchema?: any;
    [key: string]: any;
}

// Cache for nodes
let nodesCache: Node[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Event system for notifying subscribers when nodes are updated
type NodeUpdateListener = () => void;
const listeners: NodeUpdateListener[] = [];

/**
 * Subscribe to node updates
 * @param listener Function to call when nodes are updated
 * @returns Unsubscribe function
 */
export function subscribeToNodeUpdates(listener: NodeUpdateListener): () => void {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
}

/**
 * Notify all subscribers that nodes have been updated
 */
function notifyNodeUpdate(): void {
    listeners.forEach(listener => listener());
}

/**
 * Check if the cache is valid
 * @returns True if the cache is valid, false otherwise
 */
function isCacheValid(): boolean {
    return !!nodesCache && (Date.now() - lastFetchTime < CACHE_DURATION);
}

/**
 * Fetch all nodes from the server
 * @param fields Optional array of fields to fetch
 * @param forceRefresh Force a refresh of the cache
 * @returns Promise that resolves to an array of nodes
 */
export async function fetchNodes(fields?: string[], forceRefresh: boolean = false): Promise<Node[]> {
    // Use cache if valid and not forcing refresh
    if (isCacheValid() && !forceRefresh && nodesCache) {
        return nodesCache;
    }

    try {
        const mintflowClient = getMintflowClient();

        // Default fields to fetch if none provided
        const fieldsToFetch = fields || [
            'id',
            'name',
            'description',
            'icon',
            'groups',
            'inputSchema',
            'outputSchema'
        ];

        const response = await mintflowClient.getNodes(fieldsToFetch);

        if (response.nodes) {
            // Map the response to our Node type
            nodesCache = response.nodes.map((node: any) => ({
                id: node.id,
                type: 'dynamic',
                name: node.name,
                description: node.description || 'No description available',
                icon: node.icon || 'Box',
                groups: node.groups || ['uncategorized'],
                inputSchema: node.inputSchema,
                outputSchema: node.outputSchema,
                ...node // Include any other fields that were returned
            }));

            lastFetchTime = Date.now();
            notifyNodeUpdate();
            return nodesCache || [];
        } else {
            throw new Error('Failed to fetch nodes: No nodes returned');
        }
    } catch (error) {
        console.error('Error fetching nodes:', error);
        // If we have a cache, return it even if it's expired
        if (nodesCache) {
            return nodesCache;
        }
        return [];
    }
}

/**
 * Get all nodes from the cache or fetch them if needed
 * @param fields Optional array of fields to fetch
 * @returns Promise that resolves to an array of nodes
 */
export async function getNodes(fields?: string[]): Promise<Node[]> {
    return fetchNodes(fields);
}

/**
 * Get a node by ID
 * @param id Node ID
 * @param fields Optional array of fields to fetch
 * @returns Promise that resolves to a node or null if not found
 */
export async function getNodeById(id: string, fields?: string[]): Promise<Node | null> {
    // Try to get from cache first
    if (isCacheValid() && nodesCache) {
        const node = nodesCache.find(node => node.id === id);
        if (node) return node;
    }

    try {
        const mintflowClient = getMintflowClient();
        const response = await mintflowClient.getNode(id, fields);

        if (response.node) {
            return {
                id: response.node.id,
                type: 'dynamic',
                name: response.node.name,
                description: response.node.description || 'No description available',
                icon: response.node.icon || 'Box',
                groups: response.node.groups || ['uncategorized'],
                inputSchema: response.node.inputSchema,
                outputSchema: response.node.outputSchema,
                ...response.node // Include any other fields that were returned
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching node with ID ${id}:`, error);
        return null;
    }
}

/**
 * Filter nodes by search term
 * @param searchTerm Term to search for
 * @param nodes Optional array of nodes to search in (defaults to cached nodes)
 * @returns Array of nodes that match the search term
 */
export function filterNodesBySearchTerm(searchTerm: string, nodes?: Node[]): Node[] {
    if (!searchTerm) return nodes || nodesCache || [];

    const nodesToSearch = nodes || nodesCache || [];
    const term = searchTerm.toLowerCase();

    return nodesToSearch.filter(node =>
        node.name.toLowerCase().includes(term) ||
        (node.description && node.description.toLowerCase().includes(term)) ||
        (node.id && node.id.toLowerCase().includes(term)) ||
        (node.groups && node.groups.some(group => group.toLowerCase().includes(term)))
    );
}

/**
 * Group nodes by their group property
 * @param nodes Array of nodes to group
 * @returns Object with group names as keys and arrays of nodes as values
 */
export function groupNodesByGroup(nodes: Node[]): Record<string, Node[]> {
    const groups: Record<string, Node[]> = {};

    nodes.forEach(node => {
        const nodeGroups = node.groups || ['uncategorized'];

        nodeGroups.forEach(group => {
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(node);
        });
    });

    return groups;
}

/**
 * Sort nodes by name
 * @param nodes Array of nodes to sort
 * @param ascending Sort in ascending order if true, descending if false
 * @returns Sorted array of nodes
 */
export function sortNodesByName(nodes: Node[], ascending: boolean = true): Node[] {
    return [...nodes].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return ascending ? comparison : -comparison;
    });
}

/**
 * Clear the node cache
 */
export function clearNodeCache(): void {
    nodesCache = null;
    lastFetchTime = 0;
    notifyNodeUpdate();
}

/**
 * Component type for UI components
 */
export interface ComponentType {
    type: string;
    id: string;
    name: string;
    description: string;
    icon: string | any;
    groups?: string[];
}

/**
 * Component group type for UI components
 */
export interface ComponentGroup {
    name: string;
    components: ComponentType[];
}

// Default fields for component panel
export const COMPONENT_PANEL_FIELDS = [
    'id',
    'name',
    'groups',
    'description',
    'inputSchema',
    'icon'
];

/**
 * Get nodes with their groups, processed and ready for UI components
 * @param fields Optional array of fields to fetch (defaults to COMPONENT_PANEL_FIELDS)
 * @returns Promise that resolves to an object with nodes, component types, and component groups
 */
export async function getNodesWithGroups(fields: string[] = COMPONENT_PANEL_FIELDS) {
    // Use the provided fields or default fields
    const fieldsToFetch = fields;

    // Get nodes
    const nodes = await getNodes(fieldsToFetch);

    if (!nodes || nodes.length === 0) {
        return {
            nodes: [],
            componentTypes: [],
            componentGroups: []
        };
    }

    // Map the nodes to ComponentType format
    const componentTypes: ComponentType[] = nodes.map((node: Node) => ({
        ...node,
        id: node.id,
        name: node.name,
        nodeType: node.type,
        description: node.description || 'No description available',
        icon: node.icon || 'Box',
        groups: node.groups || ['uncategorized'],
        type: 'dynamic',
    }));

    // Group nodes by their groups
    const groupedNodes = groupNodesByGroup(nodes);

    // Convert the grouped nodes to ComponentGroup format
    const componentGroups: ComponentGroup[] = Object.entries(groupedNodes).map(([name, nodes]) => ({
        name,
        components: nodes.map(node => ({
            type: 'dynamic',
            id: node.id,
            name: node.name,
            description: node.description || 'No description available',
            icon: node.icon || 'Box',
            groups: node.groups || ['uncategorized']
        }))
    }));

    // Sort groups alphabetically
    componentGroups.sort((a, b) => a.name.localeCompare(b.name));

    // Move "uncategorized" to the end if it exists
    const uncategorizedIndex = componentGroups.findIndex(g => g.name === 'uncategorized');
    if (uncategorizedIndex !== -1) {
        const [uncategorized] = componentGroups.splice(uncategorizedIndex, 1);
        componentGroups.push(uncategorized);
    }

    // Sort components within each group
    componentGroups.forEach(group => {
        group.components.sort((a, b) => a.name.localeCompare(b.name));
    });

    return {
        nodes,
        componentTypes,
        componentGroups
    };
}

// React hook for using nodes in components
export function useNodes(fields?: string[]): {
    nodes: Node[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
} {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Import useState at the top of the file
    function useState<T>(initialState: T): [T, (newState: T) => void] {
        throw new Error('This hook can only be used in a React component');
    }

    async function fetchNodesForHook() {
        try {
            setLoading(true);
            const fetchedNodes = await getNodes(fields);
            setNodes(fetchedNodes);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }

    // This is just a placeholder for documentation
    // The actual implementation would be in a React component
    function useEffect(effect: () => void | (() => void), deps?: any[]) {
        throw new Error('This hook can only be used in a React component');
    }

    // useEffect(() => {
    //   fetchNodesForHook();
    //   
    //   // Subscribe to node updates
    //   const unsubscribe = subscribeToNodeUpdates(() => {
    //     if (nodesCache) {
    //       setNodes(nodesCache);
    //     }
    //   });
    //   
    //   return unsubscribe;
    // }, []);

    return {
        nodes,
        loading,
        error,
        refetch: fetchNodesForHook
    };
}

// Export a comment explaining how to use the hook in a React component
export const useNodesExample = `
// Example usage in a React component:
import { useEffect, useState } from 'react';
import { useNodes } from '@/lib/node-service';

function MyComponent() {
  // Use the hook directly in a React component
  const { nodes, loading, error, refetch } = useNodes(['id', 'name', 'description']);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {nodes.map(node => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </div>
  );
}
`;
