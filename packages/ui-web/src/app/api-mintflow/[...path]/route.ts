import { getAppEngineClient } from '@/lib/appmint-client';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Define a single handler function for all HTTP methods
const handler = async (request: any) => {
    try {
        const authorization = request.headers['authorization'] || request.headers['Authorization']
        const isMultiPath = request.headers['content-type'] && request.headers['content-type'].indexOf('multipart/form-data') >= 0;
        const { method, query, body, url } = request
        const clientInfo = {}
        const appengineClient = getAppEngineClient();
        const apiPath = url.split('/api-mintflow/')[1];

        const response = await axios({
            method: method,
            url: apiPath,
            data: body,
            headers: Object.fromEntries(request.headers),
            validateStatus: () => true, // Don't throw on any status code
        });

        // Return the response directly without wrapping in json()
        return new NextResponse(
            typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
            {
                status: response.status,
                headers: {
                    'Content-Type': response.headers['content-type'] || 'application/json',
                }
            }
        );
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
