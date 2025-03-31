import { Router, Request, Response } from 'express';
import { FlowEngine } from '../../engine/FlowEngine.js';

const feRouter: Router = Router();

// POST /flowengine/completeNode
const completeNode: any = async (req: Request, res: Response) => {
    const { tenantId, flowId, flowRunId, nodeId, result } = req.body;
    if (!tenantId || !flowId || !nodeId) {
        return res.status(400).json({ error: 'tenantId, flowId, nodeId required' });
    }
    try {
        await FlowEngine.getInstance().completeExternalNode(tenantId, flowId, flowRunId, nodeId, result);
        res.json({ message: 'Node completed' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

feRouter.post('/completeNode', completeNode);

// POST /flowengine/failNode
const failedNode: any = async (req: Request, res: Response) => {
    const { tenantId, flowId, nodeId, flowRunId, errorMsg } = req.body;
    if (!tenantId || !flowId || !nodeId) {
        return res.status(400).json({ error: 'tenantId, flowId, nodeId required' });
    }
    try {
        await FlowEngine.getInstance().failNode(tenantId, flowId, flowRunId, nodeId, errorMsg || 'Unknown error');
        res.json({ message: 'Node failed' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
feRouter.post('/failNode', failedNode);

export default feRouter;
