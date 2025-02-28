'use client'

import { useAuth } from "@/lib/auth-context"
import { AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Profile } from "@/types/profile"
import { User } from "@/types/user"

// Minimum required fields for basic profile completion
const hasMinimumProfile = (user: User | null) => {
  // Early return if no user
  if (!user) return false;

  // Check if user has analyzed any countries
  const hasAnalyzedCountries = user.analyzedCountries && user.analyzedCountries.length > 0;

  // Check profile completeness
  const hasCompleteProfile = Boolean(
    user.profile?.personalInformation?.currentResidency?.country &&
    user.profile?.financialInformation?.incomeSources?.length &&
    user.profile?.residencyIntentions?.intendedCountry
  );

  return hasCompleteProfile || hasAnalyzedCountries;
}

export function ProfileAlertBanner() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()
  
  // Reset dismissed state when route changes
  useEffect(() => {
    setDismissed(false)
  }, [pathname])

  // Don't show on profile edit page or if already dismissed
  if (dismissed || pathname === '/profile/edit' || !user) {
    return null
  }

  // Check if profile has minimum required data
  const hasCompleteProfile = hasMinimumProfile(user)
  
  if (hasCompleteProfile) {
    return null
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-x-4 flex-grow pr-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Pro Bonobo needs more information about you to provide personalized recommendations.{' '}
            <Link href="/profile/edit" className="font-medium underline underline-offset-4">
              Complete your profile
            </Link>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-primary-foreground/10 rounded shrink-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>
    </div>
  )
} 