import { Request, Response, Router } from "express";
import { TenantModel } from "../../models/TenantModel.js";
import { logger } from "@mintflow/common";

const tenantRouter: Router = Router();

const createTenant: any = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }
        const tenant = await TenantModel.create({ name, email, password, createdAt: new Date(), updatedAt: new Date() });
        return res.json({ tenant });
    } catch (err: any) {
        logger.error('[tenantRoutes] POST /tenant error', { error: err });
        return res.status(500).json({ error: err.message });
    }
}
tenantRouter.post('/create', createTenant);

const listTenants: any = async (req: Request, res: Response) => {
    try {
        const tenants = await TenantModel.find();
        return res.json({ tenants });
    } catch (err: any) {
        logger.error('[tenantRoutes] GET /tenant error', { error: err });
        return res.status(500).json({ error: err.message });
    }
}
tenantRouter.get('/list', listTenants);


const updateTenant: any = async (req: Request, res: Response) => {
    try {
        const { tenantId: name } = req.params;
        const { email, password } = req.body;
        const tenant = await TenantModel.findOne({ name });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        tenant.email = email;
        tenant.password = password;
        tenant.updatedAt = new Date();
        await tenant.save();
        return res.json({ tenant });
    } catch (err: any) {
        logger.error('[tenantRoutes] PUT /tenant/:tenantId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
}
tenantRouter.put('/:tenantId', updateTenant);


const getTenant: any = async (req: Request, res: Response) => {
    try {
        const { tenantId: name } = req.params;
        const tenant = await TenantModel.findOne({ name });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        return res.json({ tenant });
    } catch (err: any) {
        logger.error('[tenantRoutes] GET /tenant/:tenantId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
tenantRouter.get('/:tenantId', getTenant);

const deleteTenant: any = async (req: Request, res: Response) => {
    try {
        const { tenantId: name } = req.params;
        const tenant = await
            TenantModel.findOneAndDelete
                ({ name });
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        return res.json({ tenant });
    } catch (err: any) {
        logger.error('[tenantRoutes] DELETE /tenant/:tenantId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
tenantRouter.delete('/:tenantId', deleteTenant);

export default tenantRouter;