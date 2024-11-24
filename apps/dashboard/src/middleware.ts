import { NextResponse, type NextRequest } from 'next/server';

import { auth, signOut } from '~/shared/api';

export const config = {
  matcher: ['/login', '/'],
};

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuthenticated = session?.user?.id;
  const { pathname } = request.nextUrl;

  if (isAuthenticated) {
    const isAdmin =
      session.user?.role === 'super_admin' || session.user?.role === 'admin';
    if (pathname === '/login') {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      await signOut({ redirect: false });
      return NextResponse.next();
    } else {
      if (isAdmin) {
        return NextResponse.next();
      }
      await signOut({ redirectTo: '/login' });
    }
  } else {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}
