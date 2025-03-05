'use client'

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/user"

export function Nav() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/login')
  }

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/signup')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-chomsky text-3xl tracking-wide hover:opacity-80 transition-opacity">
          based.guide
        </Link>
        <nav>
          {!isAuthenticated ? (
            <div className="space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLoginClick}
              >
                Log in
              </Button>
              <Button 
                size="sm"
                onClick={handleSignupClick}
              >
                Sign up
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span>🍌</span>
                <span>{user?.analysisTokens || 0}</span>
              </div>
              <Link href="/products">
                <Button size="sm" variant="outline">
                  Get more bananas
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
} 