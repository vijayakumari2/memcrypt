import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyKeycloakToken } from './lib/keycloakMiddleware';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/api/users') && !path.includes('/auth/')) {
        const token = request.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const payload = await verifyKeycloakToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Add verified user information to headers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-User-ID', payload.sub as string);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
