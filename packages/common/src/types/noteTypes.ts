// types.ts

export type ActionMethod = "HTTP" | "exec";

export interface ActionDescriptor {
    name: string;
    inputSchema: object;    // JSON schema for the input
    outputSchema: object;   // JSON schema for the output
    exampleInput: any;      // Sample input
    exampleOutput: any;     // Sample output
    description: string;
    documentation: string;
    method: ActionMethod;
    entry?: {               // Only required for HTTP-based actions
        url: string;
        method: string;       // e.g. "POST"
        headers?: Record<string, string>;
    };
    execute?: (input: any, config: any) => Promise<any>; // Required if method is "exec"
}

export interface PluginDescriptor {
    id: string;
    name: string;
    description: string;
    icon: string;
    documentation: string;
    actions: ActionDescriptor[];
}
