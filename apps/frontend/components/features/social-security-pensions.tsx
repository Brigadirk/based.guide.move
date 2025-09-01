"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Plus, Trash2, Info, AlertTriangle, Shield, PiggyBank, Building, Globe, Users, CreditCard } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"

import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { getCountries } from "@/lib/utils/country-utils"

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
  const countries = getCountries()

  // Check if finance details are being skipped
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false
  
  // Check if partner is selected
  const hasPartnerSelected = getFormData("personalInformation.partner.hasPartner") ?? false

  // 1. Current Social Security Contributions (Multiple countries support)
  const isContributing = getFormData("socialSecurityAndPensions.currentCountryContributions.isContributing") ?? false
  const contributions = getFormData("socialSecurityAndPensions.currentCountryContributions.details") ?? []
  const partnerIsContributing = getFormData("socialSecurityAndPensions.partner.currentCountryContributions.isContributing") ?? false
  const partnerContributions = getFormData("socialSecurityAndPensions.partner.currentCountryContributions.details") ?? []
  const [newContribution, setNewContribution] = useState({
    country: "",
    yearsOfContribution: 0
  })
  const [newPartnerContribution, setNewPartnerContribution] = useState({
    country: "",
    yearsOfContribution: 0
  })

  // 2. Voluntary Pension Arrangements (Streamlit style)
  const isPlanning = getFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning") ?? false
  const pensionSchemes = getFormData("socialSecurityAndPensions.futurePensionContributions.details") ?? []
  const partnerIsPlanning = getFormData("socialSecurityAndPensions.partner.futurePensionContributions.isPlanning") ?? false
  const partnerPensionSchemes = getFormData("socialSecurityAndPensions.partner.futurePensionContributions.details") ?? []
  const [newPensionScheme, setNewPensionScheme] = useState({
    pensionType: "Employer-sponsored plan",
    otherPensionType: "",
    contributionAmount: 0,
    currency: "USD",
    country: ""
  })
  const [newPartnerPensionScheme, setNewPartnerPensionScheme] = useState({
    pensionType: "Employer-sponsored plan",
    otherPensionType: "",
    contributionAmount: 0,
    currency: "USD",
    country: ""
  })

  // 3. Existing Retirement Assets (Streamlit style)
  const hasPlans = getFormData("socialSecurityAndPensions.existingPlans.hasPlans") ?? false
  const existingPlans = getFormData("socialSecurityAndPensions.existingPlans.details") ?? []
  const partnerHasPlans = getFormData("socialSecurityAndPensions.partner.existingPlans.hasPlans") ?? false
  const partnerExistingPlans = getFormData("socialSecurityAndPensions.partner.existingPlans.details") ?? []
  const [newExistingPlan, setNewExistingPlan] = useState({
    planType: "Defined benefit plan",
    currency: "USD", 
    currentValue: 0,
    country: ""
  })
  const [newPartnerExistingPlan, setNewPartnerExistingPlan] = useState({
    planType: "Defined benefit plan",
    currency: "USD", 
    currentValue: 0,
    country: ""
  })

  // Tab states
  const [contributionsTab, setContributionsTab] = useState("you")
  const [pensionsTab, setPensionsTab] = useState("you")
  const [assetsTab, setAssetsTab] = useState("you")

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
      <div className="text-left pb-4 border-b">
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
                {/* Display saved contributions for both You and Partner */}
                <div className="space-y-4">
                  {/* Your Contributions */}
                  {contributions.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Your Social Security Contributions</p>
                      {contributions.map((contribution, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-blue-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{contribution.country}</strong> - {contribution.yearsOfContribution} years
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = contributions.filter((_, i) => i !== index)
                                updateFormData("socialSecurityAndPensions.currentCountryContributions.details", updated)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partner's Contributions */}
                  {hasPartnerSelected && partnerContributions.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Partner's Social Security Contributions</p>
                      {partnerContributions.map((contribution, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{contribution.country}</strong> - {contribution.yearsOfContribution} years
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = partnerContributions.filter((_, i) => i !== index)
                                updateFormData("socialSecurityAndPensions.partner.currentCountryContributions.details", updated)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tab-based form inputs */}
                {hasPartnerSelected ? (
                  <Tabs value={contributionsTab} onValueChange={setContributionsTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                      <TabsTrigger 
                        value="you" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        You
                      </TabsTrigger>
                      <TabsTrigger 
                        value="partner" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        Partner
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="you" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="contributing"
                            checked={isContributing}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.currentCountryContributions.isContributing", !!checked)}
                          />
                          <Label htmlFor="contributing" className="text-base font-medium cursor-pointer">
                            You are currently making mandatory social security contributions
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes national insurance, superannuation, provident funds, or any state pension system
                        </p>
                      </div>
                      {isContributing && (
                        <SocialSecurityForm 
                          newContribution={newContribution}
                          setNewContribution={setNewContribution}
                          contributions={contributions}
                          updateFormData={updateFormData}
                          countries={countries}
                          currentResidence={currentResidence}
                          isPartner={false}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="partner" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="partnerContributing"
                            checked={partnerIsContributing}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.partner.currentCountryContributions.isContributing", !!checked)}
                          />
                          <Label htmlFor="partnerContributing" className="text-base font-medium cursor-pointer">
                            Partner is currently making mandatory social security contributions
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes national insurance, superannuation, provident funds, or any state pension system
                        </p>
                      </div>
                      {partnerIsContributing && (
                        <SocialSecurityForm 
                          newContribution={newPartnerContribution}
                          setNewContribution={setNewPartnerContribution}
                          contributions={partnerContributions}
                          updateFormData={updateFormData}
                          countries={countries}
                          currentResidence={currentResidence}
                          isPartner={true}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  /* Single user mode */
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
                )}

                {!hasPartnerSelected && isContributing && (
                  <SocialSecurityForm 
                    newContribution={newContribution}
                    setNewContribution={setNewContribution}
                    contributions={contributions}
                    updateFormData={updateFormData}
                    countries={countries}
                    currentResidence={currentResidence}
                    isPartner={false}
                  />
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
                {/* Display saved pension schemes for both You and Partner */}
                <div className="space-y-4">
                  {/* Your Pension Schemes */}
                  {pensionSchemes.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Your Pension Schemes</p>
                      {pensionSchemes.map((scheme: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-purple-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{scheme.pensionType}</strong> in {scheme.country}
                              <div className="text-muted-foreground">
                                {scheme.currency} {scheme.contributionAmount?.toLocaleString()} annually
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedSchemes = pensionSchemes.filter((_: any, i: number) => i !== idx)
                                updateFormData("socialSecurityAndPensions.futurePensionContributions.details", updatedSchemes)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partner's Pension Schemes */}
                  {hasPartnerSelected && partnerPensionSchemes.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Partner's Pension Schemes</p>
                      {partnerPensionSchemes.map((scheme: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{scheme.pensionType}</strong> in {scheme.country}
                              <div className="text-muted-foreground">
                                {scheme.currency} {scheme.contributionAmount?.toLocaleString()} annually
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedSchemes = partnerPensionSchemes.filter((_: any, i: number) => i !== idx)
                                updateFormData("socialSecurityAndPensions.partner.futurePensionContributions.details", updatedSchemes)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tab-based form inputs */}
                {hasPartnerSelected ? (
                  <Tabs value={pensionsTab} onValueChange={setPensionsTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                      <TabsTrigger 
                        value="you" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        You
                      </TabsTrigger>
                      <TabsTrigger 
                        value="partner" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        Partner
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="you" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="planning"
                            checked={isPlanning}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.futurePensionContributions.isPlanning", !!checked)}
                          />
                          <Label htmlFor="planning" className="text-base font-medium cursor-pointer">
                            You are making voluntary retirement contributions
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes private pensions, occupational schemes, or personal retirement accounts
                        </p>
                      </div>
                      {isPlanning && (
                        <PensionSchemeForm 
                          newPensionScheme={newPensionScheme}
                          setNewPensionScheme={setNewPensionScheme}
                          pensionSchemes={pensionSchemes}
                          updateFormData={updateFormData}
                          currencies={currencies}
                          countries={countries}
                          isPartner={false}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="partner" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="partnerPlanning"
                            checked={partnerIsPlanning}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.partner.futurePensionContributions.isPlanning", !!checked)}
                          />
                          <Label htmlFor="partnerPlanning" className="text-base font-medium cursor-pointer">
                            Partner is making voluntary retirement contributions
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes private pensions, occupational schemes, or personal retirement accounts
                        </p>
                      </div>
                      {partnerIsPlanning && (
                        <PensionSchemeForm 
                          newPensionScheme={newPartnerPensionScheme}
                          setNewPensionScheme={setNewPartnerPensionScheme}
                          pensionSchemes={partnerPensionSchemes}
                          updateFormData={updateFormData}
                          currencies={currencies}
                          countries={countries}
                          isPartner={true}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  /* Single user mode */
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
                )}

                {!hasPartnerSelected && isPlanning && (
                  <PensionSchemeForm 
                    newPensionScheme={newPensionScheme}
                    setNewPensionScheme={setNewPensionScheme}
                    pensionSchemes={pensionSchemes}
                    updateFormData={updateFormData}
                    currencies={currencies}
                    countries={countries}
                    isPartner={false}
                  />
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
                {/* Display saved retirement assets for both You and Partner */}
                <div className="space-y-4">
                  {/* Your Retirement Assets */}
                  {existingPlans.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Your Retirement Assets</p>
                      {existingPlans.map((plan: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-orange-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{plan.planType}</strong> in {plan.country}
                              <div className="text-muted-foreground">
                                {plan.currency} {plan.currentValue?.toLocaleString()} current value
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedPlans = existingPlans.filter((_: any, i: number) => i !== idx)
                                updateFormData("socialSecurityAndPensions.existingPlans.details", updatedPlans)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Partner's Retirement Assets */}
                  {hasPartnerSelected && partnerExistingPlans.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Partner's Retirement Assets</p>
                      {partnerExistingPlans.map((plan: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <strong>{plan.planType}</strong> in {plan.country}
                              <div className="text-muted-foreground">
                                {plan.currency} {plan.currentValue?.toLocaleString()} current value
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedPlans = partnerExistingPlans.filter((_: any, i: number) => i !== idx)
                                updateFormData("socialSecurityAndPensions.partner.existingPlans.details", updatedPlans)
                              }}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tab-based form inputs */}
                {hasPartnerSelected ? (
                  <Tabs value={assetsTab} onValueChange={setAssetsTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-12 transition-all duration-300">
                      <TabsTrigger 
                        value="you" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        You
                      </TabsTrigger>
                      <TabsTrigger 
                        value="partner" 
                        className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold transition-all duration-300 rounded-md h-10 text-sm"
                      >
                        Partner
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="you" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="hasPlans"
                            checked={hasPlans}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.existingPlans.hasPlans", !!checked)}
                          />
                          <Label htmlFor="hasPlans" className="text-base font-medium cursor-pointer">
                            You hold existing retirement/pension assets
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes any vested pension rights, frozen plans, or portable retirement accounts
                        </p>
                      </div>
                      {hasPlans && (
                        <RetirementAssetForm 
                          newExistingPlan={newExistingPlan}
                          setNewExistingPlan={setNewExistingPlan}
                          existingPlans={existingPlans}
                          updateFormData={updateFormData}
                          currencies={currencies}
                          countries={countries}
                          isPartner={false}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="partner" className="mt-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="partnerHasPlans"
                            checked={partnerHasPlans}
                            onCheckedChange={(checked) => updateFormData("socialSecurityAndPensions.partner.existingPlans.hasPlans", !!checked)}
                          />
                          <Label htmlFor="partnerHasPlans" className="text-base font-medium cursor-pointer">
                            Partner holds existing retirement/pension assets
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          Includes any vested pension rights, frozen plans, or portable retirement accounts
                        </p>
                      </div>
                      {partnerHasPlans && (
                        <RetirementAssetForm 
                          newExistingPlan={newPartnerExistingPlan}
                          setNewExistingPlan={setNewPartnerExistingPlan}
                          existingPlans={partnerExistingPlans}
                          updateFormData={updateFormData}
                          currencies={currencies}
                          countries={countries}
                          isPartner={true}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  /* Single user mode */
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
                )}

                {!hasPartnerSelected && hasPlans && (
                  <RetirementAssetForm 
                    newExistingPlan={newExistingPlan}
                    setNewExistingPlan={setNewExistingPlan}
                    existingPlans={existingPlans}
                    updateFormData={updateFormData}
                    currencies={currencies}
                    countries={countries}
                    isPartner={false}
                  />
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

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("social-security")}
              isCheckingInfo={isCheckingInfo}
              sectionId="social-security"
              onContinue={handleComplete}
              canContinue={true}
              nextSectionName="Tax Deductions & Credits"
            />


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

// Reusable form component for social security contributions
function SocialSecurityForm({ newContribution, setNewContribution, contributions, updateFormData, countries, currentResidence, isPartner }: any) {
  const dataPath = isPartner 
    ? "socialSecurityAndPensions.partner.currentCountryContributions.details"
    : "socialSecurityAndPensions.currentCountryContributions.details"

  return (
    <>
      {/* Add new contribution form */}
      <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2">
          <Label>Country of contribution</Label>
          <Select
            value={newContribution.country}
            onValueChange={(value) => setNewContribution({...newContribution, country: value})}
          >
            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {/* Use current residence as default if available */}
              {currentResidence && (
                <SelectItem value={currentResidence}>{currentResidence} (Current)</SelectItem>
              )}
              {countries.map((country: string) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select country where {isPartner ? "partner is" : "you're"} contributing</p>
        </div>
        <div className="space-y-2">
          <Label>Total contribution years (including partial years)</Label>
          <Input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={newContribution.yearsOfContribution}
            onChange={(e) => setNewContribution({...newContribution, yearsOfContribution: parseFloat(e.target.value) || 0})}
            onFocus={(e) => e.target.select()}
            placeholder="0.0"
            className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
          />
          <p className="text-xs text-muted-foreground">Counts contributions to any national system, even if not continuous</p>
        </div>
      </div>

      <Button
        onClick={() => {
          if (newContribution.country && newContribution.yearsOfContribution > 0) {
            const contribution = {
              country: newContribution.country,
              yearsOfContribution: newContribution.yearsOfContribution
            }
            updateFormData(dataPath, [...contributions, contribution])
            setNewContribution({ country: "", yearsOfContribution: 0 })
          }
        }}
        disabled={!newContribution.country || newContribution.yearsOfContribution <= 0}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {isPartner ? "Partner's" : "Your"} Social Security Contribution
      </Button>
    </>
  )
}

// Reusable form component for pension schemes
function PensionSchemeForm({ newPensionScheme, setNewPensionScheme, pensionSchemes, updateFormData, currencies, countries, isPartner }: any) {
  const dataPath = isPartner 
    ? "socialSecurityAndPensions.partner.futurePensionContributions.details"
    : "socialSecurityAndPensions.futurePensionContributions.details"

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h4 className="font-medium mb-4">Add {isPartner ? "Partner's" : "Your"} Pension Scheme</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Pension scheme type</Label>
          <Select
            value={newPensionScheme.pensionType}
            onValueChange={(value) => setNewPensionScheme({...newPensionScheme, pensionType: value})}
          >
            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
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
          <p className="text-xs text-muted-foreground">Select closest match to {isPartner ? "partner's" : "your"} retirement vehicle</p>
        </div>

        {newPensionScheme.pensionType === "Other" && (
          <div className="space-y-2">
            <Label>Specify scheme name</Label>
            <Input
              value={newPensionScheme.otherPensionType}
              onChange={(e) => setNewPensionScheme({...newPensionScheme, otherPensionType: e.target.value})}
              placeholder="Enter scheme name"
              className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
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
              <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency: string) => (
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
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
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
            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country: string) => (
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
              updateFormData(dataPath, updatedSchemes)
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
          💾 Add {isPartner ? "Partner's" : "Your"} Scheme
        </Button>
      </div>
    </div>
  )
}

// Reusable form component for retirement assets
function RetirementAssetForm({ newExistingPlan, setNewExistingPlan, existingPlans, updateFormData, currencies, countries, isPartner }: any) {
  const dataPath = isPartner 
    ? "socialSecurityAndPensions.partner.existingPlans.details"
    : "socialSecurityAndPensions.existingPlans.details"

  const PLAN_TYPES = [
    "Defined benefit plan",
    "Defined contribution plan", 
    "National social security entitlement",
    "Portable retirement account",
    "Annuity contract",
    "Other"
  ]

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h4 className="font-medium mb-4">Add {isPartner ? "Partner's" : "Your"} Pension Asset</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Plan category</Label>
          <Select
            value={newExistingPlan.planType}
            onValueChange={(value) => setNewExistingPlan({...newExistingPlan, planType: value})}
          >
            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
              <SelectValue placeholder="Select plan type" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_TYPES.map((type) => (
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
              <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency: string) => (
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
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
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
            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country: string) => (
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
              updateFormData(dataPath, updatedPlans)
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
          💾 Add {isPartner ? "Partner's" : "Your"} Pension Asset
        </Button>
      </div>
    </div>
  )
}
