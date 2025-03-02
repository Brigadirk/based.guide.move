'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, User, Settings, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    {
      href: '/explore',
      icon: <Compass size={24} />,
      label: 'Explore'
    },
    {
      href: '/analyses',
      icon: <FileText size={24} />,
      label: 'Analyses'
    },
    {
      href: '/profile',
      icon: <User size={24} />,
      label: 'Profile'
    },
    {
      href: '/settings',
      icon: <Settings size={24} />,
      label: 'Settings'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background py-2 px-8 md:px-16">
      <nav className="mx-auto max-w-screen-xl">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-sm",
                  pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 