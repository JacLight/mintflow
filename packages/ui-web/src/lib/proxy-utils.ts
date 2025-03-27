/**
 * Converts a path to a proxied URL if needed
 * @param path The path part of the URL (without host)
 * @param host Optional host for server-side calls
 * @param service Optional service identifier to determine proxy path
 * @returns The URL to use (either proxied or original with host)
 */
export const getProxiedUrl = (path: string, host: string, service: 'appmint' | 'mintflow'): string => {
    // Remove leading slash if present
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser && service === 'appmint') {
        return `/api-appmint/${path}`;
    } else if (isBrowser && service === 'mintflow') {
        return `/api-mintflow/${path}`;
    }

    return `${host}/${path}`
};
