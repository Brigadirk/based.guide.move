'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ProfileAlertBanner } from "@/components/layout/profile-alert-banner"
import Link from "next/link"
import { Profile, ProfileProgress } from "@/types/profile"
import { ScrollableContainer } from "@/components/ui/scrollable-container"
import { 
  User, 
  Wallet,
  Users, 
  Heart,
  Calendar,
  Globe,
  Building2,
  Briefcase,
  DollarSign,
  Clock,
  ArrowRight
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfileSelector } from "@/components/ui/profile-selector"

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
  dependents: []
}

// Mock profiles array - replace with real data later
const mockProfiles: Profile[] = [mockProfile]

function calculateProgress(profile: Profile): ProfileProgress {
  const sections = {
    basic: Boolean(
      profile.personalInformation?.currentResidency?.country &&
      profile.personalInformation?.dateOfBirth
    ),
    tax: Boolean(profile.financialInformation?.incomeSources?.length),
    lifestyle: Boolean(profile.personalInformation?.maritalStatus)
  }

  const completed = Object.values(sections).filter(Boolean).length
  
  return {
    total: 3,
    completed,
    sections
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}

function calculateTotalIncome(incomeSources: Profile['financialInformation']['incomeSources']) {
  if (!incomeSources?.length) return null
  
  // Group by currency
  const byCurrency = incomeSources.reduce((acc, source) => {
    acc[source.currency] = (acc[source.currency] || 0) + source.amount
    return acc
  }, {} as Record<string, number>)

  return Object.entries(byCurrency).map(([currency, amount]) => 
    formatCurrency(amount, currency)
  ).join(' + ')
}

function calculateNetWorth(assets: Profile['financialInformation']['assets'], liabilities: Profile['financialInformation']['liabilities']) {
  if (!assets?.length && !liabilities?.length) return null

  // Group assets by currency
  const assetsByCurrency = assets.reduce((acc, asset) => {
    acc[asset.currency] = (acc[asset.currency] || 0) + asset.value
    return acc
  }, {} as Record<string, number>)

  // Group liabilities by currency
  const liabilitiesByCurrency = liabilities.reduce((acc, liability) => {
    acc[liability.currency] = (acc[liability.currency] || 0) + liability.amount
    return acc
  }, {} as Record<string, number>)

  // Calculate net worth for each currency
  const currencies = [...new Set([...Object.keys(assetsByCurrency), ...Object.keys(liabilitiesByCurrency)])]
  return currencies.map(currency => {
    const assets = assetsByCurrency[currency] || 0
    const liabilities = liabilitiesByCurrency[currency] || 0
    return formatCurrency(assets - liabilities, currency)
  }).join(' + ')
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(mockProfiles[0])

  useEffect(() => {
    // Only redirect after we've confirmed auth state
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Don't render anything while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const handleCreateNewProfile = () => {
    router.push('/profile/new')
  }

  const profile = selectedProfile || mockProfile
  const progress = calculateProgress(profile)
  const totalIncome = calculateTotalIncome(profile.financialInformation?.incomeSources)
  const netWorth = calculateNetWorth(profile.financialInformation?.assets, profile.financialInformation?.liabilities)

  const EditProfileButton = () => (
    <div className="px-6 pb-6 mt-6">
      <Link href="/profile/edit" className="w-full">
        <Button className="w-full">
          Edit Profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: <User className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Date of Birth</label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {profile.personalInformation?.dateOfBirth || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Nationality</label>
              <p className="font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {profile.personalInformation?.nationalities?.[0]?.country || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Current Country</label>
              <p className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {profile.personalInformation?.currentResidency?.country || "Not set"}
              </p>
            </div>
          </CardContent>
          <EditProfileButton />
        </Card>
      )
    },
    {
      value: "financial",
      label: "Financial",
      icon: <Wallet className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Total Annual Income</label>
              <p className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {totalIncome || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Primary Occupation</label>
              <p className="font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {profile.financialInformation?.incomeSources?.[0]?.type || "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Net Worth</label>
              <p className="font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                {netWorth || "Not set"}
              </p>
            </div>
          </CardContent>
          <EditProfileButton />
        </Card>
      )
    },
    {
      value: "family",
      label: "Family",
      icon: <Users className="h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Family Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Marital Status</label>
              <p className="font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                {profile.personalInformation?.maritalStatus || "Not set"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Dependents</label>
              {profile.dependents?.length ? (
                <div className="grid gap-2">
                  {profile.dependents.map((dependent, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{dependent.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dependent.relationship}, {dependent.age} years old
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No dependents added</p>
              )}
            </div>
          </CardContent>
          <EditProfileButton />
        </Card>
      )
    }
  ]

  return (
    <>
      <ProfileAlertBanner />
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex flex-row justify-between items-center">
          <div className="w-full">
            <ProfileSelector
              profiles={mockProfiles}
              selectedProfile={selectedProfile}
              onSelect={setSelectedProfile}
              onCreateNew={handleCreateNewProfile}
            />
          </div>
        </div>

        <Tabs defaultValue={tabs[0].value} className="w-full">
          <TabsList className="flex space-x-2 w-full">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
} 