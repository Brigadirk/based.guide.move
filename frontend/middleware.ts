import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add auth-required paths here
const authRequiredPaths = [
  '/profile', 
  '/settings', 
  '/products', 
  '/checkout',
  '/analyses'
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  console.log('Middleware - Request:', { pathname, hasToken: !!token })

  // Check if the path starts with any of the protected paths
  const isProtectedPath = authRequiredPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // If trying to access auth-required path without token, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(url)
  }

  // If trying to access login/signup while authenticated, redirect to profile
  if ((pathname === '/login' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/profile',
    '/settings',
    '/login',
    '/signup',
    '/products',
    '/checkout'
  ]
} 