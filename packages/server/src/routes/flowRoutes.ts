import express, { Router } from 'express';
import { createFlow, getAllFlows, getFlowById, updateFlow, deleteFlow } from './controllers/FlowController.js';

const flowRouter: Router = express.Router();

flowRouter.post('/', createFlow);
flowRouter.get('/', getAllFlows);
flowRouter.get('/:flowId', getFlowById);
flowRouter.put('/:flowId', updateFlow);
flowRouter.delete('/:flowId', deleteFlow);

export default flowRouter;
