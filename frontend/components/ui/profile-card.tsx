'use client'

import { Profile } from "@/types/profile"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  User,
  Building2, 
  Globe,
  Briefcase,
  DollarSign,
  Heart,
  Users,
  Wallet
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface ProfileCardProps {
  profile: Profile
  className?: string
  showFinancials?: boolean
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

export function ProfileCard({ profile, className, showFinancials = false }: ProfileCardProps) {
  const { personalInformation, financialInformation, dependents } = profile || {}
  const totalIncome = showFinancials ? calculateTotalIncome(financialInformation?.incomeSources) : null
  const netWorth = showFinancials ? calculateNetWorth(financialInformation?.assets, financialInformation?.liabilities) : null

  return (
    <Accordion type="single" collapsible className={cn("w-full", className)}>
      <AccordionItem value="profile" className="border-none">
        <Card>
          <AccordionTrigger className="w-full hover:no-underline">
            <div className="flex items-center justify-between w-full p-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.nickname} />
                  ) : (
                    <AvatarFallback>
                      {profile.nickname ? profile.nickname.slice(0, 2).toUpperCase() : "NA"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium text-left">{profile.nickname || "Unnamed Profile"}</h3>
                  {showFinancials && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{totalIncome || "No income"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        <span>{netWorth || "No net worth"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent>
            <div className="px-4 pb-4 space-y-4">
              {/* Location Information */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {personalInformation?.nationalities?.[0]?.country || "Not set"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>Nationality</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {personalInformation?.currentResidency?.country || "Not set"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>Current</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {personalInformation?.maritalStatus || "Not set"}
                    </span>
                    <span className="text-xs text-muted-foreground">Status</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {dependents?.length || "No"} {(dependents?.length || 0) === 1 ? "dependent" : "dependents"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Family</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information - Optional */}
              {showFinancials && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {financialInformation?.incomeSources?.[0]?.type || "Not set"}
                      </span>
                      <span className="text-xs text-muted-foreground">Occupation</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium">
                        {totalIncome || "Not set"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>Income</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  )
} 