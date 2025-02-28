import Bull from 'bull';
import axios from 'axios';
import { CONFIG, TENANTS } from './config';
import { logger } from './utils/logger';
import { handleNodeJob } from './handleNodeJob';

/**
 * This Node runner is a separate process from the Orchestrator. 
 * We consume from per-tenant queues named queue_{tenantId}.
 */

async function main() {
    logger.info('[NodeRunner] Starting up...', { tenants: TENANTS });

    // For each tenant, create a Bull queue consumer
    TENANTS.forEach((tenantId) => {
        const queueName = `queue_${tenantId}`;
        const queue = new Bull(queueName, {
            redis: {
                host: CONFIG.REDIS_HOST,
                port: CONFIG.REDIS_PORT
            }
        });

        // concurrency=5 or so, for demonstration
        queue.process(5, async (job) => {
            logger.info('[NodeRunner] Got job', {
                tenantId, jobId: job.id, data: job.data
            });

            const { nodeId, input, flowId } = job.data;
            if (!flowId || !nodeId) {
                logger.error('[NodeRunner] Missing flowId or nodeId', { jobId: job.id });
                return;  // we can fail, but let's just return
            }

            try {
                // call local node logic
                const result = await handleNodeJob({ nodeId, input });
                // On success, call FlowEngine to mark node completed
                await notifyFlowEngineCompletion(tenantId, flowId, nodeId, result);
                return result;
            } catch (err: any) {
                logger.error('[NodeRunner] Job error', { error: err.message, jobId: job.id });
                // Call FlowEngine to fail the node
                await notifyFlowEngineFailure(tenantId, flowId, nodeId, err.message);
                throw err;  // rethrow so Bull sees the job as failed
            }
        });

        logger.info(`[NodeRunner] Listening on queue="${queueName}"`);
    });
}

async function notifyFlowEngineCompletion(
    tenantId: string, flowId: string, nodeId: string, result: any
) {
    try {
        const url = `${CONFIG.FLOWENGINE_URL}/completeNode`;
        await axios.post(url, {
            tenantId, flowId, nodeId, result
        });
        logger.info('[NodeRunner] Notified FlowEngine: node completed', { nodeId, flowId });
    } catch (err: any) {
        logger.error('[NodeRunner] Error notifying completion', { error: err.message });
    }
}

async function notifyFlowEngineFailure(
    tenantId: string, flowId: string, nodeId: string, errorMsg: string
) {
    try {
        const url = `${CONFIG.FLOWENGINE_URL}/failNode`;
        await axios.post(url, {
            tenantId, flowId, nodeId, errorMsg
        });
        logger.info('[NodeRunner] Notified FlowEngine: node failed', { nodeId, flowId });
    } catch (err: any) {
        logger.error('[NodeRunner] Error notifying failure', { error: err.message });
    }
}

main().catch((err) => {
    logger.error('[NodeRunner] Fatal error in main()', { error: err });
    process.exit(1);
});
