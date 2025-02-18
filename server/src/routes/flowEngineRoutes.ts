import { Router, Request, Response, NextFunction } from 'express';
import { FlowEngine } from '../engine/FlowEngine'; // your big engine file

const feRouter = Router();

// POST /flowengine/completeNode
// feRouter.post('/completeNode', async (req: Request, res: Response) => {
//     const { tenantId, flowId, nodeId, result } = req.body;
//     if (!tenantId || !flowId || !nodeId) {
//         return res.status(400).json({ error: 'tenantId, flowId, nodeId required' });
//     }
//     try {
//         await FlowEngine.completeNode(tenantId, flowId, nodeId, result);
//         res.json({ message: 'Node completed' });
//     } catch (err: any) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // POST /flowengine/failNode
// feRouter.post('/failNode', async (req: Request, res: Response) => {
//     const { tenantId, flowId, nodeId, errorMsg } = req.body;
//     if (!tenantId || !flowId || !nodeId) {
//         return res.status(400).json({ error: 'tenantId, flowId, nodeId required' });
//     }
//     try {
//         await FlowEngine.failNode(tenantId, flowId, nodeId, errorMsg || 'Unknown error');
//         res.json({ message: 'Node failed' });
//     } catch (err: any) {
//         res.status(500).json({ error: err.message });
//     }
// });

export default feRouter;
