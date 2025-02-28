import { IVectorDB } from '../../src/interfaces/IVectorDB';

describe('IVectorDB', () => {
    it('should define the required methods', () => {
        const vectorDB: IVectorDB = {
            initSchema: jest.fn(),
            storeVector: jest.fn(),
            searchByVector: jest.fn(),
            deleteById: jest.fn(),
            updateById: jest.fn(),
        };

        expect(vectorDB.initSchema).toBeDefined();
        expect(vectorDB.storeVector).toBeDefined();
        expect(vectorDB.searchByVector).toBeDefined();
        expect(vectorDB.deleteById).toBeDefined();
        expect(vectorDB.updateById).toBeDefined();
    });
});
