'use client'

import Link from "next/link"
import { useAuthStore } from "@/lib/stores"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function Nav() {
  const { user, loading, signOut, hasMembership, bananaBalance } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSignOutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('[Nav] Sign out button clicked')
    await signOut()
    router.push('/')
  }

  const handlePurchaseMembership = async () => {
    if (!user?.email) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      router.push(url)
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state only during initial load
  if (loading) {
    return (
      <header className="sticky top-6 z-50 flex justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-full border border-border/50 shadow-lg px-6 py-3 flex items-center justify-between min-w-[400px]">
          <Link href="/" className="font-crimson text-2xl font-bold text-foreground hover:opacity-80 transition-opacity">
            based.guide
          </Link>
          <div className="text-sm opacity-70">Loading...</div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-6 z-50 flex justify-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-full border border-border/50 shadow-lg px-6 py-3 flex items-center justify-between min-w-[400px]">
        <Link href="/" className="font-crimson text-2xl font-bold text-foreground hover:opacity-80 transition-opacity">
          based.guide
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            hasMembership ? (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🍌</span>
                  <span>{bananaBalance}</span>
                </div>
                <Button
                  onClick={() => router.push('/products')}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Get More
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handlePurchaseMembership}
                  disabled={isLoading}
                  variant="default"
                  className="rounded-full"
                >
                  {isLoading ? 'Processing...' : 'Get Membership'}
                </Button>
                <Button
                  onClick={handleSignOutClick}
                  variant="outline"
                  className="rounded-full"
                >
                  Sign Out
                </Button>
              </>
            )
          ) : (
            <Button
              onClick={() => router.push('/auth')}
              variant="default"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Join
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 