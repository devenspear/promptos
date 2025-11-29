import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth check for the auth API endpoint
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Skip if no password is configured (checked at runtime in API)
  const hasAuth = request.cookies.get('promptos_auth');

  if (hasAuth?.value === 'authenticated') {
    return NextResponse.next();
  }

  // For API routes, return 401
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For page routes, let the client-side handle the login modal
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
