// types.ts

export type ActionMethod = "HTTP" | "exec" | string;

export interface ActionDescriptor {
    name: string;
    inputSchema?: object | string;
    outputSchema?: object | string;
    exampleInput?: any;      // Sample input
    exampleOutput?: any;     // Sample output
    description?: string;
    documentation?: string;
    method?: ActionMethod;
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
    runner: string;
    type: string;
    documentation: string;
    inputSchema?: object | string;
    outputSchema?: object | string;
    exampleInput?: any;
    exampleOutput?: any;
    waitForTrigger?: boolean; // Only required for exec-based actions
    actions: ActionDescriptor[];
}
