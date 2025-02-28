import { ENV } from '../../src/config/env';

describe('ENV', () => {
    it('should load environment variables', () => {
        expect(ENV.PORT).toBeDefined();
        expect(ENV.NODE_ENV).toBeDefined();
        expect(ENV.LOG_LEVEL).toBeDefined();
        expect(ENV.DB_NAME).toBeDefined();
        expect(ENV.DB_PROVIDER).toBeDefined();
        expect(ENV.JWT_SECRET).toBeDefined();
    });

    // Add more tests for different environment variables...
});
