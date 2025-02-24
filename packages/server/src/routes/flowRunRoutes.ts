import express, { Router } from 'express';
import { getAllFlowRuns, getFlowRunById, startFlowRun, deleteFlowRun } from './controllers/FlowRunController.js';

const flowRunRouter: Router = express.Router();

flowRunRouter.post('/', startFlowRun);
flowRunRouter.get('/', getAllFlowRuns);
flowRunRouter.get('/:flowRunId', getFlowRunById);
flowRunRouter.delete('/:flowRunId', deleteFlowRun);

export default flowRunRouter;
