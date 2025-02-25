// TimerQueueService.ts
import Queue from 'bull';
import { logger } from '@mintflow/common';
import { NodeExecutorService } from './NodeExecutorService.js';
import { ENV } from '../config/env.js';

export interface TimerJob {
    type: 'cron' | 'interval' | 'timeout';
    flowRunId: string;
    nodeId: string;
    data: any;
    expression?: string;  // for cron
    interval?: number;    // for interval
    timeout?: number;     // for timeout
    endDate?: Date;
}

export class TimerQueueService {
    private static instance: TimerQueueService;
    private timerQueue: Queue.Queue<TimerJob>;
    private nodeExecutor: NodeExecutorService;

    private constructor() {
        this.timerQueue = new Queue<TimerJob>('timer-events', {
            redis: {
                host: ENV.REDIS_HOST,
                port: ENV.REDIS_PORT,
                password: ENV.REDIS_PASSWORD
            },
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: false,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        });

        this.nodeExecutor = NodeExecutorService.getInstance();
        this.setupQueueProcessor();
        this.setupQueueErrorHandling();
    }

    static getInstance(): TimerQueueService {
        if (!TimerQueueService.instance) {
            TimerQueueService.instance = new TimerQueueService();
        }
        return TimerQueueService.instance;
    }

    private setupQueueProcessor(): void {
        this.timerQueue.process(async (job: any) => {
            const { flowRunId, nodeId, data } = job.data;
            try {
                if (job.id.endsWith(':end')) {
                    logger.info('End job processing', { flowRunId, nodeId });
                    this.cleanupTimer(flowRunId, nodeId);
                    return { success: true };
                }
                await this.nodeExecutor.resumeScheduledTask(flowRunId, nodeId, data);
                return { success: true };
            } catch (error: any) {
                logger.error('Timer job processing failed', {
                    jobId: job.id,
                    flowRunId,
                    nodeId,
                    error: error.message
                });
                throw error; // This will trigger retry based on job options
            }
        });
    }

    private setupQueueErrorHandling(): void {
        this.timerQueue.on('error', (error) => {
            logger.error('Timer queue error', { error });
        });

        this.timerQueue.on('failed', (job, error) => {
            logger.error('Timer job failed', {
                jobId: job.id,
                attempts: job.attemptsMade,
                error
            });
        });
    }

    private getJobKey(flowRunId: string, nodeId: string): string {
        return `timer:${flowRunId}:${nodeId}`;
    }

    async scheduleTimer(job: TimerJob): Promise<string> {
        const jobKey = this.getJobKey(job.flowRunId, job.nodeId);

        // Clean up any existing timer for this node
        await this.cleanupTimer(job.flowRunId, job.nodeId);

        switch (job.type) {
            case 'cron':
                if (!job.expression) {
                    throw new Error('Cron expression is required for cron jobs');
                }
                const repeatableJob = await this.timerQueue.add(
                    job,
                    {
                        repeat: { cron: job.expression },
                        jobId: jobKey
                    }
                );
                await this.scheduleEndDate(jobKey, job);
                return repeatableJob.id as string;

            case 'interval':
                if (!job.interval) {
                    throw new Error('Interval is required for interval jobs');
                }
                const intervalJob = await this.timerQueue.add(
                    job,
                    {
                        repeat: { every: job.interval * 1000 },
                        jobId: jobKey
                    }
                );
                await this.scheduleEndDate(jobKey, job);
                return intervalJob.id as string;

            case 'timeout':
                if (!job.timeout) {
                    throw new Error('Timeout value is required for timeout jobs');
                }
                const timeoutJob = await this.timerQueue.add(
                    job,
                    {
                        delay: job.timeout * 1000,
                        jobId: jobKey
                    }
                );
                return timeoutJob.id as string;

            default:
                throw new Error(`Unsupported timer type: ${job.type}`);
        }
    }

    async scheduleEndDate(jobKey, job,) {
        if (job.endDate) {
            const endDate = new Date(job.endDate);
            if (endDate.getTime() <= Date.now()) {
                logger.info('End date is in the past, skipping scheduling end job', {
                    jobKey,
                    endDate: job.endDate
                });
                return;
            }
            await this.timerQueue.add(
                job,
                {
                    delay: endDate.getTime() - Date.now(),
                    jobId: `${jobKey}:end`
                }
            );
        }
    }

    async cleanupTimer(flowRunId: string, nodeId: string): Promise<void> {
        const jobKey = this.getJobKey(flowRunId, nodeId);

        // Remove any repeatable jobs
        const repeatableJobs = await this.timerQueue.getRepeatableJobs();
        const matchingRepeatableJob = repeatableJobs.find(job => job.key.includes(jobKey));
        if (matchingRepeatableJob) {
            await this.timerQueue.removeRepeatableByKey(matchingRepeatableJob.key);
        }

        // Remove any delayed/pending jobs
        const pendingJobs = await this.timerQueue.getJobs(['delayed', 'waiting']);
        const matchingJobs = pendingJobs.filter(job => job.data.flowRunId === flowRunId && job.data.nodeId === nodeId);
        await Promise.all(matchingJobs.map(job => job.remove()));
    }

    async cleanup(): Promise<void> {
        await this.timerQueue.close();
    }
}
