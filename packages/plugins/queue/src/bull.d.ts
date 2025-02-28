declare module 'bull' {
  export interface JobOptions {
    priority?: number;
    delay?: number;
    attempts?: number;
    backoff?: {
      type: 'fixed' | 'exponential';
      delay: number;
    };
    timeout?: number;
    removeOnComplete?: boolean;
    removeOnFail?: boolean;
    jobId?: string;
    repeat?: {
      cron?: string;
      every?: number;
      limit?: number;
      startDate?: string | Date;
      endDate?: string | Date;
      tz?: string;
    };
  }

  export interface Job<T = any> {
    id: string;
    name: string;
    data: T;
    opts: JobOptions;
    progress(): number;
    returnvalue: any;
    stacktrace: string[];
    timestamp: number;
    attemptsMade: number;
    failedReason: string | null;
    finishedOn: number | null;
    processedOn: number | null;
    remove(): Promise<void>;
  }

  export interface Queue<T = any> {
    add(name: string, data: any, opts?: JobOptions): Promise<Job<T>>;
    getJob(jobId: string): Promise<Job<T> | null>;
    getWaiting(start?: number, end?: number): Promise<Job<T>[]>;
    getActive(start?: number, end?: number): Promise<Job<T>[]>;
    getCompleted(start?: number, end?: number): Promise<Job<T>[]>;
    getFailed(start?: number, end?: number): Promise<Job<T>[]>;
    getDelayed(start?: number, end?: number): Promise<Job<T>[]>;
    getPaused(start?: number, end?: number): Promise<Job<T>[]>;
    getWaitingCount(): Promise<number>;
    getActiveCount(): Promise<number>;
    getCompletedCount(): Promise<number>;
    getFailedCount(): Promise<number>;
    getDelayedCount(): Promise<number>;
    getPausedCount(): Promise<number>;
    count(): Promise<number>;
    empty(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    isPaused(): Promise<boolean>;
    process(concurrency: number, handler: (job: Job<T>) => Promise<any>): void;
    process(name: string, concurrency: number, handler: (job: Job<T>) => Promise<any>): void;
    on(event: string, callback: (job: Job<T>) => void): void;
    close(): Promise<void>;
  }

  export interface QueueOptions {
    redis?: string | {
      host?: string;
      port?: number;
      db?: number;
      password?: string;
      username?: string;
    };
    prefix?: string;
    defaultJobOptions?: JobOptions;
  }

  export default function Bull<T = any>(name: string, options?: QueueOptions): Queue<T>;
}
