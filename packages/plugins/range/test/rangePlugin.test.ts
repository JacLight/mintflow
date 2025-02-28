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

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    it('should handle empty input data gracefully', async () => {
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, config);
        expect(result).toEqual({});
    });

    it('should handle invalid range values', async () => {
        const invalidConfig = {
            ...config,
            options: [
                {
                    source: 'flow',
                    name: 'temperature',
                    valueFrom: 10,
                    valueTto: 0,
                    newName: 'tempRange',
                    newValue: 'cold',
                },
            ],
        };
        mockFlowContext.get.mockReturnValue(5);
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, invalidConfig);
        expect(mockFlowContext.set).not.toHaveBeenCalled();
        expect(result).toEqual({});
    });

    it('should handle overlapping ranges correctly', async () => {
        const overlappingConfig = {
            ...config,
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
                    source: 'flow',
                    name: 'temperature',
                    valueFrom: 5,
                    valueTto: 15,
                    newName: 'tempRange',
                    newValue: 'warm',
                },
            ],
        };
        mockFlowContext.get.mockReturnValue(7);
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, overlappingConfig);
        expect(mockFlowContext.set).toHaveBeenCalledWith('tempRange', 'cold');
        expect(result).toEqual({});
    });

    it('should handle non-numeric input values', async () => {
        const nonNumericConfig = {
            ...config,
            options: [
                {
                    source: 'flow',
                    name: 'temperature',
                    valueFrom: 0,
                    valueTto: 10,
                    newName: 'tempRange',
                    newValue: 'cold',
                },
            ],
        };
        mockFlowContext.get.mockReturnValue('five');
        const input = { data: {} };
        const result = await rangePlugin.actions[0].execute(input, nonNumericConfig);
        expect(mockFlowContext.set).not.toHaveBeenCalled();
        expect(result).toEqual({});
    });

    it('should handle missing source values gracefully', async () => {
        const input = { data: { humidity: undefined } };
        const result = await rangePlugin.actions[0].execute(input, config);
        expect(result).toEqual({});
    });
});
