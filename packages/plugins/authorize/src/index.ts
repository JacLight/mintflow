import { validateValue } from '@mintflow/common';

const authorizePlugin = {
    name: "Authorize",
    icon: "",
    description: "Build authorization processes in your workflows",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: "authorize",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {}
    },
    outputSchema: {
        type: "object"
    },
    method: "exec",
    actions: [
        {
            name: 'create_authorization_links',
            execute: async (input: any, config: any): Promise<any> => {
                // Generate authorization links
                if (config.flowContext && config.flowContext.generateResumeUrl) {
                    return {
                        authorizeLink: await config.flowContext.generateResumeUrl({
                            queryParams: { action: 'authorize' }
                        }),
                        rejectLink: await config.flowContext.generateResumeUrl({
                            queryParams: { action: 'reject' }
                        })
                    };
                }

                // Fallback for testing or when generateResumeUrl is not available
                return {
                    authorizeLink: "https://example.com/authorize?action=authorize",
                    rejectLink: "https://example.com/authorize?action=reject"
                };
            }
        },
        {
            name: 'wait_for_authorization',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};

                // Check if this is the initial execution or a resume after authorization
                if (config.executionType === 'BEGIN') {
                    // Pause the flow and wait for authorization
                    if (config.flowContext && config.flowContext.pause) {
                        await config.flowContext.pause({
                            pauseMetadata: {
                                type: 'WEBHOOK',
                                response: {}
                            }
                        });
                    }

                    // This return value will be used if pause is not available (e.g., in testing)
                    return {
                        ...data,
                        authorized: true
                    };
                } else {
                    // This is a resume after authorization
                    const action = config.resumePayload?.queryParams?.action;
                    return {
                        ...data,
                        authorized: action === 'authorize'
                    };
                }
            }
        }
    ]
};

export default authorizePlugin;
