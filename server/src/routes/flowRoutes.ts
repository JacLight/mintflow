// server/src/routes/flowRoutes.ts

import { Router } from 'express';
import { FlowModel } from '../models/FlowModel';
import { FlowEngine } from '../engine/FlowEngine';
import IORedis from 'ioredis';
import { ENV } from '../config/env';
import { logger } from '../utils/logger';

const flowRouter = Router();

// For Python tasks bridging (unchanged if you like)
const redisClient = new IORedis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
});

/**
 * 1) CREATE OR UPDATE A FLOW
 * POST /flow
 * body: { tenantId, flowId, definition }
 */
// flowRouter.post('/', async (req, res) => {
//     try {
//         const { tenantId, flowId, definition } = req.body;
//         if (!tenantId || !flowId || !definition) {
//             return res.status(400).json({ error: 'tenantId, flowId, and definition are required' });
//         }
//         // Upsert flow in DB
//         let flow = await FlowModel.findOne({ tenantId, flowId });
//         if (!flow) {
//             flow = new FlowModel({ tenantId, flowId, definition, status: 'draft', logs: [] });
//         } else {
//             flow.definition = definition;
//         }
//         await flow.save();
//         return res.json({ message: 'Flow saved', flow });
//     } catch (err: any) {
//         logger.error('[flowRoutes] POST /flow error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 2) LIST FLOWS FOR A TENANT
//  * GET /flow?tenantId=abc
//  */
// flowRouter.get('/', async (req, res) => {
//     try {
//         const { tenantId } = req.query;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         const flows = await FlowModel.find({ tenantId });
//         return res.json({ flows });
//     } catch (err: any) {
//         logger.error('[flowRoutes] GET /flow error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 3) GET FLOW DETAILS
//  * GET /flow/:flowId?tenantId=abc
//  */
// flowRouter.get('/:flowId', async (req, res) => {
//     try {
//         const { flowId } = req.params;
//         const { tenantId } = req.query;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         const flow = await FlowModel.findOne({ tenantId, flowId });
//         if (!flow) {
//             return res.status(404).json({ error: 'Flow not found' });
//         }
//         return res.json({ flow });
//     } catch (err: any) {
//         logger.error('[flowRoutes] GET /flow/:flowId error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 4) UPDATE FLOW
//  * PUT /flow/:flowId?tenantId=abc
//  * body: { definition? }
//  */
// flowRouter.put('/:flowId', async (req, res) => {
//     try {
//         const { flowId } = req.params;
//         const { tenantId } = req.query;
//         const { definition } = req.body;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         let flow = await FlowModel.findOne({ tenantId, flowId });
//         if (!flow) {
//             return res.status(404).json({ error: 'Flow not found' });
//         }
//         if (definition) {
//             flow.definition = definition;
//         }
//         await flow.save();
//         return res.json({ message: 'Flow updated', flow });
//     } catch (err: any) {
//         logger.error('[flowRoutes] PUT /flow/:flowId error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 5) DELETE FLOW
//  * DELETE /flow/:flowId?tenantId=abc
//  */
// flowRouter.delete('/:flowId', async (req, res) => {
//     try {
//         const { flowId } = req.params;
//         const { tenantId } = req.query;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         const flow = await FlowModel.findOneAndDelete({ tenantId, flowId });
//         if (!flow) {
//             return res.status(404).json({ error: 'Flow not found or already deleted' });
//         }
//         return res.json({ message: 'Flow deleted' });
//     } catch (err: any) {
//         logger.error('[flowRoutes] DELETE /flow/:flowId error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 6) RUN FLOW
//  * POST /flow/:flowId/run?tenantId=abc
//  */
// flowRouter.post('/:flowId/run', async (req, res) => {
//     try {
//         const { flowId } = req.params;
//         const { tenantId } = req.query;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         const flow = await FlowEngine.runFlow(String(tenantId), String(flowId));
//         return res.json({ message: 'Flow run started', flow });
//     } catch (err: any) {
//         logger.error('[flowRoutes] POST /flow/:flowId/run error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

// /**
//  * 7) GET FLOW LOGS
//  * GET /flow/:flowId/logs?tenantId=abc
//  */
// flowRouter.get('/:flowId/logs', async (req, res) => {
//     try {
//         const { flowId } = req.params;
//         const { tenantId } = req.query;
//         if (!tenantId) {
//             return res.status(400).json({ error: 'tenantId is required' });
//         }
//         const flow = await FlowModel.findOne({ tenantId, flowId });
//         if (!flow) {
//             return res.status(404).json({ error: 'Flow not found' });
//         }
//         return res.json({ logs: flow.logs, status: flow.status });
//     } catch (err: any) {
//         logger.error('[flowRoutes] GET /flow/:flowId/logs error', { error: err });
//         return res.status(500).json({ error: err.message });
//     }
// });

export default flowRouter;
