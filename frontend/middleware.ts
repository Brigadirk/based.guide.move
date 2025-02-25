import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth-required paths
const protectedPaths = ['/profile', '/settings']
// Auth-forbidden paths (when already logged in)
const authPaths = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const isAuthenticated = !!token
  const path = request.nextUrl.pathname

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authPaths.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && protectedPaths.includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [...protectedPaths, ...authPaths]
} 