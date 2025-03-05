'use client'

import { Profile } from "@/types/profile"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { 
  User,
  Building2, 
  Globe,
  Briefcase,
  DollarSign,
  Heart,
  Users
} from "lucide-react"

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

export function ProfileCard({ profile, className, showFinancials = false }: ProfileCardProps) {
  const { personalInformation, financialInformation, dependents } = profile || {}
  const totalIncome = showFinancials ? calculateTotalIncome(financialInformation?.incomeSources) : null

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Basic Info */}
          <div className="flex items-center justify-between">
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

          {/* Family Info */}
          <div className="flex items-center justify-between border-t pt-3">
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

          {/* Financial Info - Optional */}
          {showFinancials && (
            <div className="flex items-center justify-between border-t pt-3">
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
      </CardContent>
    </Card>
  )
} 