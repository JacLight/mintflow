import { deepCopy } from '@/lib-client/helpers';
import { getMintflowClient } from '@/lib/mintflow-client';
import { NextRequest, NextResponse } from 'next/server';

// Define a single handler function for all HTTP methods
const handler = async (request: any) => {
    try {
        const { method, query, url } = await request
        let body;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.json();
        }
        const rt = await getMintflowClient().proxyClient(method, url, deepCopy(body), query,)
        return NextResponse.json(rt, {
            status: 200, headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error: any) {
        console.error('[API Proxy] Error:', error.message);
        return NextResponse.json(
            { error: error.message },
            { status: error.response?.status || 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// Use the same handler for all HTTP methods
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
