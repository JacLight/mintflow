// server/src/routes/flowRoutes.ts

import { Router, Request, Response } from 'express';
import Redis from 'ioredis';
import { ENV } from '../../config/env.js';
import { FlowModel } from '../../models/FlowModel.js';
import { logger } from '@mintflow/common';
import { FlowEngine } from '../../engine/FlowEngine.js';

const flowRouter: Router = Router();
const aRedis: any = Redis

// For Python tasks bridging (unchanged if you like)
const redisClient = new aRedis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
});

/**
 * 1) CREATE OR UPDATE A FLOW
 * POST /flow
 * body: { tenantId, flowId, definition }
 */
const createFlow: any = async (req: Request, res: Response) => {
    try {
        const { tenantId, flowId, definition } = req.body;
        if (!tenantId || !flowId || !definition) {
            return res.status(400).json({ error: 'tenantId, flowId, and definition are required' });
        }
        // Upsert flow in DB
        let flow = await FlowModel.findOne({ tenantId, flowId });
        if (!flow) {
            flow = new FlowModel({ tenantId, flowId, definition, status: 'draft', logs: [] });
        } else {
            flow.definition = definition;
        }
        await flow.save();
        return res.json({ message: 'Flow saved', flow });
    } catch (err: any) {
        logger.error('[flowRoutes] POST /flow error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.post('/create', createFlow);

/**
 * 2) LIST FLOWS FOR A TENANT
 * GET /flow?tenantId=abc
 */

const listFlows: any = async (req: Request, res: Response) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flows = await FlowModel.find({ tenantId });
        return res.json({ flows });
    } catch (err: any) {
        logger.error('[flowRoutes] GET /flow error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.get('/list', listFlows);

/**
 * 3) GET FLOW DETAILS
 * GET /flow/:flowId?tenantId=abc
 */
const getFlow: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flow = await FlowModel.findOne({ tenantId, flowId });
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.json({ flow });
    } catch (err: any) {
        logger.error('[flowRoutes] GET /flow/:flowId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.get('/list:flowId', getFlow);

/**
 * 4) UPDATE FLOW
 * PUT /flow/:flowId?tenantId=abc
 * body: { definition? }
 */
const updateFlow: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        const { definition } = req.body;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        let flow = await FlowModel.findOne({ tenantId, flowId });
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        if (definition) {
            flow.definition = definition;
        }
        await flow.save();
        return res.json({ message: 'Flow updated', flow });
    } catch (err: any) {
        logger.error('[flowRoutes] PUT /flow/:flowId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.put('/update/:flowId', updateFlow);

/**
 * 5) DELETE FLOW
 * DELETE /flow/:flowId?tenantId=abc
 */
const deleteFlow: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flow = await FlowModel.findOneAndDelete({ tenantId, flowId });
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found or already deleted' });
        }
        return res.json({ message: 'Flow deleted' });
    } catch (err: any) {
        logger.error('[flowRoutes] DELETE /flow/:flowId error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.delete('/delete:flowId', deleteFlow);

/**
 * 6) RUN FLOW
 * POST /flow/:flowId/run?tenantId=abc
 */
const runFlow: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flow = await FlowEngine.runFlow(String(tenantId), String(flowId));
        return res.json({ message: 'Flow run started', flow });
    } catch (err: any) {
        logger.error('[flowRoutes] POST /flow/:flowId/run error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.post('/:flowId/run', runFlow);

const stopFlow: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flow = await FlowEngine.stopFlow(String(tenantId), String(flowId));
        return res.json({ message: 'Flow stopped', flow });
    } catch (err: any) {
        logger.error('[flowRoutes] POST /flow/:flowId/stop error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.post('/:flowId/stop', stopFlow);

/**
 * 7) GET FLOW LOGS
 * GET /flow/:flowId/logs?tenantId=abc
 */
const getFlowLogs: any = async (req: Request, res: Response) => {
    try {
        const { flowId } = req.params;
        const { tenantId } = req.query;
        if (!tenantId) {
            return res.status(400).json({ error: 'tenantId is required' });
        }
        const flow = await FlowModel.findOne({ tenantId, flowId });
        if (!flow) {
            return res.status(404).json({ error: 'Flow not found' });
        }
        return res.json({ logs: flow.logs, status: flow.status });
    } catch (err: any) {
        logger.error('[flowRoutes] GET /flow/:flowId/logs error', { error: err });
        return res.status(500).json({ error: err.message });
    }
};
flowRouter.get('/:flowId/logs', getFlowLogs);

export default flowRouter;
