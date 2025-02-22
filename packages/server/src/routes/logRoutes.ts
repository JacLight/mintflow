import { createLog, getAllLogs, getLogsByFlow, deleteLog } from './controllers/LogController.js';
import express, { Router } from 'express';

const logRouter: Router = express.Router();

logRouter.post('/', createLog);
logRouter.get('/', getAllLogs);
logRouter.get('/flow/:flowId', getLogsByFlow);
logRouter.delete('/:logId', deleteLog);

export default logRouter;
