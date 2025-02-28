'use client'

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { useRouter } from "next/navigation"

export function Nav() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  
  console.log('Nav rendering:', { isAuthenticated, user })

  console.log('Nav - Current user:', user); // Debug log

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Login clicked, redirecting to /login')
    router.push('/login')
  }

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Signup clicked, redirecting to /signup')
    router.push('/signup')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
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
          ) : user?.isMember ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4" />
                <span>{user.analysisTokens} tokens</span>
              </div>
              <Link href="/products">
                <Button size="sm" variant="outline">
                  Get more tokens
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button size="sm">
                  Get personalized analysis
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
} 