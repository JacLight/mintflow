import Bull from 'bull';
import axios from 'axios';
import { logger } from './logger';
import { CONFIG } from './config';
import { runIsolatedCode } from './sandbox';

/**
 * The main worker process:
 *  - For each tenant, we listen on queue_{tenantId}
 *  - Each job has { flowId, nodeId, code, functionName, input }
 *  - We run "runIsolatedCode(...)" to execute the snippet
 *  - Then we POST success/fail to FlowEngine
 */
async function main() {
    logger.info('[PureNodeRunner-Isolate] Starting up', { tenants: CONFIG.TENANTS });

    CONFIG.TENANTS.forEach((tenantId) => {
        const queueName = `queue_${tenantId}`;
        const queue = new Bull(queueName, {
            redis: {
                host: CONFIG.REDIS_HOST,
                port: CONFIG.REDIS_PORT
            }
        });

        // Process jobs concurrently (up to 5 jobs at a time)
        queue.process(5, async (job) => {
            logger.info('[PureNodeRunner-Isolate] Received job', {
                tenantId,
                jobId: job.id,
                data: job.data
            });
            const { flowId, nodeId, code, functionName, input } = job.data;
            if (!flowId || !nodeId || !code) {
                logger.error('[PureNodeRunner-Isolate] Missing flowId/nodeId/code in job');
                throw new Error('Invalid job payload');
            }

            try {
                const result = await runIsolatedCode(code, functionName, input);
                await notifyFlowEngineComplete(tenantId, flowId, nodeId, result);
                return result;
            } catch (err: any) {
                logger.error('[PureNodeRunner-Isolate] Error running isolated code', { error: err.message });
                await notifyFlowEngineFail(tenantId, flowId, nodeId, err.message);
                throw err;
            }
        });

        logger.info(`[PureNodeRunner-Isolate] Listening on queue="${queueName}"`);
    });
}

async function notifyFlowEngineComplete(tenantId: string, flowId: string, nodeId: string, result: any) {
    const url = `${CONFIG.FLOWENGINE_URL}/completeNode`;
    try {
        await axios.post(url, { tenantId, flowId, nodeId, result });
        logger.info('[PureNodeRunner-Isolate] Notified FlowEngine: node completed', { flowId, nodeId });
    } catch (err: any) {
        logger.error('[PureNodeRunner-Isolate] Error notifying completeNode', { error: err.message });
    }
}

async function notifyFlowEngineFail(tenantId: string, flowId: string, nodeId: string, errorMsg: string) {
    const url = `${CONFIG.FLOWENGINE_URL}/failNode`;
    try {
        await axios.post(url, { tenantId, flowId, nodeId, errorMsg });
        logger.info('[PureNodeRunner-Isolate] Notified FlowEngine: node failed', { flowId, nodeId });
    } catch (err: any) {
        logger.error('[PureNodeRunner-Isolate] Error notifying failNode', { error: err.message });
    }
}

main().catch((err) => {
    logger.error('[PureNodeRunner-Isolate] Fatal error in main()', { error: err });
    process.exit(1);
});
