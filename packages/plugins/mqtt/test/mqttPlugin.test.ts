import mqttPlugin from '../src/index';
import * as mqtt from 'mqtt';

jest.mock('mqtt');

describe('mqttPlugin', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            on: jest.fn(),
            subscribe: jest.fn(),
            publish: jest.fn(),
        };
        (mqtt.connect as jest.Mock).mockReturnValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('subscribe action', () => {
        it('should connect to the broker and subscribe to a topic', async () => {
            const input = { url: 'mqtt://test', options: {}, topic: 'test/topic' };
            const config = { callback: jest.fn() };

            await mqttPlugin.actions[0].execute(input, config);

            expect(mqtt.connect).toHaveBeenCalledWith(input.url, input.options);
            expect(mockClient.subscribe).toHaveBeenCalledWith(input.topic);
            expect(mockClient.on).toHaveBeenCalledWith('message', expect.any(Function));
        });

        it('should call the callback on receiving a message', async () => {
            const input = { url: 'mqtt://test', options: {}, topic: 'test/topic' };
            const config = { callback: jest.fn() };

            await mqttPlugin.actions[0].execute(input, config);

            const messageHandler = mockClient.on.mock.calls[0][1];
            messageHandler('test/topic', Buffer.from('test message'));

            expect(config.callback).toHaveBeenCalledWith({ topic: 'test/topic', message: 'test message' });
        });

        it('should log a message if no callback is defined', async () => {
            console.log = jest.fn();
            const input = { url: 'mqtt://test', options: {}, topic: 'test/topic' };
            const config = {};

            await mqttPlugin.actions[0].execute(input, config);

            const messageHandler = mockClient.on.mock.calls[0][1];
            messageHandler('test/topic', Buffer.from('test message'));

            expect(console.log).toHaveBeenCalledWith('No callback defined for topic test/topic');
        });
    });

    describe('publish action', () => {
        it('should connect to the broker and publish a message to a topic', async () => {
            const input = { url: 'mqtt://test', options: {}, topic: 'test/topic', message: 'test message' };

            await mqttPlugin.actions[1].execute(input, {});

            expect(mqtt.connect).toHaveBeenCalledWith(input.url, input.options);
            expect(mockClient.publish).toHaveBeenCalledWith(input.topic, input.message);
        });
    });
});
