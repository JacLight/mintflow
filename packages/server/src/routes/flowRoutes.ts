import express, { Router } from 'express';
import { createFlow, getAllFlows, getFlowById, updateFlow, deleteFlow, startFlow, stopFlowRun, pauseFlowRun, stopAllFlowRuns, pauseAllFlowRuns, getFlowRuns } from './controllers/FlowController.js';
import { start } from 'repl';

const flowRouter: Router = express.Router();

flowRouter.post('/', createFlow);
flowRouter.get('/', getAllFlows);
flowRouter.get('/:flowId', getFlowById);
flowRouter.put('/:flowId', updateFlow);
flowRouter.delete('/:flowId', deleteFlow);
flowRouter.post('/:flowId/start', startFlow);
flowRouter.post('/:flowId/all/stop', stopAllFlowRuns);
flowRouter.post('/:flowId/all/pause', pauseAllFlowRuns);
flowRouter.post('/:flowId/runs/:flowRunId/stop', stopFlowRun);
flowRouter.post('/:flowId/runs/:flowRunId/pause', pauseFlowRun);
flowRouter.get('/:flowId/runs', getFlowRuns);

export default flowRouter;
