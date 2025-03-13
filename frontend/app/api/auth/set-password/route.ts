import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ message: 'Password set successfully' })

    // Create a Supabase server client
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
            })
          },
          remove(name: string, options: { expires?: Date }) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error('Error setting password:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return response
  } catch (error: any) {
    console.error('Password setting error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to set password' },
      { status: 500 }
    )
  }
} 