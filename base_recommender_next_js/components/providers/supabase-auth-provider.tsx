'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  hasMembership: boolean | null
  bananaBalance: number
  signOut: () => Promise<void>
  signIn: (email: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasMembership: null,
  bananaBalance: 0,
  signOut: async () => {},
  signIn: async () => {},
  refreshUserData: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [hasMembership, setHasMembership] = useState<boolean | null>(null)
  const [bananaBalance, setBananaBalance] = useState<number>(0)
  const [error, setError] = useState<Error | null>(null)

  const supabase = useMemo(() => {
    try {
      return createClient()
    } catch (err) {
      console.error('Failed to create Supabase client:', err)
      setError(err as Error)
      return null
    }
  }, [])

  const fetchUserData = useCallback(async (userId: string) => {
    if (!userId || !supabase) return

    try {
      // Check membership status from memberships table
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()

      if (membershipError) throw membershipError

      // Get banana balance from user_data
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (userDataError && userDataError.code !== 'PGRST116') throw userDataError

      setHasMembership(!!membership)
      setBananaBalance(userData?.analysis_tokens || 0)
      setDataLoaded(true)
    } catch (err) {
      console.error('Error fetching user data:', err)
      setHasMembership(false)
      setBananaBalance(0)
      setDataLoaded(true)
    }
  }, [supabase])

  const signIn = useCallback(async (email: string) => {
    if (!supabase) {
      toast.error('Authentication service unavailable')
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`,
        },
      })
      if (error) throw error
      toast.success('Check your email for the login link!')
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to send login link')
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    if (!supabase) {
      toast.error('Authentication service unavailable')
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setHasMembership(false)
      setBananaBalance(0)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }, [supabase, router])

  const refreshUserData = useCallback(async () => {
    if (!user?.id || !supabase) return
    await fetchUserData(user.id)
  }, [user?.id, supabase, fetchUserData])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      setDataLoaded(true)
      return
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id)
      if (session?.user) {
        setUser(session.user)
        fetchUserData(session.user.id)
      } else {
        setUser(null)
        setHasMembership(false)
        setBananaBalance(0)
        setDataLoaded(true)
      }
      setLoading(false)
    }).catch(err => {
      console.error('Error checking initial session:', err)
      setError(err)
      setLoading(false)
      setDataLoaded(true)
    })

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      if (session?.user) {
        setUser(session.user)
        fetchUserData(session.user.id)
      } else {
        setUser(null)
        setHasMembership(false)
        setBananaBalance(0)
        setDataLoaded(true)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserData])

  const value = useMemo(() => ({
    user,
    loading: loading || !dataLoaded,
    hasMembership,
    bananaBalance,
    signOut,
    signIn,
    refreshUserData
  }), [user, loading, dataLoaded, hasMembership, bananaBalance, signOut, signIn, refreshUserData])

  // Show error state if client creation failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 