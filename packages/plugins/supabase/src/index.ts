import { createClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  apiKey: string;
}

interface SupabaseResponse {
  data?: any;
  error?: string;
}

// Helper function to create a Supabase client
function createSupabaseClient(config: SupabaseConfig): any {
  const { url, apiKey } = config;
  return createClient(url, apiKey);
}

const supabasePlugin = {
  name: "Supabase",
  icon: "FaDatabase",
  description: "The open-source Firebase alternative with PostgreSQL at its core",
    groups: ["data"],
    tags: ["data","storage","database","query","persistence"],
    version: '1.0.0',
  id: "supabase",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        title: "URL",
        description: "The URL of your Supabase project"
      },
      apiKey: {
        type: "string",
        title: "API Key",
        description: "The service API key for your Supabase project",
        format: "password"
      }
    },
    required: ["url", "apiKey"]
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
    url: "https://your-project.supabase.co",
    apiKey: "your-api-key"
  },
  exampleOutput: {
    data: {
      id: 1,
      name: "John Doe",
      email: "john@example.com"
    }
  },
  documentation: "https://github.com/mintflow/plugins/supabase",
  method: "exec",
  actions: [
    {
      name: 'uploadFile',
      displayName: 'Upload File',
      description: 'Upload a file to Supabase Storage',
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            title: "Bucket",
            description: "The name of the storage bucket"
          },
          filePath: {
            type: "string",
            title: "File Path",
            description: "The path where the file will be stored in the bucket"
          },
          fileContent: {
            type: "string",
            title: "File Content",
            description: "The base64-encoded content of the file to upload"
          },
          contentType: {
            type: "string",
            title: "Content Type",
            description: "The MIME type of the file (optional)"
          }
        },
        required: ["bucket", "filePath", "fileContent"]
      },
      async execute(input: { data: { bucket: string; filePath: string; fileContent: string; contentType?: string } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { bucket, filePath, fileContent, contentType } = input.data;
          
          // Convert base64 to array buffer
          const base64Data = fileContent.replace(/^data:.*;base64,/, '');
          const arrayBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          
          // Upload file
          const options = contentType ? { contentType } : undefined;
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, arrayBuffer, options);
          
          if (error) {
            return { error: error.message };
          }
          
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          return {
            data: {
              ...data,
              publicUrl: publicUrlData.publicUrl
            }
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'downloadFile',
      displayName: 'Download File',
      description: 'Download a file from Supabase Storage',
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            title: "Bucket",
            description: "The name of the storage bucket"
          },
          filePath: {
            type: "string",
            title: "File Path",
            description: "The path of the file in the bucket"
          }
        },
        required: ["bucket", "filePath"]
      },
      async execute(input: { data: { bucket: string; filePath: string } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { bucket, filePath } = input.data;
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .download(filePath);
          
          if (error) {
            return { error: error.message };
          }
          
          // Convert blob to base64
          const buffer = await data.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          return {
            data: {
              base64,
              size: data.size,
              type: data.type
            }
          };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'listFiles',
      displayName: 'List Files',
      description: 'List files in a Supabase Storage bucket',
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            title: "Bucket",
            description: "The name of the storage bucket"
          },
          path: {
            type: "string",
            title: "Path",
            description: "The path to list files from (optional)"
          },
          limit: {
            type: "number",
            title: "Limit",
            description: "Maximum number of files to return (optional)"
          },
          offset: {
            type: "number",
            title: "Offset",
            description: "Number of files to skip (optional)"
          },
          sortBy: {
            type: "object",
            title: "Sort By",
            description: "Sorting options (optional)",
            properties: {
              column: {
                type: "string",
                enum: ["name", "created_at", "updated_at", "last_accessed_at"]
              },
              order: {
                type: "string",
                enum: ["asc", "desc"]
              }
            }
          }
        },
        required: ["bucket"]
      },
      async execute(input: { 
        data: { 
          bucket: string; 
          path?: string; 
          limit?: number; 
          offset?: number; 
          sortBy?: { column: string; order: string } 
        } 
      }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { bucket, path, limit, offset, sortBy } = input.data;
          
          const options: any = {};
          if (path) options.path = path;
          if (limit) options.limit = limit;
          if (offset) options.offset = offset;
          if (sortBy) options.sortBy = sortBy;
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .list(path || '', options);
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deleteFile',
      displayName: 'Delete File',
      description: 'Delete a file from Supabase Storage',
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            title: "Bucket",
            description: "The name of the storage bucket"
          },
          filePath: {
            type: "string",
            title: "File Path",
            description: "The path of the file in the bucket"
          }
        },
        required: ["bucket", "filePath"]
      },
      async execute(input: { data: { bucket: string; filePath: string } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { bucket, filePath } = input.data;
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'executeQuery',
      displayName: 'Execute Query',
      description: 'Execute a query on your Supabase database',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to query"
          },
          select: {
            type: "string",
            title: "Select",
            description: "Columns to select (default: *)",
            default: "*"
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter conditions (column names as keys, values to match as values)"
          },
          order: {
            type: "object",
            title: "Order",
            description: "Ordering options",
            properties: {
              column: {
                type: "string",
                description: "Column to order by"
              },
              ascending: {
                type: "boolean",
                description: "Order direction (true for ascending, false for descending)",
                default: true
              }
            }
          },
          limit: {
            type: "number",
            title: "Limit",
            description: "Maximum number of rows to return"
          },
          offset: {
            type: "number",
            title: "Offset",
            description: "Number of rows to skip"
          }
        },
        required: ["table"]
      },
      async execute(input: { 
        data: { 
          table: string; 
          select?: string; 
          filter?: Record<string, any>; 
          order?: { column: string; ascending: boolean }; 
          limit?: number; 
          offset?: number; 
        } 
      }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { table, select, filter, order, limit, offset } = input.data;
          
          let query = supabase
            .from(table)
            .select(select || '*');
          
          // Apply filters
          if (filter && Object.keys(filter).length > 0) {
            Object.entries(filter).forEach(([column, value]) => {
              query = query.eq(column, value);
            });
          }
          
          // Apply ordering
          if (order && order.column) {
            query = query.order(order.column, { ascending: order.ascending !== false });
          }
          
          // Apply pagination
          if (limit) {
            query = query.limit(limit);
          }
          
          if (offset) {
            query = query.range(offset, offset + (limit || 10) - 1);
          }
          
          const { data, error } = await query;
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'insertRecord',
      displayName: 'Insert Record',
      description: 'Insert a new record into a Supabase table',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to insert into"
          },
          record: {
            type: "object",
            title: "Record",
            description: "The record to insert (column names as keys, values as values)"
          }
        },
        required: ["table", "record"]
      },
      async execute(input: { data: { table: string; record: Record<string, any> } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { table, record } = input.data;
          
          const { data, error } = await supabase
            .from(table)
            .insert(record)
            .select();
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'updateRecord',
      displayName: 'Update Record',
      description: 'Update records in a Supabase table',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to update"
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter conditions to identify records to update (column names as keys, values to match as values)"
          },
          updates: {
            type: "object",
            title: "Updates",
            description: "The updates to apply (column names as keys, new values as values)"
          }
        },
        required: ["table", "filter", "updates"]
      },
      async execute(input: { 
        data: { 
          table: string; 
          filter: Record<string, any>; 
          updates: Record<string, any> 
        } 
      }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { table, filter, updates } = input.data;
          
          let query = supabase
            .from(table)
            .update(updates);
          
          // Apply filters
          Object.entries(filter).forEach(([column, value]) => {
            query = query.eq(column, value);
          });
          
          const { data, error } = await query.select();
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deleteRecord',
      displayName: 'Delete Record',
      description: 'Delete records from a Supabase table',
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            title: "Table",
            description: "The name of the table to delete from"
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter conditions to identify records to delete (column names as keys, values to match as values)"
          }
        },
        required: ["table", "filter"]
      },
      async execute(input: { data: { table: string; filter: Record<string, any> } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { table, filter } = input.data;
          
          let query = supabase
            .from(table)
            .delete();
          
          // Apply filters
          Object.entries(filter).forEach(([column, value]) => {
            query = query.eq(column, value);
          });
          
          const { data, error } = await query.select();
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'createBucket',
      displayName: 'Create Bucket',
      description: 'Create a new storage bucket in Supabase',
      inputSchema: {
        type: "object",
        properties: {
          bucketName: {
            type: "string",
            title: "Bucket Name",
            description: "The name of the bucket to create"
          },
          isPublic: {
            type: "boolean",
            title: "Public",
            description: "Whether the bucket should be publicly accessible",
            default: false
          }
        },
        required: ["bucketName"]
      },
      async execute(input: { data: { bucketName: string; isPublic?: boolean } }, config: { data: SupabaseConfig }): Promise<SupabaseResponse> {
        try {
          const supabase = createSupabaseClient(config.data);
          const { bucketName, isPublic } = input.data;
          
          const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: isPublic || false
          });
          
          if (error) {
            return { error: error.message };
          }
          
          return { data };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    }
  ]
};

export default supabasePlugin;
