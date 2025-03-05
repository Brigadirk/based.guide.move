'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
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
  ArrowRight,
  Baby,
  Home,
  ArrowRightIcon
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProfileSelector } from "@/components/ui/profile-selector"
import Image from "next/image"
import { getCountryFlagUrl } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
  const { isAuthenticated, isLoading, user, selectedProfile, setSelectedProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('[ProfilePage] Auth state:', { isAuthenticated, isLoading, hasUser: !!user, hasProfiles: user?.profiles?.length })
    // Only redirect after we've confirmed auth state
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router, user])

  // Don't render anything while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const handleCreateNewProfile = () => {
    router.push('/profile/new')
  }

  // Show empty state if user has no profiles
  if (!user.profiles?.length) {
    return (
      <div className="container max-w-2xl py-6 md:py-10">
        <Card className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Welcome! I'm Mr. Pro Bonobo
                </CardTitle>
                <CardDescription className="text-base">
                  Your guide to finding the perfect tax-friendly destination
                </CardDescription>
              </div>
              <span className="text-4xl">🦧</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              To provide personalized recommendations, I need to understand your situation.
              Tell me about:
            </p>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <User className="h-5 w-5 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Personal Background
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your nationality and current residency
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <Wallet className="h-5 w-5 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Financial Situation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your income sources and assets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Family Status
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your marital status and dependents
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreateNewProfile} 
              size="lg" 
              className="w-full mt-6"
            >
              Create Your First Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show profile selector if no profile is selected
  if (!selectedProfile && user.profiles.length > 0) {
    return (
      <div className="container max-w-2xl py-6 md:py-10">
        <Card>
          <CardHeader>
            <CardTitle>Select a Profile</CardTitle>
            <CardDescription>Choose a profile to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileSelector
              profiles={user.profiles}
              selectedProfile={selectedProfile}
              onSelect={setSelectedProfile}
              onCreateNew={handleCreateNewProfile}
            />
            <Button 
              onClick={handleCreateNewProfile}
              variant="outline"
              className="w-full mt-4"
            >
              Create New Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Add null check for selected profile
  if (!selectedProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  const progress = calculateProgress(selectedProfile)
  const totalIncome = calculateTotalIncome(selectedProfile.financialInformation?.incomeSources || [])
  const netWorth = calculateNetWorth(
    selectedProfile.financialInformation?.assets || [],
    selectedProfile.financialInformation?.liabilities || []
  )

  const EditProfileButton = () => (
    <div className="px-6 pb-6 mt-6">
      <Link href={`/profile/edit/${selectedProfile?.id}`} className="w-full">
        <Button className="w-full">
          Edit Profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  )

  const TabContent = () => {
    // Re-calculate these values whenever the component re-renders
    const currentTotalIncome = calculateTotalIncome(selectedProfile.financialInformation?.incomeSources || [])
    const currentNetWorth = calculateNetWorth(
      selectedProfile.financialInformation?.assets || [],
      selectedProfile.financialInformation?.liabilities || []
    )

    const birthCountry = selectedProfile.personalInformation?.nationalities?.[0]?.country
    const residenceCountry = selectedProfile.personalInformation?.currentResidency?.country

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
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {selectedProfile.avatar ? (
                    <AvatarImage src={selectedProfile.avatar} alt={selectedProfile.nickname} />
                  ) : (
                    <AvatarFallback>
                      {selectedProfile.nickname?.slice(0, 2).toUpperCase() || 'NA'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProfile.nickname}</h3>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-muted-foreground">Country of Birth</label>
                    <label className="text-sm text-muted-foreground">Current Residence</label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Baby className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 relative">
                          <Image
                            src={getCountryFlagUrl(birthCountry?.toLowerCase() || 'un')}
                            alt={`${birthCountry || 'Unknown'} flag`}
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        <span className="text-sm font-medium">{birthCountry || 'Unknown'}</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 relative">
                          <Image
                            src={getCountryFlagUrl(residenceCountry?.toLowerCase() || 'un')}
                            alt={`${residenceCountry || 'Unknown'} flag`}
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                        <span className="text-sm font-medium">{residenceCountry || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedProfile.personalInformation?.dateOfBirth || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Marital Status</label>
                    <p className="font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {selectedProfile.personalInformation?.maritalStatus || "Not set"}
                    </p>
                  </div>
                </div>
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
                  {currentTotalIncome || "Not set"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Primary Occupation</label>
                <p className="font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  {selectedProfile.financialInformation?.incomeSources?.[0]?.type || "Not set"}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Net Worth</label>
                <p className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  {currentNetWorth || "Not set"}
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
                  {selectedProfile.personalInformation?.maritalStatus || "Not set"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Dependents</label>
                {selectedProfile.dependents?.length ? (
                  <div className="grid gap-2">
                    {selectedProfile.dependents.map((dependent, index) => (
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
    )
  }

  return (
    <div className="container max-w-2xl py-6 md:py-10">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Select Profile
          </div>
          <div className="shrink-0">
            <ProfileSelector
              profiles={user.profiles}
              selectedProfile={selectedProfile}
              onSelect={setSelectedProfile}
              onCreateNew={handleCreateNewProfile}
            />
          </div>
        </div>

        <div className="space-y-6">
          {progress.completed < progress.total && (
            <Card className="border-yellow-500">
              <CardHeader>
                <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                <CardDescription>
                  {progress.completed} of {progress.total} sections completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!progress.sections.basic && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Complete Basic Information
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add your date of birth and current residency
                        </p>
                      </div>
                    </div>
                  )}
                  {!progress.sections.tax && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                        <Wallet className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Add Financial Information
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add at least one income source
                        </p>
                      </div>
                    </div>
                  )}
                  {!progress.sections.lifestyle && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                        <Users className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Add Lifestyle Information
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Set your marital status
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <TabContent />
        </div>
      </div>
    </div>
  )
} 