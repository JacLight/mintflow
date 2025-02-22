import { FlowEngine } from '../../src/engine/FlowEngine';
import { DatabaseService } from '../../src/services/DatabaseService';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import mqtt from 'mqtt';

jest.mock('../../src/services/DatabaseService');
jest.mock('ioredis', () => {
    const Redis = jest.fn().mockImplementation(() => ({
        set: jest.fn(),
        get: jest.fn(),
        rpush: jest.fn(),
        del: jest.fn()
    }));
    return { Redis };
});
jest.mock('events');
jest.mock('mqtt');

describe('FlowEngine', () => {
    let dbMock: jest.Mocked<DatabaseService>;
    let redisMock: jest.Mocked<Redis>;
    let eventEmitterMock: jest.Mocked<EventEmitter>;
    let mqttClientMock: jest.Mocked<mqtt.MqttClient>;

    beforeEach(() => {
        dbMock = new DatabaseService() as jest.Mocked<DatabaseService>;
        redisMock = new Redis() as jest.Mocked<Redis>;
        eventEmitterMock = new EventEmitter() as jest.Mocked<EventEmitter>;
        mqttClientMock = mqtt.connect('mqtt://broker-url') as jest.Mocked<mqtt.MqttClient>;

        (FlowEngine as any).redis = redisMock;
        (FlowEngine as any).contextStore = redisMock;
        (FlowEngine as any).eventEmitter = eventEmitterMock;
        (FlowEngine as any).mqttClient = mqttClientMock;
    });

    it('should initialize flow context', async () => {
        await (FlowEngine as any).initFlowContext('tenant1', 'flow1');

        expect(redisMock.set).toHaveBeenCalledWith(
            'flow_context:tenant1:flow1',
            expect.any(String),
            'EX',
            86400
        );
    });

    // Add more tests for other methods...
});
