import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If accessing /admin but not /admin/login
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      if (!session.authenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Basic Role checking: Staff cannot access Members overview or main Overview (revenue)
      const isStaff = session.role === 'STAFF';
      const path = request.nextUrl.pathname;
      
      if (isStaff && (path === '/admin' || path === '/admin/members')) {
        // Redirect staff to Attendance as their default home
        return NextResponse.redirect(new URL('/admin/attendance', request.url));
      }

    } catch (e) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
