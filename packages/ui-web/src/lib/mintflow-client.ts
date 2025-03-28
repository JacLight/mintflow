import axios from 'axios';
import { mintflowEndpoints } from './mintflow-endpoints';
import { getProxiedUrl } from './proxy-utils';
import { getResponseErrorMessage } from '@/lib-client/helpers';

export const callServer = async (url: string, method: string, data: any, headers: any) => {
    try {
        // Extract the host and path from the URL
        let host = '';
        let path = url;

        try {
            const urlObj = new URL(url);
            host = urlObj.origin;
            path = urlObj.pathname + urlObj.search;
        } catch (error) {
            // If URL parsing fails, assume it's just a path
        }

        // Get the proxied URL if needed
        const proxiedUrl = getProxiedUrl(path, host, 'mintflow');

        const response = await axios({
            method,
            url: proxiedUrl,
            data,
            headers,
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return error.response.data;
        } else {
            return { error: 'Network error' };
        }
    }
}

export class MintflowClient {
    private baseUrl: string;

    constructor(baseUrl?: string) {
        // Use provided baseUrl or get from environment variable
        this.baseUrl = baseUrl || process.env.MINTFLOW_ENDPOINT || '';

        if (!this.baseUrl) {
            console.warn('MINTFLOW_ENDPOINT environment variable is not set and no baseUrl provided');
        }
    }

    async getNodes(fields?: string[]): Promise<any> {
        try {
            const endpoint = mintflowEndpoints.get_nodes;
            let path = `${endpoint.path}/all`;

            // Add fields parameter if specified
            if (fields && fields.length > 0) {
                path += `?fields=${fields.join(',')}`;
            }

            // Get the proxied URL if needed
            const url = getProxiedUrl(path, this.baseUrl, 'mintflow');
            console.log('getNodes', url);

            const response = await axios({
                method: endpoint.method,
                url,
            });

            return response.data;
        } catch (error: any) {
            console.error('Error fetching nodes:', error);
            if (error.response) {
                return error.response.data;
            } else {
                return { error: 'Network error' };
            }
        }
    }

    async getNode(nodeId: string, fields?: string[]): Promise<any> {
        try {
            const endpoint = mintflowEndpoints.get_node;
            let path = `${endpoint.path}/${nodeId}`;

            // Add fields parameter if specified
            if (fields && fields.length > 0) {
                path += `?fields=${fields.join(',')}`;
            }

            // Get the proxied URL if needed
            const url = getProxiedUrl(path, this.baseUrl, 'mintflow');

            const response = await axios({
                method: endpoint.method,
                url,
            });

            return response.data;
        } catch (error: any) {
            console.error('Error fetching node:', error);
            if (error.response) {
                return error.response.data;
            } else {
                return { error: 'Network error' };
            }
        }
    }

    async getSingleNode(nodeId: string, fields?: string[]): Promise<any> {
        try {
            const endpoint = mintflowEndpoints.get_node;

            let path = `${endpoint.path}/${nodeId}`;
            // Add fields parameter if specified
            if (fields && fields.length > 0) {
                path += `?fields=${fields.join(',')}`;
            }
            // Get the proxied URL if needed
            const url = getProxiedUrl(path, this.baseUrl, 'mintflow');
            const response = await axios({
                method: endpoint.method,
                url,
            });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching node by name:', error);
            if (error.response) {
                return error.response.data;
            } else {
                return { error: 'Network error' };
            }
        }
    }

    async runNode(data: any): Promise<any> {
        try {
            const endpoint = mintflowEndpoints.run_node;
            const path = `${endpoint.path}`;

            // Get the proxied URL if needed
            const url = getProxiedUrl(path, this.baseUrl, 'mintflow');

            const response = await axios({
                method: endpoint.method,
                url,
                data,
            });

            return response.data;
        } catch (error: any) {
            console.error('Error running node:', error);
            if (error.response) {
                return error.response.data;
            } else {
                return { error: 'Network error' };
            }
        }
    }

    async proxyClient(method: string, url: string, data: any, query: any): Promise<any> {
        try {
            let apiPath = url.split('/api-mintflow/')[1];
            apiPath = getProxiedUrl(apiPath, this.baseUrl, 'mintflow');
            console.log(`Proxying ${method} request from ${url} -> ${apiPath}`);
            console.log(data);

            const response = await axios({
                method,
                url: apiPath,
                ...(method.toLowerCase() === 'post' && data ? { data } : {}),
                ...(query ? { params: query } : {}),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Proxy response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error running node:', getResponseErrorMessage(error));
            throw error;
        }
    }
}

// Create a singleton instance
let mintflowClient: MintflowClient;

export const getMintflowClient = (): MintflowClient => {
    if (!mintflowClient) {
        mintflowClient = new MintflowClient();
    }
    return mintflowClient;
};
