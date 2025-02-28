import { QueueManager } from "./queueManager.js";

/**
 * Helper function to enqueue a job for a specific tenant's queue.
 */
export async function enqueueJob(tenantId: string, jobData: any) {
    const qm = QueueManager.getInstance();
    const queue = qm.getTenantQueue(tenantId);
    // In real usage, you might add attempts/backoff
    return queue.add(jobData);
}
