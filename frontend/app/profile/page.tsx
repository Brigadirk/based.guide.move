'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ProfileProgressBar } from "@/components/profile-progress"
import { ProfileAlertBanner } from "@/components/profile-alert-banner"
import Link from "next/link"
import { Profile, ProfileProgress } from "@/types/profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Wallet, 
  MapPin, 
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
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

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

  const profile = { ...mockProfile, email: "user@example.com" }
  const progress = calculateProgress(profile)
  const totalIncome = calculateTotalIncome(profile.financialInformation?.incomeSources)
  const netWorth = calculateNetWorth(profile.financialInformation?.assets, profile.financialInformation?.liabilities)

  return (
    <>
      <ProfileAlertBanner />
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        <div className="flex flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">
            Tell Mr. Pro Bonobo about yourself
          </p>
          <Link href="/profile/edit">
            <Button>
              Edit Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <ProfileProgressBar progress={progress} />
          </CardContent>
        </Card>

        <div className="min-h-[500px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-1 h-auto">
              <TabsTrigger value="overview" className="gap-2 py-2 sm:py-3">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2 py-2 sm:py-3">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Financial</span>
                <span className="sm:hidden">Money</span>
              </TabsTrigger>
              <TabsTrigger value="residency" className="gap-2 py-2 sm:py-3">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Residency</span>
                <span className="sm:hidden">Move</span>
              </TabsTrigger>
              <TabsTrigger value="family" className="gap-2 py-2 sm:py-3">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Family</span>
                <span className="sm:hidden">Family</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {profile.email}
                      </p>
                    </div>
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
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4 m-0">
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
                </Card>
              </TabsContent>

              <TabsContent value="residency" className="space-y-4 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Residency Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Move Type</label>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {profile.residencyIntentions?.moveType || "Not set"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Intended Country</label>
                      <p className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        {profile.residencyIntentions?.intendedCountry || "Not set"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-muted-foreground">Duration of Stay</label>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {profile.residencyIntentions?.durationOfStay || "Not set"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="family" className="space-y-4 m-0">
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
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  )
} 