import mqttPlugin from '../src/index';
import * as mqtt from 'mqtt';

jest.mock('mqtt');

describe('mqttPlugin', () => {
    describe('actions', () => {
        describe('subscribe', () => {
            it('should connect and subscribe to a topic', async () => {
                const mockClient = {
                    on: jest.fn(),
                    subscribe: jest.fn(),
                };
                (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

                const input = {
                    url: 'mqtt://test.mosquitto.org',
                    options: {},
                    topic: 'test/topic',
                };
                const config = {
                    callback: jest.fn(),
                };

                await mqttPlugin.actions[0].execute(input, config);

                expect(mqtt.connect).toHaveBeenCalledWith(input.url, input.options);
                expect(mockClient.subscribe).toHaveBeenCalledWith(input.topic);
                expect(mockClient.on).toHaveBeenCalledWith('message', expect.any(Function));
            });
        });

        describe('publish', () => {
            it('should connect and publish a message to a topic', async () => {
                const mockClient = {
                    publish: jest.fn(),
                };
                (mqtt.connect as jest.Mock).mockReturnValue(mockClient);

                const input = {
                    url: 'mqtt://test.mosquitto.org',
                    options: {},
                    topic: 'test/topic',
                    message: 'Hello, MQTT!',
                };

                await mqttPlugin.actions[1].execute(input, {});

                expect(mqtt.connect).toHaveBeenCalledWith(input.url, input.options);
                expect(mockClient.publish).toHaveBeenCalledWith(input.topic, input.message);
            });
        });
    });
});
