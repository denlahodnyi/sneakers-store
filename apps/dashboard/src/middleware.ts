import { decodeToken, SESSION_COOKIE_NAME } from '@sneakers-store/next-auth';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { signOut } from '~/shared/api';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};

export async function middleware(request: NextRequest) {
  // Check session optimistically without connection to the db
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const payload = sessionToken ? await decodeToken(sessionToken) : null;
  const isAdmin = payload?.role === 'super_admin' || payload?.role === 'admin';
  const { pathname } = request.nextUrl;

  if (pathname !== '/login' && !payload?.sub) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname !== '/login' && payload?.sub && !isAdmin) {
    await signOut({ redirectTo: '/login' });
  }

  if (pathname === '/login' && payload?.sub && !isAdmin) {
    await signOut({ redirect: false });
  }

  if (pathname === '/login' && payload?.sub && isAdmin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
