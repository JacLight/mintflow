import axios from 'axios';

export interface MilvusConfig {
  host: string;
  port: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export const listCollections = {
  name: 'list-collections',
  displayName: 'List Collections',
  description: 'List all collections in your Milvus instance',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      collections: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  async execute(input: any, config: { auth: MilvusConfig }) {
    try {
      const { host, port, username, password, ssl } = config.auth;
      const protocol = ssl ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}:${port}/api/v1`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication if provided
      if (username && password) {
        const authString = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${authString}`;
      }
      
      const response = await axios.get(`${baseUrl}/collections`, { headers });
      
      return {
        collections: response.data.data,
      };
    } catch (error) {
      console.error('Error listing Milvus collections:', error);
      throw error;
    }
  },
};
