import { FlowService } from '../../src/services/FlowService';
import { DatabaseService } from '../../src/services/DatabaseService';
import { TenantService } from '../../src/services/TenantService';

jest.mock('../../src/services/DatabaseService');
jest.mock('../../src/services/TenantService');

describe('FlowService', () => {
    let flowService: FlowService;
    let dbMock: jest.Mocked<DatabaseService>;
    let tenantServiceMock: jest.Mocked<TenantService>;

    beforeEach(() => {
        dbMock = new DatabaseService() as jest.Mocked<DatabaseService>;
        tenantServiceMock = new TenantService() as jest.Mocked<TenantService>;
        flowService = new FlowService();
        (flowService as any).db = dbMock;
        (flowService as any).tenantService = tenantServiceMock;
    });

    it('should create a flow', async () => {
        tenantServiceMock.getTenantById.mockResolvedValue({ tenantId: '1', name: 'Tenant1' });
        dbMock.create.mockResolvedValue({ flowId: '1', tenantId: '1', tenantName: 'Tenant1' });

        const data = { tenantId: '1', name: 'Test Flow' };
        const result = await flowService.createFlow(data);

        expect(result).toEqual({ flowId: '1', tenantId: '1', tenantName: 'Tenant1' });
        expect(dbMock.create).toHaveBeenCalledWith('flow', { tenantId: '1', tenantName: 'Tenant1', name: 'Test Flow' });
    });

    // Add more tests for other methods...
});
