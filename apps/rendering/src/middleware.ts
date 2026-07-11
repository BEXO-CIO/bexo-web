import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Exclude internal Next.js paths, static assets, files, and explicit routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/p/') ||
    pathname.startsWith('/preview/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Parse host to extract subdomain
  // E.g., kavin.mybexo.com -> ['kavin', 'mybexo', 'com']
  // E.g., kavin.localhost:3001 -> ['kavin', 'localhost:3001']
  const parts = host.split('.');

  let subdomain = '';
  if (parts.length > 2) {
    // E.g. kavin.mybexo.com
    subdomain = parts[0];
  } else if (parts.length === 2 && parts[1].startsWith('localhost')) {
    // E.g. kavin.localhost:3000 or kavin.localhost:3001
    subdomain = parts[0];
  }

  // If subdomain is present and is not 'www', rewrite internally to the dynamic /[handle] path
  if (subdomain && subdomain !== 'www') {
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
