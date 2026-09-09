import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // 1. Admin routes protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Exception: admin login page (if hosted on /admin/login)
    if (pathname === '/admin/login') {
      if (session && session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!session || session.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/?error=unauthorized_admin', request.url));
    }
    return NextResponse.next();
  }

  // 2. Student first-login route logic
  if (pathname === '/first-login') {
    if (!session || session.role !== 'student') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (session.profileCompleted) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 3. Student routes protection
  if (pathname.startsWith('/student') || pathname.startsWith('/api/student')) {
    if (!session || session.role !== 'student') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized. Student access required.' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/?error=unauthorized_student', request.url));
    }

    // Force profile completion if profile_completed is false
    if (!session.profileCompleted && pathname !== '/first-login' && pathname !== '/api/student/profile') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Profile incomplete', redirect: '/first-login' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/first-login', request.url));
    }

    return NextResponse.next();
  }

  // 4. Redirect logged in users visiting root login page
  if (pathname === '/') {
    if (session) {
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (session.role === 'student') {
        if (!session.profileCompleted) {
          return NextResponse.redirect(new URL('/first-login', request.url));
        }
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/first-login',
    '/admin/:path*',
    '/student/:path*',
    '/api/admin/:path*',
    '/api/student/:path*',
  ],
};
