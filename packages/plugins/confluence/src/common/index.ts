import axios from 'axios';

export interface ConfluenceAuth {
    username: string;
    password: string;
    confluenceDomain: string;
}

export interface ConfluenceApiCallParams {
    auth: ConfluenceAuth;
    version: 'v1' | 'v2';
    method: string;
    resourceUri: string;
    query?: Record<string, string>;
    body?: any;
}

export interface PaginatedResponse<T> {
    results: T[];
    _links?: {
        next?: string;
    };
}

export async function confluenceApiCall<T>({
    auth,
    version,
    method,
    resourceUri,
    query,
    body,
}: ConfluenceApiCallParams): Promise<T> {
    const baseUrl = version === 'v2'
        ? `${auth.confluenceDomain}/wiki/api/v2`
        : `${auth.confluenceDomain}/wiki/rest/api`;

    const authToken = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');

    try {
        const response = await axios({
            method,
            url: baseUrl + resourceUri,
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json',
            },
            params: query,
            data: body,
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Confluence API error: ${error.message}`);
        } else if (error instanceof Error) {
            throw new Error(`Unexpected error: ${error.message}`);
        } else {
            throw new Error('Unknown error occurred');
        }
    }
}

export async function confluencePaginatedApiCall<T>({
    auth,
    version,
    method,
    resourceUri,
    query,
    body,
}: ConfluenceApiCallParams): Promise<T[]> {
    const resultData: T[] = [];
    const authToken = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');

    if (version === 'v2') {
        let nextUrl = `${auth.confluenceDomain}/wiki/api/v2${resourceUri}?limit=200`;
        const params = query || {};

        do {
            try {
                const response = await axios({
                    method,
                    url: nextUrl,
                    headers: {
                        'Authorization': `Basic ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params,
                    data: body,
                });

                const responseData = response.data as PaginatedResponse<T>;

                if (!responseData.results || responseData.results.length === 0) {
                    break;
                }

                resultData.push(...responseData.results);
                nextUrl = responseData._links?.next
                    ? `${auth.confluenceDomain}${responseData._links.next}`
                    : '';
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(`Confluence API error: ${error.message}`);
                } else if (error instanceof Error) {
                    throw new Error(`Unexpected error: ${error.message}`);
                } else {
                    throw new Error('Unknown error occurred');
                }
            }
        } while (nextUrl);
    } else {
        let start = 0;
        let hasMoreData = true;
        const params = query || {};

        do {
            try {
                const response = await axios({
                    method,
                    url: `${auth.confluenceDomain}/wiki/rest/api${resourceUri}?start=${start}&limit=100`,
                    headers: {
                        'Authorization': `Basic ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params,
                    data: body,
                });

                const responseData = response.data as { results: T[] };

                if (!responseData.results || responseData.results.length === 0) {
                    hasMoreData = false;
                } else {
                    resultData.push(...responseData.results);
                    start += 100;
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(`Confluence API error: ${error.message}`);
                } else if (error instanceof Error) {
                    throw new Error(`Unexpected error: ${error.message}`);
                } else {
                    throw new Error('Unknown error occurred');
                }
            }
        } while (hasMoreData);
    }

    return resultData;
}
