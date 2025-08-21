"use client"

import { create } from 'zustand'
import { toast } from 'sonner'

// Simplified user type for now (can be extended with supabase later)
interface User {
  id: string
  email?: string
  [key: string]: any
}

interface AuthStoreState {
  user: User | null
  loading: boolean
  hasMembership: boolean | null
  bananaBalance: number
  error: Error | null
  dataLoaded: boolean
  signOut: () => Promise<void>
  signIn: (email: string) => Promise<void>
  refreshUserData: () => Promise<void>
  initializeAuth: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setHasMembership: (hasMembership: boolean | null) => void
  setBananaBalance: (balance: number) => void
  setDataLoaded: (loaded: boolean) => void
  setError: (error: Error | null) => void
}

export const useAuthStore = create<AuthStoreState>((set, get) => {
  // TODO: Replace with actual supabase implementation once supabase is properly configured
  const fetchUserData = async (userId: string) => {
    console.log('[AuthStore] fetchUserData called for:', userId)
    // Mock implementation for now
    set({
      hasMembership: false,
      bananaBalance: 0,
      dataLoaded: true
    })
  }

  return {
    user: null,
    loading: false, // Start with false since no real auth yet
    hasMembership: null,
    bananaBalance: 0,
    error: null,
    dataLoaded: true, // Start with true since no real data loading yet

    signOut: async () => {
      try {
        console.log('[AuthStore] Signing out user')
        set({
          user: null,
          hasMembership: false,
          bananaBalance: 0,
          dataLoaded: true
        })
        
        console.log('[AuthStore] Sign out successful')
        toast.success('Signed out successfully')
      } catch (error) {
        console.error('[AuthStore] Sign out error:', error)
        set({ error: error as Error })
        toast.error('Failed to sign out')
      }
    },

    signIn: async (email: string) => {
      try {
        console.log('[AuthStore] Attempting to sign in with email:', email)
        set({ loading: true, error: null })
        
        // Mock implementation for now
        console.log('[AuthStore] Magic link sent successfully (mock)')
        toast.success('Magic link sent! Check your email.')
      } catch (error) {
        console.error('[AuthStore] Sign in error:', error)
        set({ error: error as Error })
        toast.error('Failed to send magic link')
      } finally {
        set({ loading: false })
      }
    },

    refreshUserData: async () => {
      const { user } = get()
      if (user?.id) {
        await fetchUserData(user.id)
      }
    },

    initializeAuth: async () => {
      try {
        console.log('[AuthStore] Initializing auth (mock implementation)')
        // Mock implementation - no real auth setup yet
        set({
          user: null,
          hasMembership: false,
          bananaBalance: 0,
          dataLoaded: true,
          loading: false
        })
      } catch (err) {
        console.error('[AuthStore] Auth initialization error:', err)
        set({
          error: err as Error,
          loading: false,
          dataLoaded: true
        })
      }
    },

    // Setter methods for manual state updates if needed
    setUser: (user: User | null) => set({ user }),
    setLoading: (loading: boolean) => set({ loading }),
    setHasMembership: (hasMembership: boolean | null) => set({ hasMembership }),
    setBananaBalance: (bananaBalance: number) => set({ bananaBalance }),
    setDataLoaded: (dataLoaded: boolean) => set({ dataLoaded }),
    setError: (error: Error | null) => set({ error }),
  }
}) 