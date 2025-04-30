const manualTriggerPlugin = {
    name: "Manual Trigger",
    icon: "FaPlay",
    description: "Manually trigger a workflow with a button click",
    groups: ["triggers", "utility"],
    tags: ["trigger", "manual", "button", "start", "workflow"],
    version: '1.0.0',
    id: "manual-trigger",
    runner: "node",
    type: "trigger",
    inputSchema: {
        type: "object",
        properties: {
            payload: {
                type: "object",
                description: "Optional payload data to pass to the workflow",
                default: {}
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            triggered: { 
                type: "boolean",
                description: "Whether the workflow was triggered successfully"
            },
            timestamp: { 
                type: "string",
                description: "The time when the workflow was triggered"
            },
            payload: {
                type: "object",
                description: "The payload data passed to the workflow"
            }
        }
    },
    exampleInput: {
        payload: {
            data: "Sample input data"
        }
    },
    exampleOutput: {
        triggered: true,
        timestamp: "2025-04-29T15:30:00Z",
        payload: {
            data: "Sample input data"
        }
    },
    documentation: "https://docs.mintflow.com/plugins/manual-trigger",
    method: "exec",
    actions: [
        {
            name: "trigger",
            description: "Manually trigger a workflow with a button click",
            execute: async (input: any, config: any): Promise<any> => {
                try {
                    // Just pass through any input and add some metadata
                    return {
                        triggered: true,
                        timestamp: new Date().toISOString(),
                        payload: input.payload || {}
                    };
                } catch (error) {
                    if (error instanceof Error) {
                        throw new Error(`Manual trigger error: ${error.message}`);
                    } else {
                        throw new Error('Unknown error occurred');
                    }
                }
            }
        }
    ]
};

export default manualTriggerPlugin;