"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, Info, AlertTriangle, Shield, PiggyBank, Building, Globe, Users, CreditCard } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

const PENSION_SCHEME_TYPES = [
  "Employer-sponsored plan",
  "Personal retirement account", 
  "National voluntary scheme",
  "Industry-wide plan",
  "Cross-border pension",
  "Other"
]

export function SocialSecurityPensions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const currencies = useCurrencies()

  // Check if finance details are being skipped
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  // Get destination country for context
  const destCountry = getFormData("destination.country") ?? ""
  const countryPhrase = destCountry || "your destination country"

  // Social Security
  const receivingBenefits = getFormData("socialSecurityAndPensions.currentBenefits.receiving") ?? false
  const benefitAmount = getFormData("socialSecurityAndPensions.currentBenefits.monthlyAmount") ?? 0
  const benefitCurrency = getFormData("socialSecurityAndPensions.currentBenefits.currency") ?? "USD"
  const willReceiveBenefits = getFormData("socialSecurityAndPensions.futureBenefits.willReceive") ?? false
  const expectedAmount = getFormData("socialSecurityAndPensions.futureBenefits.expectedMonthlyAmount") ?? 0
  const expectedCurrency = getFormData("socialSecurityAndPensions.futureBenefits.currency") ?? "USD"
  const expectedStartYear = getFormData("socialSecurityAndPensions.futureBenefits.expectedStartYear") ?? ""

  // Pension Contributions
  const currentlyContributing = getFormData("socialSecurityAndPensions.futurePensionContributions.currentlyContributing") ?? false
  const pensionSchemes = getFormData("socialSecurityAndPensions.futurePensionContributions.details") ?? []

  const [newPensionScheme, setNewPensionScheme] = useState({
    pensionType: "Employer-sponsored plan",
    otherPensionType: "",
    contributionAmount: 0,
    currency: "USD",
    country: ""
  })

  const handleComplete = () => {
    markSectionComplete("socialSecurity")
    onComplete()
  }

  const canContinue = true // This section is optional

  const canAddPensionScheme = newPensionScheme.contributionAmount > 0 && newPensionScheme.country && 
    (newPensionScheme.pensionType !== "Other" || newPensionScheme.otherPensionType)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Social Security & Pensions</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your current and future social security benefits and pension contributions
        </p>
      </div>

      <SectionHint title="About this section">
        Social security and pension information helps with tax planning, totalization agreements, and understanding how your benefits may be affected by international relocation.
      </SectionHint>

      {skipFinanceDetails ? (
        /* Skip mode - simplified summary */
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">🚀 Social Security & Pensions details skipped</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Per your earlier choice to skip detailed finance sections
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => updateFormData("finance.skipDetails", false)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Enable Details
            </Button>
          </div>
        </div>
      ) : (
        /* Full detailed mode */
        <>
          {/* Current Social Security Benefits Card */}
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Current Social Security Benefits
              </CardTitle>
              <p className="text-sm text-muted-foreground">Benefits you are currently receiving</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="receiving_benefits"
                    checked={receivingBenefits}
                    onCheckedChange={(v) => updateFormData("socialSecurityAndPensions.currentBenefits.receiving", !!v)}
                  />
                  <Label htmlFor="receiving_benefits" className="text-base font-medium">
                    I am currently receiving social security benefits
                  </Label>
                </div>

                {receivingBenefits && (
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h4 className="font-medium text-base">Current Benefits Details</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Monthly benefit amount *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="1500"
                          value={benefitAmount || ""}
                          onChange={(e) => updateFormData("socialSecurityAndPensions.currentBenefits.monthlyAmount", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency *</Label>
                        <Select
                          value={benefitCurrency}
                          onValueChange={(v) => updateFormData("socialSecurityAndPensions.currentBenefits.currency", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Future Social Security Benefits Card */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <PiggyBank className="w-6 h-6 text-blue-600" />
                Future Social Security Benefits
              </CardTitle>
              <p className="text-sm text-muted-foreground">Benefits you expect to receive</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="will_receive_benefits"
                    checked={willReceiveBenefits}
                    onCheckedChange={(v) => updateFormData("socialSecurityAndPensions.futureBenefits.willReceive", !!v)}
                  />
                  <Label htmlFor="will_receive_benefits" className="text-base font-medium">
                    I expect to receive social security benefits in the future
                  </Label>
                </div>

                {willReceiveBenefits && (
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h4 className="font-medium text-base">Expected Benefits Details</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Expected monthly amount *</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="2000"
                          value={expectedAmount || ""}
                          onChange={(e) => updateFormData("socialSecurityAndPensions.futureBenefits.expectedMonthlyAmount", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency *</Label>
                        <Select
                          value={expectedCurrency}
                          onValueChange={(v) => updateFormData("socialSecurityAndPensions.futureBenefits.currency", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expected start year *</Label>
                        <Input
                          type="number"
                          min="2024"
                          max="2080"
                          placeholder="2055"
                          value={expectedStartYear}
                          onChange={(e) => updateFormData("socialSecurityAndPensions.futureBenefits.expectedStartYear", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Future Pension Contributions Card */}
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Building className="w-6 h-6 text-green-600" />
                Future Pension Contributions
              </CardTitle>
              <p className="text-sm text-muted-foreground">Pension plans you will contribute to after moving</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="contributing_pensions"
                    checked={currentlyContributing}
                    onCheckedChange={(v) => updateFormData("socialSecurityAndPensions.futurePensionContributions.currentlyContributing", !!v)}
                  />
                  <Label htmlFor="contributing_pensions" className="text-base font-medium">
                    I plan to contribute to pension schemes in {countryPhrase}
                  </Label>
                </div>

                {currentlyContributing && (
                  <div className="space-y-6">
                    {/* Existing pension schemes */}
                    {pensionSchemes.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Your Future Pension Contributions</h4>
                        {pensionSchemes.map((scheme: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-lg bg-card">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">
                                    {scheme.pensionType === "Other" ? scheme.otherPensionType : scheme.pensionType}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {scheme.contributionAmount} {scheme.currency}/month in {scheme.country}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = pensionSchemes.filter((_: any, i: number) => i !== idx)
                                  updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updated)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new pension scheme */}
                    <div className="p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base mb-4">Add Future Pension Contribution</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Pension scheme type *</Label>
                          <Select
                            value={newPensionScheme.pensionType}
                            onValueChange={(v) => setNewPensionScheme({...newPensionScheme, pensionType: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PENSION_SCHEME_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {newPensionScheme.pensionType === "Other" && (
                          <div className="space-y-2">
                            <Label>Specify pension type *</Label>
                            <Input
                              placeholder="Describe the pension type"
                              value={newPensionScheme.otherPensionType}
                              onChange={(e) => setNewPensionScheme({...newPensionScheme, otherPensionType: e.target.value})}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Monthly contribution amount *</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="500"
                            value={newPensionScheme.contributionAmount || ""}
                            onChange={(e) => setNewPensionScheme({...newPensionScheme, contributionAmount: parseFloat(e.target.value) || 0})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Currency *</Label>
                          <Select
                            value={newPensionScheme.currency}
                            onValueChange={(v) => setNewPensionScheme({...newPensionScheme, currency: v})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Country *</Label>
                          <Input
                            placeholder="Country where you'll contribute"
                            value={newPensionScheme.country}
                            onChange={(e) => setNewPensionScheme({...newPensionScheme, country: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          disabled={!canAddPensionScheme}
                          onClick={() => {
                            const updated = [...pensionSchemes, newPensionScheme]
                            updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updated)
                            setNewPensionScheme({
                              pensionType: "Employer-sponsored plan",
                              otherPensionType: "",
                              contributionAmount: 0,
                              currency: "USD",
                              country: ""
                            })
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Pension Contribution
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="shadow-md">
            <CardFooter className="pt-6">
              <div className="w-full space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  This section is optional. You can continue even if you don't have social security or pension information to provide.
                </div>

                <Button
                  onClick={handleComplete}
                  className="w-full"
                  size="lg"
                >
                  Continue to Tax Deductions & Credits
                </Button>
              </div>
            </CardFooter>
          </Card>
        </>
      )}

      {/* Action button for skip mode */}
      {skipFinanceDetails && (
        <Card className="shadow-md">
          <CardFooter className="pt-6">
            <div className="w-full space-y-4">
              <Button
                onClick={handleComplete}
                className="w-full"
                size="lg"
              >
                Continue to Tax Deductions & Credits
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 