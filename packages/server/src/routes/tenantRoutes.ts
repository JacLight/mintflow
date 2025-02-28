import { createTenant, getAllTenants, getTenantById, updateTenant, deleteTenant } from './controllers/TenantController.js';
import express, { Router } from 'express';

const tenantRouter: Router = express.Router();

tenantRouter.post('/', createTenant);
tenantRouter.get('/', getAllTenants);
tenantRouter.get('/:tenantId', getTenantById);
tenantRouter.put('/:tenantId', updateTenant);
tenantRouter.delete('/:tenantId', deleteTenant);

export default tenantRouter;
