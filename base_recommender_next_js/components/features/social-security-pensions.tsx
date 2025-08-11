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
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"

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
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Check if finance details are being skipped
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false

  // 1. Current Social Security Contributions (Streamlit style)
  const isContributing = getFormData("socialSecurityAndPensions.currentCountryContributions.isContributing") ?? false
  const contributionCountry = getFormData("socialSecurityAndPensions.currentCountryContributions.country") ?? ""
  const yearsOfContribution = getFormData("socialSecurityAndPensions.currentCountryContributions.yearsOfContribution") ?? 0

  // 2. Voluntary Pension Arrangements (Streamlit style)
  const isPlanning = getFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning") ?? false
  const pensionSchemes = getFormData("socialSecurityAndPensions.futurePensionContributions.details") ?? []
  const [newPensionScheme, setNewPensionScheme] = useState({
    pensionType: "Employer-sponsored plan",
    otherPensionType: "",
    contributionAmount: 0,
    currency: "USD",
    country: ""
  })

  // 3. Existing Retirement Assets (Streamlit style)
  const hasPlans = getFormData("socialSecurityAndPensions.existingPlans.hasPlans") ?? false
  const existingPlans = getFormData("socialSecurityAndPensions.existingPlans.details") ?? []
  const [newExistingPlan, setNewExistingPlan] = useState({
    planType: "Defined benefit plan",
    currency: "USD", 
    currentValue: 0,
    country: ""
  })

  const handleComplete = () => {
    markSectionComplete("socialSecurityAndPensions")
    onComplete()
  }

  // Get current residence country as default for contribution country
  const currentResidence = getFormData("personalInformation.currentResidency.country") ?? ""

  const canContinue = true // This section is optional

  const canAddPensionScheme = newPensionScheme.contributionAmount > 0 && newPensionScheme.country && 
    (newPensionScheme.pensionType !== "Other" || newPensionScheme.otherPensionType)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          ⚖️ Social Security & Pensions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your pension and social security profile for international tax compliance and retirement planning
        </p>
      </div>

      <SectionHint title="Why is this section important?">
        <div className="space-y-2 text-sm">
          <p><strong>Understanding your pension and social security situation helps:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Determine tax obligations in multiple jurisdictions</li>
            <li>Qualify for retirement benefits in your destination country</li>
            <li>Ensure compliance with international social security agreements</li>
            <li>Plan for retirement tax efficiency</li>
            <li>Avoid double taxation on pension income</li>
            <li>Meet residency requirements that often consider social security integration</li>
          </ul>
        </div>
      </SectionHint>

      {/* Skip Mode Indicator */}
      {skipFinanceDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Social Security / Pension Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Per your earlier choice in finance section</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                🚀 Detailed Social-Security / Pension inputs skipped per your earlier choice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show detailed sections if not skipped */}
      {!skipFinanceDetails && (
        <>
          {/* 1. Social Security/National Insurance Contributions */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Social Security/National Insurance Contributions
              </CardTitle>
              <p className="text-sm text-muted-foreground">Applies to any government-mandated retirement/social insurance system</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="contributing"
                      checked={isContributing}
                      onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.currentCountryContributions.isContributing", !!checked)}
                    />
                    <Label htmlFor="contributing" className="text-base font-medium cursor-pointer">
                      Currently making mandatory social security contributions
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Includes national insurance, superannuation, provident funds, or any state pension system
                  </p>
                </div>

                {isContributing && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
                    <div className="space-y-2">
                      <Label>Country of contribution</Label>
                      <Select
                        value={contributionCountry}
                        onValueChange={(value) => updateFormData("socialSecurityAndPensions.currentCountryContributions.country", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Use current residence as default if available */}
                          {currentResidence && (
                            <SelectItem value={currentResidence}>{currentResidence} (Current)</SelectItem>
                          )}
                          {["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Netherlands", "Sweden", "Other"].map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Select country where you're currently contributing</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Total contribution years (including partial years)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={yearsOfContribution}
                        onChange={(e) => updateFormData("socialSecurityAndPensions.currentCountryContributions.yearsOfContribution", parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                      />
                      <p className="text-xs text-muted-foreground">Counts contributions to any national system, even if not continuous</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Voluntary Pension Arrangements */}
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <PiggyBank className="w-6 h-6 text-purple-600" />
                Voluntary Pension Arrangements
              </CardTitle>
              <p className="text-sm text-muted-foreground">Private pensions, occupational schemes, or personal retirement accounts</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="planning"
                      checked={isPlanning}
                      onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning", !!checked)}
                    />
                    <Label htmlFor="planning" className="text-base font-medium cursor-pointer">
                      Making voluntary retirement contributions
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Includes private pensions, occupational schemes, or personal retirement accounts
                  </p>
                </div>

                {isPlanning && (
                  <>
                    {/* Add new pension scheme form */}
                    <div className="p-4 border rounded-lg bg-card">
                      <h4 className="font-medium mb-4">Add New Pension Scheme</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Pension scheme type</Label>
                          <Select
                            value={newPensionScheme.pensionType}
                            onValueChange={(value) => setNewPensionScheme({...newPensionScheme, pensionType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select scheme type" />
                            </SelectTrigger>
                            <SelectContent>
                              {PENSION_SCHEME_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Select closest match to your retirement vehicle</p>
                        </div>

                        {newPensionScheme.pensionType === "Other" && (
                          <div className="space-y-2">
                            <Label>Specify scheme name</Label>
                            <Input
                              value={newPensionScheme.otherPensionType}
                              onChange={(e) => setNewPensionScheme({...newPensionScheme, otherPensionType: e.target.value})}
                              placeholder="Enter scheme name"
                            />
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Contribution currency</Label>
                            <Select
                              value={newPensionScheme.currency}
                              onValueChange={(value) => setNewPensionScheme({...newPensionScheme, currency: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
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
                            <Label>Annual contribution amount</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={newPensionScheme.contributionAmount}
                              onChange={(e) => setNewPensionScheme({...newPensionScheme, contributionAmount: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground">In local currency - include employer matches if applicable</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Governing jurisdiction</Label>
                          <Select
                            value={newPensionScheme.country}
                            onValueChange={(value) => setNewPensionScheme({...newPensionScheme, country: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>

                              {["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Netherlands", "Sweden", "Other"].map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Country where the pension scheme is regulated</p>
                        </div>

                        <Button
                          onClick={() => {
                            if (newPensionScheme.contributionAmount > 0 && newPensionScheme.country && 
                                (newPensionScheme.pensionType !== "Other" || newPensionScheme.otherPensionType)) {
                              const scheme = {
                                pensionType: newPensionScheme.pensionType !== "Other" ? newPensionScheme.pensionType : newPensionScheme.otherPensionType,
                                contributionAmount: newPensionScheme.contributionAmount,
                                currency: newPensionScheme.currency,
                                country: newPensionScheme.country
                              }
                              const updatedSchemes = [...pensionSchemes, scheme]
                              updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updatedSchemes)
                              setNewPensionScheme({
                                pensionType: "Employer-sponsored plan",
                                otherPensionType: "",
                                contributionAmount: 0,
                                currency: "USD",
                                country: ""
                              })
                            }
                          }}
                          disabled={!newPensionScheme.contributionAmount || !newPensionScheme.country || 
                                   (newPensionScheme.pensionType === "Other" && !newPensionScheme.otherPensionType)}
                          className="w-full"
                        >
                          💾 Add Scheme
                        </Button>
                      </div>
                    </div>

                    {/* Display existing pension schemes */}
                    {pensionSchemes.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">📊 Registered Pension Schemes</h4>
                        <div className="space-y-3">
                          {pensionSchemes.map((scheme: any, idx: number) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">Scheme {idx + 1}: {scheme.pensionType}</h5>
                                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                    <div>
                                      <p><strong>Country:</strong> {scheme.country}</p>
                                    </div>
                                    <div>
                                      <p><strong>Annual Contribution:</strong> {scheme.currency} {scheme.contributionAmount?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const updatedSchemes = pensionSchemes.filter((_: any, i: number) => i !== idx)
                                    updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updatedSchemes)
                                  }}
                                >
                                  ❌
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Existing Retirement Assets */}
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Building className="w-6 h-6 text-orange-600" />
                Existing Retirement Assets
              </CardTitle>
              <p className="text-sm text-muted-foreground">Vested pension rights, frozen plans, or portable retirement accounts</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="hasPlans"
                      checked={hasPlans}
                      onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.existingPlans.hasPlans", !!checked)}
                    />
                    <Label htmlFor="hasPlans" className="text-base font-medium cursor-pointer">
                      Hold existing retirement/pension assets
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Includes any vested pension rights, frozen plans, or portable retirement accounts
                  </p>
                </div>

                {hasPlans && (
                  <>
                    {/* Add new existing plan form */}
                    <div className="p-4 border rounded-lg bg-card">
                      <h4 className="font-medium mb-4">Add Pension Asset</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Plan category</Label>
                          <Select
                            value={newExistingPlan.planType}
                            onValueChange={(value) => setNewExistingPlan({...newExistingPlan, planType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan type" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Defined benefit plan",
                                "Defined contribution plan", 
                                "National social security entitlement",
                                "Portable retirement account",
                                "Annuity contract",
                                "Other"
                              ].map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Select closest regulatory classification</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Asset currency</Label>
                            <Select
                              value={newExistingPlan.currency}
                              onValueChange={(value) => setNewExistingPlan({...newExistingPlan, currency: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Select currency for asset valuation</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Current actuarial value</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={newExistingPlan.currentValue}
                              onChange={(e) => setNewExistingPlan({...newExistingPlan, currentValue: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                            />
                            <p className="text-xs text-muted-foreground">For DB plans, estimate transfer value</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Governing jurisdiction</Label>
                          <Select
                            value={newExistingPlan.country}
                            onValueChange={(value) => setNewExistingPlan({...newExistingPlan, country: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>

                              {["United States", "United Kingdom", "Canada", "Germany", "France", "Australia", "Netherlands", "Sweden", "Other"].map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Country where plan is regulated</p>
                        </div>

                        <Button
                          onClick={() => {
                            if (newExistingPlan.currentValue > 0 && newExistingPlan.country) {
                              const updatedPlans = [...existingPlans, newExistingPlan]
                              updateFormData("socialSecurityAndPensions.existingPlans.details", updatedPlans)
                              setNewExistingPlan({
                                planType: "Defined benefit plan",
                                currency: "USD",
                                currentValue: 0,
                                country: ""
                              })
                            }
                          }}
                          disabled={!newExistingPlan.currentValue || !newExistingPlan.country}
                          className="w-full"
                        >
                          💾 Add Pension Asset
                        </Button>
                      </div>
                    </div>

                    {/* Display existing retirement assets */}
                    {existingPlans.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">📊 Registered Retirement Assets</h4>
                        <div className="space-y-3">
                          {existingPlans.map((plan: any, idx: number) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">Asset {idx + 1}: {plan.planType}</h5>
                                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                    <div>
                                      <p><strong>Country:</strong> {plan.country}</p>
                                    </div>
                                    <div>
                                      <p><strong>Current Value:</strong> {plan.currency} {plan.currentValue?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const updatedPlans = existingPlans.filter((_: any, i: number) => i !== idx)
                                    updateFormData("socialSecurityAndPensions.existingPlans.details", updatedPlans)
                                  }}
                                >
                                  ❌
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              This section is optional. You can continue even if you don't have social security or pension information to provide.
            </div>

            {/* Check My Information Button */}
            <div className="flex justify-center">
              <CheckInfoButton
                onClick={() => showSectionInfo("social-security")}
                isLoading={isCheckingInfo}
              />
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

      {/* Section Info Modal */}
      <SectionInfoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        story={currentStory}
        isLoading={isCheckingInfo}
        onExpandFullInfo={expandFullInformation}
        onBackToSection={backToSection}
        currentSection={currentSection}
        isFullView={isFullView}
        onGoToSection={goToSection}
        onNavigateToSection={navigateToSection}
      />
    </div>
  )
}
