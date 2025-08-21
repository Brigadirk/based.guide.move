'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores"
import { HomeIcon, GlobeIcon, BarChartIcon, UserIcon, SettingsIcon } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()
  const { user, hasMembership } = useAuthStore()

  // Don't show bottom nav on auth pages, if user is not authenticated, or if user is not a member
  if (!user || !hasMembership || pathname?.startsWith('/(auth)') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full grid-cols-5">
        <NavItem 
          href="/" 
          icon={<HomeIcon className="w-6 h-6" />} 
          label="Home" 
          isActive={pathname === '/'}
        />
        <NavItem 
          href="/explore" 
          icon={<GlobeIcon className="w-6 h-6" />} 
          label="Explore" 
          isActive={pathname === '/explore' || pathname?.startsWith('/countries')}
        />
        <NavItem 
          href="/analyses" 
          icon={<BarChartIcon className="w-6 h-6" />} 
          label="Analyses" 
          isActive={pathname === '/analyses' || pathname?.startsWith('/analyses')}
        />
        <NavItem 
          href="/profile" 
          icon={<UserIcon className="w-6 h-6" />} 
          label="Profile" 
          isActive={pathname === '/profile' || pathname?.startsWith('/profile')}
        />
        <NavItem 
          href="/settings" 
          icon={<SettingsIcon className="w-6 h-6" />} 
          label="Settings" 
          isActive={pathname === '/settings' || pathname?.startsWith('/settings')}
        />
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1",
        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  )
} 