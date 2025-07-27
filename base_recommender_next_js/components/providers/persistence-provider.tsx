'use client'

import { useEffect, useState } from 'react'
import { useFormStore } from '@/lib/stores'

interface PersistenceProviderProps {
  children: React.ReactNode
}

export function PersistenceProvider({ children }: PersistenceProviderProps) {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // Manually trigger rehydration after component mounts
    const rehydrate = async () => {
      try {
        // Access the store to trigger rehydration
        await useFormStore.persist.rehydrate()
        console.log('🎯 Manual rehydration completed')
        setHasHydrated(true)
      } catch (error) {
        console.error('❌ Manual rehydration failed:', error)
        setHasHydrated(true) // Continue anyway with default state
      }
    }

    rehydrate()
  }, [])

  if (!hasHydrated) {
    // Show loading state during hydration
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading your saved progress...</p>
        </div>
      </div>
    )
  }

  // Return children with hydrated state
  return <>{children}</>
} 