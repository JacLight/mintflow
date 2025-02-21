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
await redisClient.connect();

const delayPlugin = {
    name: "delay",
    icon: "",
    description: "Description for delay",
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
                const { delay, delayIn, strategy, data } = input;
                const delayMap: { [key: string]: number } = {
                    second: 1000,
                    minute: 60000,
                    hour: 3600000,
                    days: 86400000
                };
                const delayTime = delay * (delayMap[delayIn] || 0);

                // Store data in Fake Redis
                const dataKey = `delay:data:${strategy}`;
                await redisClient.rPush(dataKey, JSON.stringify(data));

                const applyStrategy = async () => {
                    const dataStore = await redisClient.lRange(dataKey, 0, -1);
                    const parsedDataStore = dataStore.map((item: string) => JSON.parse(item));

                    switch (strategy) {
                        case 'collate':
                            return parsedDataStore;
                        case 'delay-each':
                            const results = [];
                            for (let i = 0; i < parsedDataStore.length; i++) {
                                await new Promise(resolve => setTimeout(resolve, delayTime));
                                results.push({ ...parsedDataStore[i], delayed: true });
                            }
                            return results;
                        case 'send-last':
                            return parsedDataStore.slice(-1);
                        case 'send-first':
                            return parsedDataStore.slice(0, 1);
                        default:
                            return parsedDataStore;
                    }
                };

                const result = await applyStrategy();
                if (strategy !== 'delay-each') {
                    await redisClient.del(dataKey); // Clear the data store after processing for non delay-each strategies
                }
                return result;
            }
        }
    ]
};

export default delayPlugin;