'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Compass, User, Settings, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { ProfileBadge } from "@/components/ui/profile-badge"

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated, user, selectedProfile } = useAuth()

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
      label: 'Profile',
      badge: selectedProfile && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <ProfileBadge profile={selectedProfile} variant="xs" />
        </div>
      )
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
            <li key={item.href} className="relative">
              <Link 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center gap-1 p-2 text-sm",
                  pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
} 