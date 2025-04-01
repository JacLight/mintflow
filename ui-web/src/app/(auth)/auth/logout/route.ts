import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    // Create a response that redirects to the home page
    const response = Response.redirect(new URL('/', request.url));

    // Clear cookies - using the same pattern as in activeSession.clearSession()
    response.headers.append('Set-Cookie', 'token=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'user=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'refreshToken=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

    // Note: We can't use activeSession.clearSession directly here because it's a client-side function
    // that uses document.cookie, and this is a server component. The cookies we clear above will be
    // recognized by activeSession on the client side.

    return response;
}
