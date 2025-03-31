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
  });

  describe('subscribeToEvents action', () => {
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
