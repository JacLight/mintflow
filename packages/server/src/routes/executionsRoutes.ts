import express, { Router } from 'express';
import {
    getAllFlowExecutions,
    getFlowExecutionById,
    getFlowExecutionStats,
    pauseFlowExecution,
    resumeFlowExecution,
    restartFlowExecution,
    cancelFlowExecution
} from './controllers/ExecutionsController.js';

const executionsRouter: Router = express.Router();

// Flow executions routes
executionsRouter.get('/', getAllFlowExecutions);
executionsRouter.get('/stats', getFlowExecutionStats);
executionsRouter.get('/:executionId', getFlowExecutionById);
executionsRouter.post('/:executionId/pause', pauseFlowExecution);
executionsRouter.post('/:executionId/resume', resumeFlowExecution);
executionsRouter.post('/:executionId/restart', restartFlowExecution);
executionsRouter.post('/:executionId/cancel', cancelFlowExecution);

export default executionsRouter;
