// Fake Redis client for testing purposes
class FakeRedisClient {
    private store: { [key: string]: string[] } = {};

    async connect() {
        // Simulate connection
    }

    async rPush(key: string, value: string) {
        if (!this.store[key]) {
            this.store[key] = [];
        }
        this.store[key].push(value);
    }

    async lRange(key: string, start: number, end: number) {
        return this.store[key] ? this.store[key].slice(start, end + 1) : [];
    }

    async del(key: string) {
        delete this.store[key];
    }
}

const redisClient = new FakeRedisClient();

const delayPlugin = {
    name: "delay",
    icon: "Clock",
    description: "Description for delay",
    groups: ["utility"],
    tags: ["utility", "tool", "helper", "function", "operation"],
    version: '1.0.0',
    id: "delay",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            type: {
                type: 'string',
                enum: ['wait', 'schedule', 'event'],
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            strategy: {
                type: 'string',
                enum: ['collate', 'delay-each', 'send-last', 'send-first'],
                default: 'collate',
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            schedule: {
                displayStyle: 'outlined',
                displaySize: 'small',
                format: 'date',
                'x-control-variant': 'simple',
                'x-control': 'date',
                type: 'string',
                rules: [{ operation: 'notEqual', valueA: 'schedule', valueB: '{{type}}', action: 'hide' }],
            },
            delay: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                group: 'delay',
                rules: [{ operation: 'notEqual', valueA: 'wait', valueB: '{{type}}', action: 'hide' }],
            },
            delayIn: {
                type: 'string',
                enum: ['second', 'minute', 'hour', 'days'],
                displayStyle: 'outlined',
                displaySize: 'small',
                group: 'delay',
                rules: [{ operation: 'notEqual', valueA: 'wait', valueB: '{{type}}', action: 'hide' }],
            },
            events: {
                type: 'array',
                dataSource: {
                    source: 'json',
                    json: ['sms-reply', 'sms-received', 'email-reply', 'email-received', 'call-received', 'call-reply', 'form-submitted', 'page-visit'],
                },
                items: {
                    type: 'string',
                },
                rules: [{ operation: 'notEqual', valueA: 'event', valueB: '{{type}}', action: 'hide' }],
                group: 'option',
            },
        },

    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {

    },
    exampleOutput: {
    },
    documentation: "https://yourdocs.com/delay",
    method: "exec",
    actions: [
        {
            name: 'delay',
            execute: async (input: any, config: any) => {
                const { strategy, delay, delayIn, data } = input;
                if (!data) return [];

                const delayMs = delayIn === 'second' ? delay * 1000 : delay;

                switch (strategy) {
                    case 'collate':
                        return [data];
                    case 'delay-each':
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        return [{ ...data, delayed: true }];
                    case 'send-last':
                        return [data];
                    case 'send-first':
                        return [data];
                    default:
                        return [data];
                }
            }
        }
    ]
};

export default delayPlugin;
