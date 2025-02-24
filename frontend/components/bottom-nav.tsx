'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

export function BottomNav() {
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  if (isLoading || !user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background py-2 px-8 md:px-16">
      <nav className="mx-auto max-w-screen-xl">
        <ul className="flex justify-around items-center">
          <li>
            <Link 
              href="/explore" 
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-sm",
                pathname === '/explore' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Compass size={24} />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/profile" 
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-sm",
                pathname === '/profile' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <User size={24} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/settings" 
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-sm",
                pathname === '/settings' ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Settings size={24} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
} 