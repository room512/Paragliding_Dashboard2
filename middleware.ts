import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since we're deploying statically, redirect API requests to the deployed API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'API not available in static deployment' },
      { status: 501 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};