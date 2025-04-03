import cron from 'node-cron';
import { scheduleTask, getTasks } from './scheduler.js';
import { v4 as uuidv4 } from 'uuid';

const timerPlugin = {
    name: "Timer",
    icon: "Timer",
    description: "Description for timer",
    groups: ["utility"],
    tags: ["utility", "tool", "helper", "function", "operation"],
    version: '1.0.0',
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
    method: "exec",
    actions: [
        {
            name: 'cron',
            execute: async (input: any, config: any) => {
                const { cron: cronExpression } = input;
                if (!cron.validate(cronExpression)) {
                    throw new Error('Invalid cron expression');
                }
                const taskId = scheduleTask({ id: uuidv4(), type: 'cron', expression: cronExpression });
                return `Cron job scheduled with expression: ${cronExpression}, Task ID: ${taskId}`;
            }
        },
        {
            name: 'interval',
            execute: async (input: any, config: any) => {
                const { interval = 5 } = input;
                const existingTasks = getTasks().filter(task => task.type === 'interval');
                if (existingTasks.length > 0) {
                    throw new Error('An interval task is already scheduled');
                }
                const taskId = scheduleTask({ id: uuidv4(), type: 'interval', expression: '', interval });
                return `Interval set for every ${interval} seconds, Task ID: ${taskId}`;
            }
        },
        {
            name: 'timeout',
            execute: async (input: any, config: any) => {
                const { timeout = 5 } = input;
                const taskId = scheduleTask({ id: uuidv4(), type: 'timeout', expression: '', timeout });
                return `Timeout set for ${timeout} seconds, Task ID: ${taskId}`;
            }
        },
    ]
};

export default timerPlugin;
