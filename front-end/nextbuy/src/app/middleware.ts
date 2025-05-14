import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';



export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');

  if (!token) {
    // if the user is not authenticated it will redirect to the login page
    return NextResponse.redirect(new URL('auth/login', req.url));
  }
  return NextResponse.next();
}


export const config = {
  matcher: ['/profile/:path*', '/checkout/:path*'], // Protect these routes
}