import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const isAuthPage = request.nextUrl.pathname === '/login' || 
                     request.nextUrl.pathname === '/signup'
  
  // If trying to access auth pages while logged in
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  // If trying to access protected pages while logged out
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile') || 
                          request.nextUrl.pathname.startsWith('/settings')
  
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/signup'
  ]
} 