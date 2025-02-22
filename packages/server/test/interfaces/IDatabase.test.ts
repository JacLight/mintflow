import { IDatabaseProvider } from '../../src/interfaces/IDatabase';

describe('IDatabaseProvider', () => {
    it('should define the required methods', () => {
        const databaseProvider: IDatabaseProvider = {
            connect: jest.fn(),
            createTenant: jest.fn(),
        };

        expect(databaseProvider.connect).toBeDefined();
        expect(databaseProvider.createTenant).toBeDefined();
    });
});
