import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    console.error('No code provided in magic link callback')
    return NextResponse.redirect(new URL('/auth-error', request.url))
  }

  try {
    // Create response early to handle cookies
    const response = NextResponse.redirect(new URL('/profile', request.url))

    // Create server client to handle the code exchange
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: { expires?: Date }) {
            response.cookies.set({
              name,
              value,
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7 // 1 week
            })
          },
          remove(name: string, options: { expires?: Date }) {
            response.cookies.delete({
              name,
              ...options,
              path: '/',
              maxAge: 0,
            })
          },
        },
      }
    )

    // Exchange the code for a session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error

    if (!session) {
      throw new Error('No session created')
    }

    // Verify the session was created and cookies are set
    const { data: { session: verifiedSession }, error: verifyError } = await supabase.auth.getSession()
    if (verifyError || !verifiedSession) {
      throw verifyError || new Error('Session verification failed')
    }

    console.log('Auth callback success:', {
      hasSession: true,
      userId: session.user.id,
      email: session.user.email,
      accessToken: !!session.access_token,
      refreshToken: !!session.refresh_token
    })

    return response
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth-error', request.url))
  }
} 