// server/src/routes/listenerRoutes.ts
import { Router, Request, Response } from 'express';
import { FlowEngine } from '../engine/FlowEngine'; // your advanced flow engine

const listenerRouter = Router();

// e.g. GET or POST, depending on your design
// listenerRouter.all('/:tenantId/:flowId/:nodeId', async (req: Request, res: Response) => {
//     const { tenantId, flowId, nodeId } = req.params;

//     try {
//         // FlowEngine checks if there's a node with type= "httpListener" 
//         // and status= "waiting" or "listening" for that tenant/flow/node
//         const responseData = await FlowEngine.handleHttpListenerNode(tenantId, flowId, nodeId, req);

//         // If handleHttpListenerNode resolves, we respond with the data
//         if (responseData) {
//             res.json(responseData);
//         } else {
//             // if handleHttpListenerNode returned null or something
//             res.status(404).json({ error: 'No active listener node found or node is not in waiting state' });
//         }
//     } catch (err: any) {
//         if (err.message === 'TIMEOUT') {
//             return res.status(504).json({ error: 'Node did not respond in time' });
//         }
//         res.status(500).json({ error: err.message });
//     }
// });

export default listenerRouter;
