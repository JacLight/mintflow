import { Router } from 'express';
import { getNode, getNodes, runNode } from './controllers/NodeController.js';

const nodeRouter: Router = Router();

nodeRouter.get('/all', getNodes);
nodeRouter.get('/:nodeId', getNode);
nodeRouter.post('/:nodeId/run', runNode);

export default nodeRouter;
