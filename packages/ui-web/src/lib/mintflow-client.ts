import axios from 'axios';
import { mintflowEndpoints } from './mintflow-endpoints';

export const callServer = async (url: string, method: string, data: any, headers: any) => {
    try {
        const response = await axios({
            method,
            url,
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

    constructor(baseUrl: string = 'http://localhost:7001') {
        this.baseUrl = baseUrl;
    }

    async getNodes(fields?: string[]): Promise<any> {
        try {
            const endpoint = mintflowEndpoints.get_nodes;
            let url = `${this.baseUrl}/${endpoint.path}/all`;

            // Add fields parameter if specified
            if (fields && fields.length > 0) {
                url += `?fields=${fields.join(',')}`;
            }

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
            let url = `${this.baseUrl}/${endpoint.path}/${nodeId}`;

            // Add fields parameter if specified
            if (fields && fields.length > 0) {
                url += `?fields=${fields.join(',')}`;
            }

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
}

// Create a singleton instance
let mintflowClient: MintflowClient;

export const getMintflowClient = (): MintflowClient => {
    if (!mintflowClient) {
        mintflowClient = new MintflowClient();
    }
    return mintflowClient;
};
