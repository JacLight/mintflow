/**
 * Queue Plugin for MintFlow
 * 
 * A robust queue system powered by Bull and Redis for managing data flow,
 * processing order, and job scheduling in workflows.
 */

import Bull, { Queue, Job, JobOptions } from 'bull';

interface QueueConfig {
  redisUrl?: string;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  redisUsername?: string;
  redisDb?: number;
  prefix?: string;
}

interface QueueResponse {
  data?: any;
  error?: string;
}

// Default Redis connection options
const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_DB = 0;
const DEFAULT_PREFIX = 'mintflow';

// Cache for queue instances to avoid creating multiple instances of the same queue
const queueInstances: Record<string, Queue> = {};

/**
 * Creates a Bull queue instance with the given name and configuration
 */
function createQueue(queueName: string, config: QueueConfig): Queue {
  // Check if queue instance already exists
  const cacheKey = `${config.prefix || DEFAULT_PREFIX}:${queueName}`;
  if (queueInstances[cacheKey]) {
    return queueInstances[cacheKey];
  }

  // Create Redis connection options
  let redisConfig: any;
  
  if (config.redisUrl) {
    // Use Redis URL if provided
    redisConfig = config.redisUrl;
  } else {
    // Use individual connection parameters
    redisConfig = {
      host: config.redisHost || DEFAULT_REDIS_HOST,
      port: config.redisPort || DEFAULT_REDIS_PORT,
      db: config.redisDb || DEFAULT_REDIS_DB,
      password: config.redisPassword,
      username: config.redisUsername
    };
  }

  // Create and cache the queue instance
  const queue = Bull(queueName, {
    prefix: config.prefix || DEFAULT_PREFIX,
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: false,
      removeOnFail: false
    }
  });

  queueInstances[cacheKey] = queue;
  return queue;
}

/**
 * Closes all queue connections
 */
async function closeAllQueues(): Promise<void> {
  const closePromises = Object.values(queueInstances).map(queue => queue.close());
  await Promise.all(closePromises);
  Object.keys(queueInstances).forEach(key => delete queueInstances[key]);
}

/**
 * Formats job data for response
 */
function formatJobData(job: Job): any {
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    opts: job.opts,
    progress: job.progress(),
    returnvalue: job.returnvalue,
    stacktrace: job.stacktrace,
    timestamp: job.timestamp,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
    state: job.finishedOn ? 'completed' : (job.processedOn ? 'active' : 'waiting')
  };
}

const queuePlugin = {
  name: "Queue",
  icon: "FaListOl",
  description: "Robust queue system powered by Bull and Redis for managing data flow, processing order, and job scheduling",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
  id: "queue",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      redisUrl: {
        type: "string",
        title: "Redis URL",
        description: "Redis connection URL (e.g., redis://user:password@host:port/db)"
      },
      redisHost: {
        type: "string",
        title: "Redis Host",
        description: "Redis server hostname",
        default: "127.0.0.1"
      },
      redisPort: {
        type: "number",
        title: "Redis Port",
        description: "Redis server port",
        default: 6379
      },
      redisPassword: {
        type: "string",
        title: "Redis Password",
        description: "Redis server password",
        format: "password"
      },
      redisUsername: {
        type: "string",
        title: "Redis Username",
        description: "Redis server username"
      },
      redisDb: {
        type: "number",
        title: "Redis Database",
        description: "Redis database number",
        default: 0
      },
      prefix: {
        type: "string",
        title: "Queue Prefix",
        description: "Prefix for queue names in Redis",
        default: "mintflow"
      }
    }
  },
  outputSchema: {
    type: "object",
    properties: {
      data: {
        type: "object"
      },
      error: {
        type: "string"
      }
    }
  },
  exampleInput: {
    redisHost: "127.0.0.1",
    redisPort: 6379,
    redisDb: 0,
    prefix: "mintflow"
  },
  exampleOutput: {
    data: {
      status: "ok"
    }
  },
  documentation: "https://github.com/mintflow/plugins/queue",
  method: "exec",
  actions: [
    {
      name: 'addJob',
      displayName: 'Add Job',
      description: 'Add a job to a queue with optional scheduling and processing options',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to add the job to"
          },
          jobName: {
            type: "string",
            title: "Job Name",
            description: "Name of the job (useful for job identification and filtering)"
          },
          data: {
            type: "object",
            title: "Job Data",
            description: "The data to be processed by the job"
          },
          options: {
            type: "object",
            title: "Job Options",
            description: "Advanced job options",
            properties: {
              priority: {
                type: "number",
                title: "Priority",
                description: "Priority level (1-MAX_INT, where 1 is highest)",
                default: 0
              },
              delay: {
                type: "number",
                title: "Delay",
                description: "Delay in milliseconds before the job is processed",
                default: 0
              },
              attempts: {
                type: "number",
                title: "Attempts",
                description: "Number of attempts to retry on failure",
                default: 1
              },
              backoff: {
                type: "object",
                title: "Backoff",
                description: "Backoff settings for retries",
                properties: {
                  type: {
                    type: "string",
                    title: "Type",
                    description: "Backoff type",
                    enum: ["fixed", "exponential"],
                    default: "exponential"
                  },
                  delay: {
                    type: "number",
                    title: "Delay",
                    description: "Delay in milliseconds for backoff",
                    default: 1000
                  }
                }
              },
              timeout: {
                type: "number",
                title: "Timeout",
                description: "Timeout in milliseconds for job processing",
                default: 0
              },
              removeOnComplete: {
                type: "boolean",
                title: "Remove on Complete",
                description: "Whether to remove the job when it's completed",
                default: false
              },
              removeOnFail: {
                type: "boolean",
                title: "Remove on Fail",
                description: "Whether to remove the job when it fails",
                default: false
              },
              jobId: {
                type: "string",
                title: "Job ID",
                description: "Custom job ID (if not provided, one will be generated)"
              },
              repeat: {
                type: "object",
                title: "Repeat",
                description: "Job repetition settings",
                properties: {
                  cron: {
                    type: "string",
                    title: "Cron",
                    description: "Cron expression for job scheduling"
                  },
                  every: {
                    type: "number",
                    title: "Every",
                    description: "Repeat every n milliseconds"
                  },
                  limit: {
                    type: "number",
                    title: "Limit",
                    description: "Maximum number of repetitions"
                  },
                  startDate: {
                    type: "string",
                    title: "Start Date",
                    description: "Date when the repetition should start"
                  },
                  endDate: {
                    type: "string",
                    title: "End Date",
                    description: "Date when the repetition should end"
                  },
                  tz: {
                    type: "string",
                    title: "Timezone",
                    description: "Timezone for the cron expression"
                  }
                }
              }
            }
          }
        },
        required: ["queueName", "data"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName, jobName = 'default', data, options = {} } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Add job to queue
          const job = await queue.add(jobName, data, options);
          
          return { 
            data: { 
              message: `Successfully added job to queue '${queueName}'`,
              job: formatJobData(job)
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getJob',
      displayName: 'Get Job',
      description: 'Get information about a specific job by ID',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue containing the job"
          },
          jobId: {
            type: "string",
            title: "Job ID",
            description: "The ID of the job to retrieve"
          }
        },
        required: ["queueName", "jobId"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName, jobId } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Get job by ID
          const job = await queue.getJob(jobId);
          
          if (!job) {
            return { error: `Job with ID ${jobId} not found in queue '${queueName}'` };
          }
          
          return { 
            data: { 
              job: formatJobData(job)
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getJobs',
      displayName: 'Get Jobs',
      description: 'Get jobs from a queue with filtering options',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to get jobs from"
          },
          status: {
            type: "string",
            title: "Status",
            description: "Filter jobs by status",
            enum: ["waiting", "active", "completed", "failed", "delayed", "paused"],
            default: "waiting"
          },
          start: {
            type: "number",
            title: "Start",
            description: "Start index for pagination",
            default: 0
          },
          end: {
            type: "number",
            title: "End",
            description: "End index for pagination",
            default: 10
          },
          jobName: {
            type: "string",
            title: "Job Name",
            description: "Filter jobs by name"
          }
        },
        required: ["queueName"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { 
            queueName, 
            status = 'waiting', 
            start = 0, 
            end = 10,
            jobName
          } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Get jobs by status
          let jobs: Job[];
          
          switch (status) {
            case 'waiting':
              jobs = await queue.getWaiting(start, end);
              break;
            case 'active':
              jobs = await queue.getActive(start, end);
              break;
            case 'completed':
              jobs = await queue.getCompleted(start, end);
              break;
            case 'failed':
              jobs = await queue.getFailed(start, end);
              break;
            case 'delayed':
              jobs = await queue.getDelayed(start, end);
              break;
            case 'paused':
              jobs = await queue.getPaused(start, end);
              break;
            default:
              jobs = await queue.getWaiting(start, end);
          }
          
          // Filter by job name if provided
          if (jobName) {
            jobs = jobs.filter(job => job.name === jobName);
          }
          
          return { 
            data: { 
              jobs: jobs.map(formatJobData),
              count: jobs.length,
              queueName,
              status
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'removeJob',
      displayName: 'Remove Job',
      description: 'Remove a job from a queue',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue containing the job"
          },
          jobId: {
            type: "string",
            title: "Job ID",
            description: "The ID of the job to remove"
          }
        },
        required: ["queueName", "jobId"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName, jobId } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Get job by ID
          const job = await queue.getJob(jobId);
          
          if (!job) {
            return { error: `Job with ID ${jobId} not found in queue '${queueName}'` };
          }
          
          // Remove job
          await job.remove();
          
          return { 
            data: { 
              message: `Successfully removed job ${jobId} from queue '${queueName}'`
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'clearQueue',
      displayName: 'Clear Queue',
      description: 'Remove all jobs from a queue',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to clear"
          },
          status: {
            type: "string",
            title: "Status",
            description: "Clear only jobs with specific status",
            enum: ["waiting", "active", "completed", "failed", "delayed", "paused", "all"],
            default: "all"
          }
        },
        required: ["queueName"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName, status = 'all' } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Clear queue
          let count = 0;
          if (status === 'all') {
            count = await queue.count();
            await queue.empty();
          } else {
            // Get jobs by status
            let jobs: Job[];
            
            switch (status) {
              case 'waiting':
                jobs = await queue.getWaiting(0, -1);
                break;
              case 'active':
                jobs = await queue.getActive(0, -1);
                break;
              case 'completed':
                jobs = await queue.getCompleted(0, -1);
                break;
              case 'failed':
                jobs = await queue.getFailed(0, -1);
                break;
              case 'delayed':
                jobs = await queue.getDelayed(0, -1);
                break;
              case 'paused':
                jobs = await queue.getPaused(0, -1);
                break;
              default:
                jobs = [];
            }
            
            count = jobs.length;
            
            // Remove all jobs
            await Promise.all(jobs.map(job => job.remove()));
          }
          
          return { 
            data: { 
              message: `Successfully cleared ${status === 'all' ? 'all jobs' : `${status} jobs`} from queue '${queueName}'`,
              removedCount: count
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'pauseQueue',
      displayName: 'Pause Queue',
      description: 'Pause a queue (stop processing new jobs)',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to pause"
          }
        },
        required: ["queueName"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Pause queue
          await queue.pause();
          
          return { 
            data: { 
              message: `Successfully paused queue '${queueName}'`
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'resumeQueue',
      displayName: 'Resume Queue',
      description: 'Resume a paused queue',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to resume"
          }
        },
        required: ["queueName"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Resume queue
          await queue.resume();
          
          return { 
            data: { 
              message: `Successfully resumed queue '${queueName}'`
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getQueueInfo',
      displayName: 'Get Queue Info',
      description: 'Get information about a queue including job counts',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to get information about"
          }
        },
        required: ["queueName"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Get queue counts
          const [
            waiting,
            active,
            completed,
            failed,
            delayed,
            paused
          ] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
            queue.getPausedCount()
          ]);
          
          const total = waiting + active + completed + failed + delayed + paused;
          const isPaused = await queue.isPaused();
          
          return { 
            data: { 
              queueName,
              counts: {
                waiting,
                active,
                completed,
                failed,
                delayed,
                paused,
                total
              },
              isPaused
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'registerProcessor',
      displayName: 'Register Processor',
      description: 'Register a processor function for a queue to process jobs',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to register the processor for"
          },
          jobName: {
            type: "string",
            title: "Job Name",
            description: "Process only jobs with this name (optional)"
          },
          concurrency: {
            type: "number",
            title: "Concurrency",
            description: "Number of jobs to process concurrently",
            default: 1
          },
          processorFunction: {
            type: "string",
            title: "Processor Function",
            description: "JavaScript function to process jobs (receives job data as input and should return a result)",
            format: "javascript"
          }
        },
        required: ["queueName", "processorFunction"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { 
            queueName, 
            jobName,
            concurrency = 1,
            processorFunction 
          } = input.data;
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Compile processor function
          let processorFn;
          try {
            // eslint-disable-next-line no-new-func
            processorFn = new Function('job', `
              return (async function() {
                try {
                  ${processorFunction}
                } catch (error) {
                  throw new Error(\`Processor function error: \${error.message}\`);
                }
              })();
            `);
          } catch (error: any) {
            return { error: `Invalid processor function: ${error.message}` };
          }
          
          // Register processor
          if (jobName) {
            queue.process(jobName, concurrency, processorFn as any);
          } else {
            queue.process(concurrency, processorFn as any);
          }
          
          return { 
            data: { 
              message: `Successfully registered processor for queue '${queueName}'${jobName ? ` and job name '${jobName}'` : ''}`,
              concurrency
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'subscribeToEvents',
      displayName: 'Subscribe to Events',
      description: 'Subscribe to queue events and execute a callback function when they occur',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to subscribe to events for"
          },
          events: {
            type: "array",
            title: "Events",
            description: "Events to subscribe to",
            items: {
              type: "string",
              enum: [
                "error", "waiting", "active", "stalled", "progress", 
                "completed", "failed", "paused", "resumed", "cleaned", 
                "drained", "removed", "global:error", "global:waiting", 
                "global:active", "global:stalled", "global:progress", 
                "global:completed", "global:failed", "global:paused", 
                "global:resumed", "global:cleaned", "global:drained", 
                "global:removed"
              ]
            },
            default: ["completed", "failed"]
          },
          callbackFunction: {
            type: "string",
            title: "Callback Function",
            description: "JavaScript function to execute when events occur (receives event type and job data)",
            format: "javascript"
          },
          webhookUrl: {
            type: "string",
            title: "Webhook URL",
            description: "URL to send event data to (alternative to callback function)"
          }
        },
        required: ["queueName", "events"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { 
            queueName, 
            events,
            callbackFunction,
            webhookUrl
          } = input.data;
          
          if (!callbackFunction && !webhookUrl) {
            return { error: "Either callbackFunction or webhookUrl must be provided" };
          }
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Compile callback function if provided
          let callbackFn: (eventType: string, jobData: any) => Promise<void>;
          if (callbackFunction) {
            try {
              // eslint-disable-next-line no-new-func
              callbackFn = new Function('eventType', 'jobData', `
                return (async function() {
                  try {
                    ${callbackFunction}
                  } catch (error) {
                    console.error(\`Event callback error: \${error.message}\`);
                  }
                })();
              `) as any;
            } catch (error: any) {
              return { error: `Invalid callback function: ${error.message}` };
            }
          } else if (webhookUrl) {
            // Create webhook callback if URL is provided
            callbackFn = async (eventType: string, jobData: any) => {
              try {
                // Use node-fetch or another HTTP client library
                // This is a placeholder implementation
                console.log(`Webhook called: ${webhookUrl}`, {
                  eventType,
                  jobData: formatJobData(jobData),
                  queueName,
                  timestamp: new Date().toISOString()
                });
              } catch (error: any) {
                console.error(`Webhook error: ${error.message}`);
              }
            };
          } else {
            // Default empty callback if neither is provided (should never happen due to earlier check)
            callbackFn = async () => {};
          }
          
          // Subscribe to events
          for (const event of events) {
            queue.on(event, (job: Job) => {
              callbackFn(event, job);
            });
          }
          
          return { 
            data: { 
              message: `Successfully subscribed to events for queue '${queueName}'`,
              events
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'createBatchJobs',
      displayName: 'Create Batch Jobs',
      description: 'Add multiple jobs to a queue in a single operation',
      inputSchema: {
        type: "object",
        properties: {
          queueName: {
            type: "string",
            title: "Queue Name",
            description: "The name of the queue to add jobs to"
          },
          jobs: {
            type: "array",
            title: "Jobs",
            description: "Array of jobs to add to the queue",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  title: "Job Name",
                  description: "Name of the job"
                },
                data: {
                  type: "object",
                  title: "Job Data",
                  description: "Data for the job"
                },
                opts: {
                  type: "object",
                  title: "Job Options",
                  description: "Options for the job"
                }
              },
              required: ["data"]
            }
          }
        },
        required: ["queueName", "jobs"]
      },
      async execute(input: any, config: { data: QueueConfig }): Promise<QueueResponse> {
        try {
          const { queueName, jobs } = input.data;
          
          if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
            return { error: "No jobs provided" };
          }
          
          // Create queue instance
          const queue = createQueue(queueName, config.data);
          
          // Add jobs to queue
          const jobPromises = jobs.map(job => {
            const { name = 'default', data, opts = {} } = job;
            return queue.add(name, data, opts);
          });
          
          const addedJobs = await Promise.all(jobPromises);
          
          return { 
            data: { 
              message: `Successfully added ${addedJobs.length} jobs to queue '${queueName}'`,
              jobs: addedJobs.map(formatJobData)
            } 
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    }
  ]
};

export default queuePlugin;
