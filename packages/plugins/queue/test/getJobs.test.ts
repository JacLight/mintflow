import queuePlugin from '../src';
import Bull from 'bull';

// Mock Bull
jest.mock('bull');

describe('Queue Plugin - getJobs action', () => {
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
      getActive: jest.fn().mockResolvedValue([mockJob]),
      getCompleted: jest.fn().mockResolvedValue([mockJob]),
      getFailed: jest.fn().mockResolvedValue([mockJob]),
      getDelayed: jest.fn().mockResolvedValue([mockJob]),
      getPaused: jest.fn().mockResolvedValue([mockJob]),
      getWaitingCount: jest.fn().mockResolvedValue(1),
      getActiveCount: jest.fn().mockResolvedValue(1),
      getCompletedCount: jest.fn().mockResolvedValue(1),
      getFailedCount: jest.fn().mockResolvedValue(1),
      getDelayedCount: jest.fn().mockResolvedValue(1),
      getPausedCount: jest.fn().mockResolvedValue(1),
      count: jest.fn().mockResolvedValue(6),
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

  it('should get waiting jobs with pagination', async () => {
    const action = queuePlugin.actions.find(a => a.name === 'getJobs');
    expect(action).toBeDefined();

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
    expect(result.data.jobs[0].id).toBe('123');
  });
});
