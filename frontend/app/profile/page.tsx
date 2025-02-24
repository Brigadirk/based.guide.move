'use client'

import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProfileProgressBar } from "@/components/profile-progress"
import Link from "next/link"
import { Profile, ProfileProgress } from "@/types/profile"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Mock profile data - replace with real data later
const mockProfile: Profile = {
  email: "",
  income: null,
  occupation: "",
  currentCountry: "",
  interestedCountries: [],
  taxPreferences: {
    maxTaxRate: null,
    corporateTaxImportant: false,
    vatImportant: false
  },
  lifestyle: {
    remoteWork: false,
    costOfLiving: null,
    climatePreference: null
  }
}

function calculateProgress(profile: Profile): ProfileProgress {
  const sections = {
    basic: Boolean(profile.income && profile.occupation && profile.currentCountry),
    tax: Boolean(profile.taxPreferences.maxTaxRate),
    lifestyle: Boolean(profile.lifestyle.costOfLiving && profile.lifestyle.climatePreference)
  }

  const completed = Object.values(sections).filter(Boolean).length
  
  return {
    total: 3,
    completed,
    sections
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const profile = { ...mockProfile, email: user.email }
  const progress = calculateProgress(profile)

  return (
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
                  <span>{profile.income ? `$${profile.income.toLocaleString()}/year` : "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Occupation</span>
                  <span>{profile.occupation || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Current Country</span>
                  <span>{profile.currentCountry || "Not set"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Tax Preferences</h3>
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Maximum Tax Rate</span>
                  <span>{profile.taxPreferences.maxTaxRate ? `${profile.taxPreferences.maxTaxRate}%` : "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Corporate Tax Important</span>
                  <span>{profile.taxPreferences.corporateTaxImportant ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Lifestyle Preferences</h3>
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Remote Work</span>
                  <span>{profile.lifestyle.remoteWork ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Cost of Living</span>
                  <span className="capitalize">{profile.lifestyle.costOfLiving || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Climate Preference</span>
                  <span className="capitalize">{profile.lifestyle.climatePreference || "Not set"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 