import * as mqtt from "mqtt"

const mqttPlugin = {
    name: "Mqtt",
    icon: "",
    description: "Description for mqtt",
    groups: ["integration"],
    tags: ["integration","connector","api","service","platform"],
    version: '1.0.0',
    id: "mqtt",
    runner: "node",
    inputSchema: {
        type: "object",

    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {

    },
    exampleOutput: {
    },
    documentation: "https://yourdocs.com/mqtt",
    method: "exec",
    actions: [
        {
            name: 'subscribe',
            description: 'Connect to a MQTT broker',
            execute: async (input: any, config: any): Promise<any> => {
                const { callback } = config
                const client = await mqtt.connect(input.url, input.options);
                client.on('message', (topic, message) => {
                    console.log(`Received message on topic ${topic}: ${message.toString()}`);
                    if (callback) {
                        callback({ topic, message: message.toString() });
                    } else {
                        console.log(`No callback defined for topic ${topic}`);
                    }
                });
                client.subscribe(input.topic);
                return client;
            }
        },
        {
            name: 'publish',
            description: 'Publish a message to a topic',
            execute: async (input: any, config: any): Promise<any> => {
                const client = await mqtt.connect(input.url, input.options);
                client.publish(input.topic, input.message);
                return client;
            }
        }
    ]
};

export default mqttPlugin;