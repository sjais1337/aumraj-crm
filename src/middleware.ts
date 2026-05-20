import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(request) {
    const { admin, support, slaEntry, slaReport } = request.nextauth.token;

    console.log(request.nextauth.token);

    if (request.nextUrl.pathname.startsWith('/admin') && !admin) {
      return NextResponse.redirect(new URL('/users/permissions', request.url));
    }

    if(request.nextUrl.pathname.startsWith('/users/sla/entry') && !slaEntry) {
      return NextResponse.redirect(new URL('/users/permissions', request.url));
    }

    if(request.nextUrl.pathname.startsWith('/users/support/add') && !support){
	console.log("bullshit");
    	return NextResponse.redirect(new URL('/users/permissions', request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/'
    },
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/users/:path*',
    '/admin/:path*',
    '/groups/:path*'
  ]
};
