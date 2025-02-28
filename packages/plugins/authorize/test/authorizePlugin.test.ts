import authorizePlugin from '../src/index';

describe('authorizePlugin', () => {
    const mockFlowContext = {
        generateResumeUrl: jest.fn(),
        pause: jest.fn()
    };

    const mockConfig = {
        flowContext: mockFlowContext,
        executionType: 'BEGIN',
        resumePayload: {
            queryParams: {}
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFlowContext.generateResumeUrl.mockImplementation(async ({ queryParams }) => {
            return `https://example.com/authorize?action=${queryParams.action}`;
        });
    });

    describe('create_authorization_links action', () => {
        it('should generate authorization links', async () => {
            const input = { data: {} };
            const result = await authorizePlugin.actions[0].execute(input, mockConfig);

            expect(mockFlowContext.generateResumeUrl).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                authorizeLink: 'https://example.com/authorize?action=authorize',
                rejectLink: 'https://example.com/authorize?action=reject'
            });
        });

        it('should provide fallback links when generateResumeUrl is not available', async () => {
            const input = { data: {} };
            const configWithoutFlowContext = { ...mockConfig, flowContext: undefined };
            const result = await authorizePlugin.actions[0].execute(input, configWithoutFlowContext);

            expect(result).toEqual({
                authorizeLink: 'https://example.com/authorize?action=authorize',
                rejectLink: 'https://example.com/authorize?action=reject'
            });
        });
    });

    describe('wait_for_authorization action', () => {
        it('should pause execution on initial run', async () => {
            const input = { data: { testKey: 'testValue' } };
            const result = await authorizePlugin.actions[1].execute(input, mockConfig);

            expect(mockFlowContext.pause).toHaveBeenCalledTimes(1);
            expect(mockFlowContext.pause).toHaveBeenCalledWith({
                pauseMetadata: {
                    type: 'WEBHOOK',
                    response: {}
                }
            });
            expect(result).toEqual({
                testKey: 'testValue',
                authorized: true
            });
        });

        it('should handle resume with authorize action', async () => {
            const input = { data: { testKey: 'testValue' } };
            const resumeConfig = {
                ...mockConfig,
                executionType: 'RESUME',
                resumePayload: {
                    queryParams: {
                        action: 'authorize'
                    }
                }
            };
            const result = await authorizePlugin.actions[1].execute(input, resumeConfig);

            expect(mockFlowContext.pause).not.toHaveBeenCalled();
            expect(result).toEqual({
                testKey: 'testValue',
                authorized: true
            });
        });

        it('should handle resume with reject action', async () => {
            const input = { data: { testKey: 'testValue' } };
            const resumeConfig = {
                ...mockConfig,
                executionType: 'RESUME',
                resumePayload: {
                    queryParams: {
                        action: 'reject'
                    }
                }
            };
            const result = await authorizePlugin.actions[1].execute(input, resumeConfig);

            expect(mockFlowContext.pause).not.toHaveBeenCalled();
            expect(result).toEqual({
                testKey: 'testValue',
                authorized: false
            });
        });
    });
});
