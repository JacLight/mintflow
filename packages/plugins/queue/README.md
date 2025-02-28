# Queue Plugin for MintFlow

A robust queue system powered by Bull and Redis for managing data flow, processing order, and job scheduling in workflows.

## Features

- **Job Management**: Add, get, remove, and batch process jobs
- **Queue Control**: Pause, resume, and clear queues
- **Job Processing**: Register processor functions to handle jobs
- **Event Subscription**: Subscribe to queue events with callbacks or webhooks
- **Monitoring**: Get detailed queue information and job status

## Requirements

- Redis server (local or remote)
- Node.js environment

## Configuration

The Queue plugin requires a Redis connection. You can configure it in several ways:

```json
{
  "redisUrl": "redis://user:password@host:port/db",
  // OR individual connection parameters
  "redisHost": "127.0.0.1",
  "redisPort": 6379,
  "redisPassword": "your-password",
  "redisUsername": "your-username",
  "redisDb": 0,
  "prefix": "mintflow" // Prefix for queue names in Redis
}
```

## Actions

### addJob

Add a job to a queue with optional scheduling and processing options.

```json
{
  "queueName": "emails",
  "jobName": "send-welcome-email",
  "data": {
    "to": "user@example.com",
    "subject": "Welcome to our service"
  },
  "options": {
    "priority": 1,
    "delay": 5000,
    "attempts": 3,
    "backoff": {
      "type": "exponential",
      "delay": 1000
    },
    "timeout": 30000,
    "removeOnComplete": false,
    "removeOnFail": false,
    "repeat": {
      "cron": "0 0 * * *",
      "tz": "America/New_York"
    }
  }
}
```

### getJob

Get information about a specific job by ID.

```json
{
  "queueName": "emails",
  "jobId": "123"
}
```

### getJobs

Get jobs from a queue with filtering options.

```json
{
  "queueName": "emails",
  "status": "waiting", // waiting, active, completed, failed, delayed, paused
  "start": 0,
  "end": 10,
  "jobName": "send-welcome-email" // Optional filter by job name
}
```

### removeJob

Remove a job from a queue.

```json
{
  "queueName": "emails",
  "jobId": "123"
}
```

### clearQueue

Remove all jobs from a queue or jobs with a specific status.

```json
{
  "queueName": "emails",
  "status": "all" // all, waiting, active, completed, failed, delayed, paused
}
```

### pauseQueue

Pause a queue (stop processing new jobs).

```json
{
  "queueName": "emails"
}
```

### resumeQueue

Resume a paused queue.

```json
{
  "queueName": "emails"
}
```

### getQueueInfo

Get information about a queue including job counts.

```json
{
  "queueName": "emails"
}
```

### registerProcessor

Register a processor function for a queue to process jobs.

```json
{
  "queueName": "emails",
  "jobName": "send-welcome-email", // Optional - process only jobs with this name
  "concurrency": 2, // Number of jobs to process concurrently
  "processorFunction": "return job.data;" // JavaScript function to process jobs
}
```

### subscribeToEvents

Subscribe to queue events and execute a callback function when they occur.

```json
{
  "queueName": "emails",
  "events": ["completed", "failed"],
  "callbackFunction": "console.log(eventType, jobData);", // Optional
  "webhookUrl": "https://example.com/webhook" // Optional
}
```

### createBatchJobs

Add multiple jobs to a queue in a single operation.

```json
{
  "queueName": "emails",
  "jobs": [
    {
      "name": "send-welcome-email",
      "data": { "to": "user1@example.com" },
      "opts": { "priority": 1 }
    },
    {
      "name": "send-welcome-email",
      "data": { "to": "user2@example.com" },
      "opts": { "priority": 2 }
    }
  ]
}
```

## Usage Examples

### Basic Job Processing

1. Create a queue and add a job:

```json
// Action: addJob
{
  "queueName": "emails",
  "jobName": "send-welcome-email",
  "data": {
    "to": "user@example.com",
    "subject": "Welcome!"
  }
}
```

2. Register a processor for the queue:

```json
// Action: registerProcessor
{
  "queueName": "emails",
  "concurrency": 5,
  "processorFunction": "
    // Send email logic here
    console.log(`Sending email to ${job.data.to}`);
    
    // Update job progress
    job.progress(50);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Complete the job
    job.progress(100);
    return { sent: true, to: job.data.to };
  "
}
```

### Scheduled Jobs

Create a job that runs every day at midnight:

```json
// Action: addJob
{
  "queueName": "reports",
  "jobName": "generate-daily-report",
  "data": {
    "reportType": "daily-summary"
  },
  "options": {
    "repeat": {
      "cron": "0 0 * * *",
      "tz": "UTC"
    }
  }
}
```

### Job Monitoring

Subscribe to job events:

```json
// Action: subscribeToEvents
{
  "queueName": "emails",
  "events": ["completed", "failed"],
  "callbackFunction": "
    if (eventType === 'completed') {
      console.log(`Job ${jobData.id} completed successfully`);
    } else if (eventType === 'failed') {
      console.log(`Job ${jobData.id} failed: ${jobData.failedReason}`);
    }
  "
}
```

## Error Handling

The plugin includes robust error handling:

- Job failures are tracked with reason and stack trace
- Configurable retry attempts and backoff strategies
- Event subscription for failure monitoring
- Detailed error messages in action responses

## Performance Considerations

- Use appropriate concurrency settings based on your workload
- Consider using separate queues for different types of jobs
- For high-volume queues, consider dedicated Redis instances
- Use the `removeOnComplete` and `removeOnFail` options to manage queue size

## Integration with Other Plugins

The Queue plugin works well with:

- **Webhook Plugin**: Trigger workflows when jobs complete
- **Timer Plugin**: Schedule jobs at specific intervals
- **Email Plugin**: Process email sending through queues
- **File Plugin**: Handle large file processing asynchronously
