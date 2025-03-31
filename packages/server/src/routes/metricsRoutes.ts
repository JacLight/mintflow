import express, { Router } from 'express';
import {
    getUsageStats,
    getUsageByPeriod,
    getCostStats,
    getCostByPeriod
} from './controllers/MetricsController.js';

const metricsRouter: Router = express.Router();

// Usage routes
metricsRouter.get('/usage', getUsageStats);
metricsRouter.get('/usage/:period', getUsageByPeriod);

// Cost routes
metricsRouter.get('/cost', getCostStats);
metricsRouter.get('/cost/:period', getCostByPeriod);

export default metricsRouter;
