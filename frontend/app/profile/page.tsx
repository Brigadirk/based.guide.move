'use client'

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProfileProgressBar } from "@/components/profile-progress"
import { ProfileAlertBanner } from "@/components/profile-alert-banner"
import Link from "next/link"
import { Profile, ProfileProgress } from "@/types/profile"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// Mock profile data - replace with real data later
const mockProfile: Profile = {
  personalInformation: {
    dateOfBirth: "",
    nationalities: [],
    maritalStatus: "Single",
    currentResidency: {
      country: "",
      status: "Citizen"
    }
  },
  financialInformation: {
    incomeSources: [],
    assets: [],
    liabilities: []
  },
  residencyIntentions: {
    moveType: "Digital Nomad",
    intendedCountry: "",
    durationOfStay: "1 year",
    preferredMaximumStayRequirement: "3 months",
    notes: ""
  },
  dependents: []
}

function calculateProgress(profile: Profile): ProfileProgress {
  const sections = {
    basic: Boolean(
      profile.personalInformation?.currentResidency?.country &&
      profile.financialInformation?.incomeSources?.length
    ),
    tax: Boolean(profile.financialInformation?.incomeSources?.length),
    lifestyle: Boolean(profile.residencyIntentions?.intendedCountry)
  }

  const completed = Object.values(sections).filter(Boolean).length
  
  return {
    total: 3,
    completed,
    sections
  }
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after we've confirmed auth state
    if (!isLoading && !isAuthenticated) {
      router.replace('/login') // Use replace instead of push
    }
  }, [isAuthenticated, isLoading, router])

  // Don't render anything while checking auth
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const profile = { ...mockProfile, email: "user@example.com" }
  const progress = calculateProgress(profile)

  return (
    <>
      <ProfileAlertBanner />
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <Link href="/profile/edit">
              <Button>Edit Profile</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProfileProgressBar progress={progress} />
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Basic Information</h3>
                <div className="grid gap-2 mt-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Income</span>
                    <span>{profile.financialInformation?.incomeSources?.[0]?.amount ? `$${profile.financialInformation.incomeSources[0].amount.toLocaleString()}/year` : "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Occupation</span>
                    <span>{profile.financialInformation?.incomeSources?.[0]?.type || "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Current Country</span>
                    <span>{profile.personalInformation?.currentResidency?.country || "Not set"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Lifestyle Preferences</h3>
                <div className="grid gap-2 mt-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Move Type</span>
                    <span>{profile.residencyIntentions?.moveType || "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Intended Country</span>
                    <span className="capitalize">{profile.residencyIntentions?.intendedCountry || "Not set"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Duration of Stay</span>
                    <span className="capitalize">{profile.residencyIntentions?.durationOfStay || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 