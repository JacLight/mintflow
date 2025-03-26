import { createClient } from 'redis';

interface RedisConfig {
  url: string;
  username?: string;
  password?: string;
  database?: number;
}

interface RedisResponse {
  result?: any;
  error?: string;
}

// Helper function to create a Redis client
async function createRedisClient(config: RedisConfig): Promise<any> {
  const { url, username, password, database } = config;
  
  const client = createClient({
    url,
    username: username || undefined,
    password: password || undefined,
    database: database || 0
  });
  
  await client.connect();
  return client;
}

const redisPlugin = {
  name: "Redis",
  icon: "FaDatabase",
  description: "Connect to Redis databases for caching, pub/sub messaging, and data storage",
    groups: ["data"],
    tags: ["data","storage","database","query","persistence"],
    version: '1.0.0',
  id: "redis",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        title: "URL",
        description: "The Redis connection URL (e.g., redis://localhost:6379)"
      },
      username: {
        type: "string",
        title: "Username",
        description: "The username for Redis authentication (optional)"
      },
      password: {
        type: "string",
        title: "Password",
        description: "The password for Redis authentication (optional)",
        format: "password"
      },
      database: {
        type: "number",
        title: "Database",
        description: "The Redis database number to use (default: 0)",
        default: 0
      }
    },
    required: ["url"]
  },
  outputSchema: {
    type: "object",
    properties: {
      result: {
        type: "any"
      },
      error: {
        type: "string"
      }
    }
  },
  exampleInput: {
    url: "redis://localhost:6379",
    username: "",
    password: "",
    database: 0
  },
  exampleOutput: {
    result: "OK"
  },
  documentation: "https://github.com/mintflow/plugins/redis",
  method: "exec",
  actions: [
    {
      name: 'set',
      displayName: 'Set Key',
      description: 'Set a key-value pair in Redis',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to set"
          },
          value: {
            type: "string",
            title: "Value",
            description: "The value to set"
          },
          expiration: {
            type: "number",
            title: "Expiration (seconds)",
            description: "Time in seconds after which the key will expire (optional)"
          }
        },
        required: ["key", "value"]
      },
      async execute(input: { data: { key: string; value: string; expiration?: number } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, value, expiration } = input.data;
          
          let result;
          if (expiration) {
            result = await client.set(key, value, { EX: expiration });
          } else {
            result = await client.set(key, value);
          }
          
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'get',
      displayName: 'Get Key',
      description: 'Get the value of a key from Redis',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to get"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.get(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'delete',
      displayName: 'Delete Key',
      description: 'Delete a key from Redis',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to delete"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.del(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'exists',
      displayName: 'Key Exists',
      description: 'Check if a key exists in Redis',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to check"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.exists(key);
          return { result: result === 1 };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'expire',
      displayName: 'Set Expiration',
      description: 'Set an expiration time for a key',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to set expiration for"
          },
          seconds: {
            type: "number",
            title: "Seconds",
            description: "Time in seconds after which the key will expire"
          }
        },
        required: ["key", "seconds"]
      },
      async execute(input: { data: { key: string; seconds: number } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, seconds } = input.data;
          
          const result = await client.expire(key, seconds);
          return { result: result === 1 };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'ttl',
      displayName: 'Get TTL',
      description: 'Get the remaining time to live of a key',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to get TTL for"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.ttl(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'incr',
      displayName: 'Increment',
      description: 'Increment the integer value of a key by one',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to increment"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.incr(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'incrBy',
      displayName: 'Increment By',
      description: 'Increment the integer value of a key by the given amount',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to increment"
          },
          increment: {
            type: "number",
            title: "Increment",
            description: "The amount to increment by"
          }
        },
        required: ["key", "increment"]
      },
      async execute(input: { data: { key: string; increment: number } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, increment } = input.data;
          
          const result = await client.incrBy(key, increment);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'decr',
      displayName: 'Decrement',
      description: 'Decrement the integer value of a key by one',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to decrement"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.decr(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'decrBy',
      displayName: 'Decrement By',
      description: 'Decrement the integer value of a key by the given amount',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key to decrement"
          },
          decrement: {
            type: "number",
            title: "Decrement",
            description: "The amount to decrement by"
          }
        },
        required: ["key", "decrement"]
      },
      async execute(input: { data: { key: string; decrement: number } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, decrement } = input.data;
          
          const result = await client.decrBy(key, decrement);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'hSet',
      displayName: 'Hash Set',
      description: 'Set field in a hash stored at key to value',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the hash"
          },
          field: {
            type: "string",
            title: "Field",
            description: "The field to set"
          },
          value: {
            type: "string",
            title: "Value",
            description: "The value to set"
          }
        },
        required: ["key", "field", "value"]
      },
      async execute(input: { data: { key: string; field: string; value: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, field, value } = input.data;
          
          const result = await client.hSet(key, field, value);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'hGet',
      displayName: 'Hash Get',
      description: 'Get the value of a field in a hash',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the hash"
          },
          field: {
            type: "string",
            title: "Field",
            description: "The field to get"
          }
        },
        required: ["key", "field"]
      },
      async execute(input: { data: { key: string; field: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, field } = input.data;
          
          const result = await client.hGet(key, field);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'hGetAll',
      displayName: 'Hash Get All',
      description: 'Get all fields and values in a hash',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the hash"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.hGetAll(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'hDel',
      displayName: 'Hash Delete',
      description: 'Delete a field from a hash',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the hash"
          },
          field: {
            type: "string",
            title: "Field",
            description: "The field to delete"
          }
        },
        required: ["key", "field"]
      },
      async execute(input: { data: { key: string; field: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, field } = input.data;
          
          const result = await client.hDel(key, field);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'publish',
      displayName: 'Publish Message',
      description: 'Publish a message to a channel',
      inputSchema: {
        type: "object",
        properties: {
          channel: {
            type: "string",
            title: "Channel",
            description: "The channel to publish to"
          },
          message: {
            type: "string",
            title: "Message",
            description: "The message to publish"
          }
        },
        required: ["channel", "message"]
      },
      async execute(input: { data: { channel: string; message: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { channel, message } = input.data;
          
          const result = await client.publish(channel, message);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'lPush',
      displayName: 'List Push Left',
      description: 'Prepend one or multiple values to a list',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the list"
          },
          values: {
            type: "array",
            title: "Values",
            description: "The values to push",
            items: {
              type: "string"
            }
          }
        },
        required: ["key", "values"]
      },
      async execute(input: { data: { key: string; values: string[] } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, values } = input.data;
          
          const result = await client.lPush(key, values);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'rPush',
      displayName: 'List Push Right',
      description: 'Append one or multiple values to a list',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the list"
          },
          values: {
            type: "array",
            title: "Values",
            description: "The values to push",
            items: {
              type: "string"
            }
          }
        },
        required: ["key", "values"]
      },
      async execute(input: { data: { key: string; values: string[] } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, values } = input.data;
          
          const result = await client.rPush(key, values);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'lPop',
      displayName: 'List Pop Left',
      description: 'Remove and get the first element in a list',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the list"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.lPop(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'rPop',
      displayName: 'List Pop Right',
      description: 'Remove and get the last element in a list',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the list"
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key } = input.data;
          
          const result = await client.rPop(key);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'lRange',
      displayName: 'List Range',
      description: 'Get a range of elements from a list',
      inputSchema: {
        type: "object",
        properties: {
          key: {
            type: "string",
            title: "Key",
            description: "The key of the list"
          },
          start: {
            type: "number",
            title: "Start",
            description: "The starting index (0-based)",
            default: 0
          },
          stop: {
            type: "number",
            title: "Stop",
            description: "The ending index (inclusive, -1 means the last element)",
            default: -1
          }
        },
        required: ["key"]
      },
      async execute(input: { data: { key: string; start?: number; stop?: number } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { key, start = 0, stop = -1 } = input.data;
          
          const result = await client.lRange(key, start, stop);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    },
    {
      name: 'executeCommand',
      displayName: 'Execute Command',
      description: 'Execute a custom Redis command',
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            title: "Command",
            description: "The Redis command to execute"
          },
          args: {
            type: "array",
            title: "Arguments",
            description: "The arguments for the command",
            items: {
              type: "string"
            }
          }
        },
        required: ["command"]
      },
      async execute(input: { data: { command: string; args?: string[] } }, config: { data: RedisConfig }): Promise<RedisResponse> {
        let client: any = null;
        
        try {
          client = await createRedisClient(config.data);
          const { command, args = [] } = input.data;
          
          // @ts-ignore - The redis library has a sendCommand method but it's not properly typed
          const result = await client.sendCommand([command, ...args]);
          return { result };
        } catch (error: any) {
          return { error: error.message };
        } finally {
          if (client) {
            await client.disconnect();
          }
        }
      }
    }
  ]
};

export default redisPlugin;
