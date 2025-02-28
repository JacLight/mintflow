import axios from 'axios';
import { logger } from './utils/logger';

/**
 * handleNodeJob: local Node logic for tasks.
 * If more complex, you might have a separate directory with modules for each nodeId.
 */
export async function handleNodeJob(jobData: any): Promise<any> {
    const { nodeId, input } = jobData;
    switch (nodeId) {
        case 'addOne':
            if (typeof input !== 'number') throw new Error('addOne expects a number');
            return { newVal: input + 1 };

        case 'reverseString':
            if (typeof input !== 'string') throw new Error('reverseString expects a string');
            return { reversed: input.split('').reverse().join('') };

        case 'httpFetch':
            if (!input?.url) throw new Error('httpFetch expects input.url');
            const resp = await axios.get(input.url);
            return { data: resp.data };

        default:
            throw new Error(`Unknown nodeId: ${nodeId}`);
    }
}
