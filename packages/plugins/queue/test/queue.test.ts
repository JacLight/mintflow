import queuePlugin from '../src';
import Bull from 'bull';

// Mock Bull
jest.mock('bull');

describe('Queue Plugin', () => {
  let mockQueue: any;
  let mockJob: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock job
    mockJob = {
      id: '123',
      name: 'testJob',
      data: { test: 'data' },
      opts: { priority: 1 },
      progress: jest.fn().mockReturnValue(0),
      returnvalue: null,
      stacktrace: [],
      timestamp: Date.now(),
      attemptsMade: 0,
      failedReason: null,
      finishedOn: null,
      processedOn: null,
      remove: jest.fn().mockResolvedValue(undefined)
    };

    // Setup mock queue
    mockQueue = {
      add: jest.fn().mockResolvedValue(mockJob),
      getJob: jest.fn().mockResolvedValue(mockJob),
      getWaiting: jest.fn().mockResolvedValue([mockJob]),
      getActive: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getFailed: jest.fn().mockResolvedValue([]),
      getDelayed: jest.fn().mockResolvedValue([]),
      getPaused: jest.fn().mockResolvedValue([]),
      getWaitingCount: jest.fn().mockResolvedValue(1),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
      getDelayedCount: jest.fn().mockResolvedValue(0),
      getPausedCount: jest.fn().mockResolvedValue(0),
      count: jest.fn().mockResolvedValue(1),
      empty: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn().mockResolvedValue(undefined),
      resume: jest.fn().mockResolvedValue(undefined),
      isPaused: jest.fn().mockResolvedValue(false),
      process: jest.fn(),
      on: jest.fn()
    };

    // Mock Bull constructor
    (Bull as jest.Mock).mockReturnValue(mockQueue);
  });

  describe('Plugin Configuration', () => {
    it('should have correct metadata', () => {
      expect(queuePlugin.name).toBe('Queue');
      expect(queuePlugin.id).toBe('queue');
      expect(queuePlugin.runner).toBe('node');
      expect(queuePlugin.actions.length).toBeGreaterThan(0);
    });
  });

  describe('addJob action', () => {
    it('should add a job to the queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'addJob');
      expect(action).toBeDefined();

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobName: 'testJob',
            data: { test: 'data' },
            options: { priority: 1 }
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(Bull).toHaveBeenCalledWith('testQueue', expect.any(Object));
      expect(mockQueue.add).toHaveBeenCalledWith('testJob', { test: 'data' }, { priority: 1 });
      expect(result.data).toBeDefined();
      expect(result.data.job).toBeDefined();
      expect(result.data.job.id).toBe('123');
    });

    it('should handle errors when adding a job', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'addJob');
      mockQueue.add.mockRejectedValue(new Error('Test error'));

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobName: 'testJob',
            data: { test: 'data' }
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(result.error).toBe('Test error');
    });
  });

  describe('getJob action', () => {
    it('should get a job by ID', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'getJob');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobId: '123'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.getJob).toHaveBeenCalledWith('123');
      expect(result.data).toBeDefined();
      expect(result.data.job).toBeDefined();
      expect(result.data.job.id).toBe('123');
    });

    it('should return error if job not found', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'getJob');
      mockQueue.getJob.mockResolvedValue(null);

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobId: '123'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain('not found');
    });
  });

  describe('getJobs action', () => {
    it('should get jobs with filtering', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'getJobs');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            status: 'waiting',
            start: 0,
            end: 10
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.getWaiting).toHaveBeenCalledWith(0, 10);
      expect(result.data).toBeDefined();
      expect(result.data.jobs).toHaveLength(1);
      expect(result.data.count).toBe(1);
    });

    it('should filter jobs by name', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'getJobs');
      mockQueue.getWaiting.mockResolvedValue([
        { ...mockJob, name: 'job1' },
        { ...mockJob, name: 'job2' }
      ]);

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            status: 'waiting',
            jobName: 'job1'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(result.data.jobs).toHaveLength(1);
      expect(result.data.count).toBe(1);
    });
  });

  describe('removeJob action', () => {
    it('should remove a job from the queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'removeJob');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobId: '123'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.getJob).toHaveBeenCalledWith('123');
      expect(mockJob.remove).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully removed');
    });
  });

  describe('clearQueue action', () => {
    it('should clear all jobs from the queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'clearQueue');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            status: 'all'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.count).toHaveBeenCalled();
      expect(mockQueue.empty).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully cleared');
      expect(result.data.removedCount).toBe(1);
    });

    it('should clear specific status jobs', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'clearQueue');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            status: 'waiting'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.getWaiting).toHaveBeenCalledWith(0, -1);
      expect(mockJob.remove).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully cleared waiting jobs');
    });
  });

  describe('pauseQueue action', () => {
    it('should pause a queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'pauseQueue');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.pause).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully paused');
    });
  });

  describe('resumeQueue action', () => {
    it('should resume a queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'resumeQueue');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.resume).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully resumed');
    });
  });

  describe('getQueueInfo action', () => {
    it('should get queue information', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'getQueueInfo');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.getWaitingCount).toHaveBeenCalled();
      expect(mockQueue.getActiveCount).toHaveBeenCalled();
      expect(mockQueue.getCompletedCount).toHaveBeenCalled();
      expect(mockQueue.getFailedCount).toHaveBeenCalled();
      expect(mockQueue.getDelayedCount).toHaveBeenCalled();
      expect(mockQueue.getPausedCount).toHaveBeenCalled();
      expect(mockQueue.isPaused).toHaveBeenCalled();
      
      expect(result.data).toBeDefined();
      expect(result.data.queueName).toBe('testQueue');
      expect(result.data.counts).toBeDefined();
      expect(result.data.counts.total).toBe(1);
      expect(result.data.isPaused).toBe(false);
    });
  });

  describe('registerProcessor action', () => {
    it('should register a processor function', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'registerProcessor');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            concurrency: 2,
            processorFunction: 'return job.data;'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.process).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully registered processor');
      expect(result.data.concurrency).toBe(2);
    });

    it('should register a processor for specific job name', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'registerProcessor');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobName: 'testJob',
            processorFunction: 'return job.data;'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.process).toHaveBeenCalledWith('testJob', 1, expect.any(Function));
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully registered processor');
    });
  });

  describe('subscribeToEvents action', () => {
    it('should subscribe to queue events with callback function', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'subscribeToEvents');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            events: ['completed', 'failed'],
            callbackFunction: 'console.log(eventType, jobData);'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.on).toHaveBeenCalledTimes(2);
      expect(mockQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(mockQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully subscribed to events');
      expect(result.data.events).toEqual(['completed', 'failed']);
    });

    it('should subscribe to queue events with webhook URL', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'subscribeToEvents');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            events: ['completed'],
            webhookUrl: 'https://example.com/webhook'
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully subscribed to events');
    });

    it('should return error if neither callback nor webhook provided', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'subscribeToEvents');

      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            events: ['completed']
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Either callbackFunction or webhookUrl must be provided');
    });
  });

  describe('createBatchJobs action', () => {
    it('should add multiple jobs to the queue', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'createBatchJobs');
      
      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobs: [
              { name: 'job1', data: { test: 1 } },
              { name: 'job2', data: { test: 2 } }
            ]
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith('job1', { test: 1 }, {});
      expect(mockQueue.add).toHaveBeenCalledWith('job2', { test: 2 }, {});
      expect(result.data).toBeDefined();
      expect(result.data.message).toContain('Successfully added 2 jobs');
      expect(result.data.jobs).toHaveLength(2);
    });

    it('should return error if no jobs provided', async () => {
      const action = queuePlugin.actions.find(a => a.name === 'createBatchJobs');
      
      const result = await action!.execute(
        {
          data: {
            queueName: 'testQueue',
            jobs: []
          }
        },
        { data: { redisHost: 'localhost' } }
      );

      expect(result.error).toBeDefined();
      expect(result.error).toContain('No jobs provided');
    });
  });
});
