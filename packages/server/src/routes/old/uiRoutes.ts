import { Router, Request, Response } from 'express';
import { loadFlowDesign, saveFlowDesign } from '../../ui/flowDesigner.js';
import { logger } from '@mintflow/common';

const uiRouter: Router = Router();

// Define types for request body and parameters
interface FlowRequestBody {
    tenantId: string;
    flowId: string;
    flowDefinition: Record<string, any>;
}

interface FlowRequestParams {
    tenantId: string;
    flowId: string;
}

/**
 * Simulate a "UI route" where the user designs a flow in a front-end tool
 * that sends definitions to the server for storage or retrieval.
 */

// POST /ui/flow
// body: { tenantId, flowId, flowDefinition: { ... } }
const saveFlow: any = async (req: Request<{}, {}, FlowRequestBody>, res: Response) => {
    const { tenantId, flowId, flowDefinition } = req.body;

    if (!tenantId || !flowId || !flowDefinition) {
        return res.status(400).json({ error: 'tenantId, flowId, and flowDefinition are required' });
    }

    try {
        await saveFlowDesign(tenantId, flowId, flowDefinition);
        logger.info('[uiRoutes] Flow design saved', { tenantId, flowId });
        return res.json({ message: 'Flow design saved' });
    } catch (err: any) {
        logger.error('[uiRoutes] Error saving flow design', { error: err });
        return res.status(500).json({ error: err.message });
    }
};

uiRouter.post('/flow', saveFlow);

// // GET /ui/flow/:tenantId/:flowId
const getFlow: any = async (req: Request, res: Response) => {
    const { tenantId, flowId } = req.params;

    try {
        const flowDef = await loadFlowDesign(tenantId, flowId);
        if (!flowDef) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.json({ flowDefinition: flowDef });
    } catch (err: any) {
        logger.error('[uiRoutes] Error loading flow design', { error: err });
        return res.status(500).json({ error: err.message });
    }
};

// Register the route
uiRouter.get('/flow/:tenantId/:flowId', getFlow);

export default uiRouter;
