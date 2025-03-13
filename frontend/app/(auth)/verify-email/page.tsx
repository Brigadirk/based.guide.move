'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get the access token from the URL hash
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          const type = hashParams.get('type')

          console.log('Hash params:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, type })

          if (accessToken && refreshToken) {
            const { data: { session }, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })

            if (error) throw error
            if (!session) throw new Error('No session created')

            console.log('Session set successfully:', {
              userId: session.user.id,
              email: session.user.email
            })

            router.push('/profile')
            return
          }
        }

        // If we don't have tokens in the hash, check for PKCE flow
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        if (session) {
          console.log('Session found:', {
            userId: session.user.id,
            email: session.user.email
          })
          router.push('/profile')
          return
        }

        throw new Error('No session or tokens found')
      } catch (error) {
        console.error('Error in verification:', error)
        router.push('/auth-error')
      }
    }

    handleVerification()
  }, [router, supabase.auth])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  )
} 