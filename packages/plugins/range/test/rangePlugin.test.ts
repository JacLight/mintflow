import rangePlugin from '../src/index';

describe('rangePlugin', () => {
    const mockFlowContext = {
        get: jest.fn(),
        set: jest.fn(),
    };

    const config = {
        flowContext: mockFlowContext,
        data: {
            options: [
                {
                    source: 'flow',
                    name: 'temperature',
                    valueFrom: 0,
                    valueTto: 10,
                    newName: 'tempRange',
                    newValue: 'cold',
                },
                {
                    source: 'data',
                    name: 'humidity',
                    valueFrom: 30,
                    valueTto: 60,
                    newName: 'humidityRange',
                    newValue: 'normal',
                },
            ],
        },
        options: [
            {
                source: 'flow',
                name: 'temperature',
                valueFrom: 0,
                valueTto: 10,
                newName: 'tempRange',
                newValue: 'cold',
            },
            {
                source: 'data',
                name: 'humidity',
                valueFrom: 30,
                valueTto: 60,
                newName: 'humidityRange',
                newValue: 'normal',
            },
        ],
    };

    it('should map flow context value to new value', async () => {
        mockFlowContext.get.mockReturnValue(5);
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, config);
        expect(mockFlowContext.set).toHaveBeenCalledWith('tempRange', 'cold');
        expect(result).toEqual({});
    });

    it('should map input data value to new value', async () => {
        const input = { data: { humidity: 45 } };
        const result = await rangePlugin.actions[0].execute(input, config);
        expect(result).toEqual({ humidityRange: 'normal' });
    });

    it('should not map value if it does not fall within range', async () => {
        mockFlowContext.get.mockReturnValue(15);
        const input = { data: { humidity: 25 } };
        const result = await rangePlugin.actions[0].execute(input, config);
        expect(mockFlowContext.set).not.toHaveBeenCalled();
        expect(result).toEqual({});
    });

    it('should handle missing newName and use original name', async () => {
        const customConfig = {
            ...config,
            data: {
                options: [
                    {
                        source: 'flow',
                        name: 'temperature',
                        valueFrom: 0,
                        valueTto: 10,
                        newValue: 'cold',
                    },
                ],
            },
            options: [
                {
                    source: 'flow',
                    name: 'temperature',
                    valueFrom: 0,
                    valueTto: 10,
                    newValue: 'cold',
                },
            ],
        };
        mockFlowContext.get.mockReturnValue(5);
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, customConfig);
        expect(mockFlowContext.set).toHaveBeenCalledWith('temperature', 'cold');
        expect(result).toEqual({});
    });
});
