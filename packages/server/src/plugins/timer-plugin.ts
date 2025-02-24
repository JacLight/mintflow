import { PluginDescriptor } from "@mintflow/common";
import { TimerJob, TimerQueueService } from "../engine/TimerQueueService.js";

const timerPlugin: PluginDescriptor = {
    name: "Timer",
    icon: "",
    description: "Description for timer",
    id: "timer",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            type: {
                name: 'type',
                type: 'string',
                enum: ['cron', 'interval', 'timeout'],
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            cron: {
                name: 'cron',
                type: 'string',
                displaySize: 'small',
                displayStyle: 'outlined',
                'x-control': 'cron',
                rules: [{ operation: 'notEqual', valueA: 'cron', valueB: '{{type}}', action: 'hide' }],
            },
            interval: {
                name: 'interval',
                type: 'number',
                description: 'seconds',
                displayStyle: 'outlined',
                displaySize: 'small',
                default: 5,
                rules: [{ operation: 'notEqual', valueA: 'interval', valueB: '{{type}}', action: 'hide' }],
            },
            timeout: {
                name: 'timeout',
                type: 'number',
                displayStyle: 'outlined',
                description: 'seconds',
                default: 5,
                displaySize: 'small',
                rules: [{ operation: 'notEqual', valueA: 'timeout', valueB: '{{type}}', action: 'hide' }],
            },
        },
    },
    outputSchema: 'string',
    exampleInput: 'undefined',
    exampleOutput: new Date().toISOString(),
    documentation: "https://yourdocs.com/timer",
    type: "node",
    actions: [
        {
            name: 'cron',
            execute: async (input: any, context: any) => {
                const { cron: expression } = input;
                const { flowRunId, nodeId } = context;

                const timerJob: TimerJob = {
                    type: 'cron',
                    flowRunId,
                    nodeId,
                    data: { timestamp: new Date().toISOString() },
                    expression
                };

                const jobId = await TimerQueueService.getInstance().scheduleTimer(timerJob);
                return `Cron job scheduled with expression: ${expression}, Job ID: ${jobId}`;
            }
        },
        {
            name: 'interval',
            execute: async (input: any, context: any) => {
                const { interval = 5 } = input;
                const { flowRunId, nodeId } = context;

                const timerJob: TimerJob = {
                    type: 'interval',
                    flowRunId,
                    nodeId,
                    data: { timestamp: new Date().toISOString() },
                    interval
                };

                const jobId = await TimerQueueService.getInstance().scheduleTimer(timerJob);
                return `Interval set for every ${interval} seconds, Job ID: ${jobId}`;
            }
        },
        {
            name: 'timeout',
            execute: async (input: any, context: any) => {
                const { timeout = 5 } = input;
                const { flowRunId, nodeId } = context;

                const timerJob: TimerJob = {
                    type: 'timeout',
                    flowRunId,
                    nodeId,
                    data: { timestamp: new Date().toISOString() },
                    timeout
                };

                const jobId = await TimerQueueService.getInstance().scheduleTimer(timerJob);
                return `Timeout set for ${timeout} seconds, Job ID: ${jobId}`;
            }
        },
    ]
};

export default timerPlugin;