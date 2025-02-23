'use client'

import Link from "next/link"
import { Button } from "./button"
import { useAuth } from "@/lib/auth-context"

export function Nav() {
  const { user } = useAuth()

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="text-xl font-medium">
          based.guide
        </Link>
        
        <div className="ml-auto flex gap-4">
          {user ? (
            <Link href="/settings">
              <Button variant="ghost">{user.name}</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 