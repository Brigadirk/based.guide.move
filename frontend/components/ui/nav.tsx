'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export function Nav() {
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          based.guide
        </Link>
        <nav>
          {isLoading ? null : (
            user ? (
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
            ) : (
              <div className="space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  )
} 