import { deepCopy } from '@/lib-client/helpers';
import { AppEngineClient, getAppEngineClient } from '@/lib/appmint-client';
import { NextRequest, NextResponse } from 'next/server';

// Define a single handler function for all HTTP methods
const handler = async (request: any) => {
    try {
        const authorization = request.headers['authorization'] || request.headers['Authorization']
        const isMultiPath = request.headers['content-type'] && request.headers['content-type'].indexOf('multipart/form-data') >= 0;
        const { method, query, body, url } = await request
        const clientInfo = {}
        const appengineClient = await getAppEngineClient();
        const apiPath = url.split('/api-appmint/')[1];
        return await appengineClient.processRequest(method, apiPath, deepCopy(body), authorization as string, query, clientInfo, isMultiPath);
    } catch (error: any) {
        console.error('[API Proxy] Error:', error.message);
        return NextResponse.json(
            { error: 'Proxy server error', message: error.message },
            { status: 500 }
        );
    }
};

// Use the same handler for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
