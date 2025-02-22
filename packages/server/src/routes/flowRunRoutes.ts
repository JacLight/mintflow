import express, { Router } from 'express';
import { getAllFlowRuns, getFlowRunById, startFlowRun } from './controllers/FlowRunController.js';

const flowRunRouter: Router = express.Router();

flowRunRouter.post('/', startFlowRun);
flowRunRouter.get('/', getAllFlowRuns);
flowRunRouter.get('/:flowRunId', getFlowRunById);

export default flowRunRouter;
