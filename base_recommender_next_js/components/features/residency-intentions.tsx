"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { useState, useEffect, useMemo } from "react"
import { SectionHint } from "@/components/ui/section-hint"
import { getLanguages } from "@/lib/utils/country-utils"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Plane, MapPin, Languages, Heart, DollarSign, FileText, Clock, Globe, Target, Users, Shield, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { canMoveWithinEU, isEUCountry, hasEUCitizenship } from "@/lib/utils/eu-utils"
import { analyzeFamilyVisaRequirements, getFamilyVisaComplexity, getFamilyVisaPlanningSteps } from "@/lib/utils/family-visa-utils"

// Simple currencies hook - replace with actual implementation
const useCurrencies = () => ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "CNY"]

export function ResidencyIntentions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const currencies = useCurrencies()

  // Get destination country and user's nationalities
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const destRegion = getFormData("residencyIntentions.destinationCountry.region") ?? ""
  const userNationalities = getFormData("personalInformation.nationalities") ?? []
  
  // Check if user is already a citizen of destination country
  // userNationalities is an array of objects with { country: string } structure
  const isAlreadyCitizen = userNationalities.some((nat: any) => nat.country === destCountry)
  
  // Check EU movement rights
  const canMoveWithinEUFreedom = destCountry && canMoveWithinEU(userNationalities, destCountry)
  const isDestinationEU = destCountry && isEUCountry(destCountry)
  const userHasEUCitizenship = hasEUCitizenship(userNationalities)
  
  // Treat EU movement the same as direct citizenship for most purposes
  const hasNoVisaRequirement = isAlreadyCitizen || canMoveWithinEUFreedom
  
  // Family visa analysis
  const partnerInfo = getFormData("personalInformation.relocationPartnerInfo") 
  const dependentsInfo = getFormData("personalInformation.relocationDependents") || []
  
  const familyVisaAnalysis = useMemo(() => {
    if (!destCountry) return null
    
    // Convert partner info to our format
    const partner = partnerInfo ? {
      nationalities: partnerInfo.partnerNationalities || [],
      relationship: 'spouse'
    } : undefined
    
    // Convert dependents info to our format  
    const dependents = dependentsInfo.map((dep: any) => ({
      nationalities: dep.nationalities || [],
      relationship: dep.relationship || 'child',
      age: dep.age || 0,
      dateOfBirth: dep.dateOfBirth
    }))
    
    return analyzeFamilyVisaRequirements(userNationalities, destCountry, partner, dependents)
  }, [destCountry, userNationalities, partnerInfo, dependentsInfo])
  
  const familyVisaComplexity = familyVisaAnalysis ? getFamilyVisaComplexity(familyVisaAnalysis) : 'simple'
  const familyVisaPlanningSteps = familyVisaAnalysis ? getFamilyVisaPlanningSteps(familyVisaAnalysis) : []
  
  // Check if user has skipped finance and has no visa requirements
  const hasSkippedFinance = getFormData("finance.skipDetails") ?? false
  const hasNoVisaIssues = hasNoVisaRequirement && (!familyVisaAnalysis || !familyVisaAnalysis.familyRequiresVisas)
  const showAlternativeOptions = hasSkippedFinance && hasNoVisaIssues && destCountry

  // Move type and duration
  const moveType = getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const tempDuration = getFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") ?? 0

  // Citizenship status (derived or selected)
  const citizenshipStatus = getFormData("residencyIntentions.destinationCountry.citizenshipStatus") ?? isAlreadyCitizen

  // Residency plans
  const applyForResidency = getFormData("residencyIntentions.residencyPlans.applyForResidency") ?? false
  const maxMonths = getFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside") ?? 6
  const openToVisiting = getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false

  // Citizenship plans
  const interestedInCitizenship = getFormData("residencyIntentions.citizenshipPlans.interestedInCitizenship") ?? false
  
  // Citizenship pathways
  const familyTies = getFormData("residencyIntentions.citizenshipPlans.familyTies.hasConnections") ?? false
  const familyRelation = getFormData("residencyIntentions.citizenshipPlans.familyTies.closestRelation") ?? ""
  
  const militaryService = getFormData("residencyIntentions.citizenshipPlans.militaryService.willing") ?? false
  const maxServiceYears = getFormData("residencyIntentions.citizenshipPlans.militaryService.maxServiceYears") ?? 2
  
  const investmentWilling = getFormData("residencyIntentions.citizenshipPlans.investment.willing") ?? false
  const investmentAmount = getFormData("residencyIntentions.citizenshipPlans.investment.amount") ?? 0
  const investmentCurrency = getFormData("residencyIntentions.citizenshipPlans.investment.currency") ?? "USD"
  
  const donationWilling = getFormData("residencyIntentions.citizenshipPlans.donation.willing") ?? false
  const donationAmount = getFormData("residencyIntentions.citizenshipPlans.donation.amount") ?? 0
  const donationCurrency = getFormData("residencyIntentions.citizenshipPlans.donation.currency") ?? "USD"

  // Center of life
  const maintainsSignificantTies = getFormData("residencyIntentions.centerOfLife.maintainsSignificantTies") ?? false
  const tiesDescription = getFormData("residencyIntentions.centerOfLife.tiesDescription") ?? ""

  // Language proficiency
  const languages = useMemo(() => {
    try {
      const result = getLanguages(destCountry, destRegion)
      return Array.isArray(result) ? result : (result as any)?.country_languages || []
    } catch {
      return []
    }
  }, [destCountry, destRegion])

  // Family member data
  const hasPartner = getFormData("personalInformation.relocationPartner") ?? false
  const numDependents = getFormData("personalInformation.numRelocationDependents") ?? 0

  // Language teaching capabilities
  const [newTeachingLang, setNewTeachingLang] = useState({
    language: '', 
    capability: 'Informally'
  })
  const otherLanguages = getFormData("residencyIntentions.languageProficiency.other_languages") ?? {}

  // Motivation and compliance
  const motivation = getFormData("residencyIntentions.moveMotivation") ?? ""
  const taxCompliant = getFormData("residencyIntentions.taxCompliantEverywhere") ?? true

  const handleComplete = () => {
    markSectionComplete("residency")
    onComplete()
  }

  // Validation
  const errors = []
  if (!destCountry) errors.push("Destination country is required")
  if (!moveType) errors.push("Type of move is required")
  if (moveType === "Temporary" && !tempDuration) errors.push("Duration of temporary stay is required")
  if (applyForResidency && maxMonths === null) errors.push("Maximum months willing to reside is required")
  if (interestedInCitizenship && investmentWilling && !investmentAmount) errors.push("Investment amount is required")
  if (interestedInCitizenship && donationWilling && !donationAmount) errors.push("Donation amount is required")

  const canContinue = errors.length === 0

  const proficiencyLabels = ['None', 'A1 (Beginner)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper-Intermediate)', 'C1 (Advanced)', 'C2 (Native-like)']

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          🌐 Residency Intentions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understanding your residency intentions helps determine appropriate visa pathways and tax implications
        </p>
      </div>

      <SectionHint title="Why is this section important?">
        <div className="space-y-2 text-sm">
          <p><strong>Understanding your residency intentions helps:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Determine appropriate visa and immigration pathways</li>
            <li>Identify tax residency implications in multiple jurisdictions</li>
            <li>Assess citizenship eligibility and timeline</li>
            <li>Plan for language requirements and integration</li>
            <li>Evaluate investment or donation options if applicable</li>
            <li>Prepare for minimum stay requirements and travel restrictions</li>
          </ul>
        </div>
      </SectionHint>

      {destCountry && (
        <>
          {/* Move Type & Duration */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
                Relocation Details
          </CardTitle>
              <p className="text-sm text-muted-foreground">Provide details about your intended relocation</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Type of move *</Label>
                  <Select 
                    value={moveType} 
                    onValueChange={(value) => updateFormData("residencyIntentions.destinationCountry.moveType", value)}
                  >
                <SelectTrigger>
                      <SelectValue placeholder="Select the type of move you are planning" />
                </SelectTrigger>
                <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Digital Nomad">Digital Nomad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {moveType === "Temporary" && (
              <div className="space-y-2">
                    <Label className="text-base font-medium">Intended duration (months) *</Label>
                <Input
                      type="number"
                      min="0"
                      max="120"
                      step="1"
                  value={tempDuration}
                      onChange={(e) => updateFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay", parseInt(e.target.value) || 0)}
                      placeholder="12"
                />
                <p className="text-sm text-muted-foreground">
                      Enter how many months you plan to stay in {destCountry}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

          {/* Citizenship Status */}
          {!isAlreadyCitizen && (
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  Citizenship Status
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your current or potential citizenship status in {destCountry}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Are you already a citizen of {destCountry}, OR on track for citizenship?
                    </Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="citizen-yes"
                          name="citizenStatus"
                          value="true"
                          checked={citizenshipStatus === true}
                          onChange={() => updateFormData("residencyIntentions.destinationCountry.citizenshipStatus", true)}
                        />
                        <label htmlFor="citizen-yes" className="text-sm font-medium cursor-pointer">Yes</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="citizen-no"
                          name="citizenStatus"
                          value="false"
                          checked={citizenshipStatus === false}
                          onChange={() => updateFormData("residencyIntentions.destinationCountry.citizenshipStatus", false)}
                        />
                        <label htmlFor="citizen-no" className="text-sm font-medium cursor-pointer">No</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display citizenship confirmation and tax focus if already citizen OR EU movement */}
          {(isAlreadyCitizen || canMoveWithinEUFreedom) && (
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  {isAlreadyCitizen ? "You Are Already a Citizen" : "EU Freedom of Movement"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800">
                    {isAlreadyCitizen ? (
                      <div className="space-y-2">
                        <p>✅ <strong>You are a citizen of {destCountry}.</strong></p>
                        <p>🛂 <strong>You do not need a visa.</strong></p>
                        <p>💰 <strong>You just need to avoid being considered liable for taxation in other locations.</strong></p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>🇪🇺 <strong>You are an EU citizen, and can therefore move to {destCountry} without a visa!</strong></p>
                        <p>✅ <strong>As an EU citizen, you have the right to live and work in {destCountry}.</strong></p>
                        <p>💰 <strong>You just need to avoid being considered liable for taxation in other locations.</strong></p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Family Visa Requirements Analysis */}
          {familyVisaAnalysis && (partnerInfo || dependentsInfo.length > 0) && (
            <Card className={`shadow-sm border-l-4 ${
              familyVisaComplexity === 'simple' ? 'border-l-green-500' :
              familyVisaComplexity === 'moderate' ? 'border-l-yellow-500' : 'border-l-red-500'
            }`}>
              <CardHeader className={`bg-gradient-to-r ${
                familyVisaComplexity === 'simple' ? 'from-green-50 to-transparent dark:from-green-950/20' :
                familyVisaComplexity === 'moderate' ? 'from-yellow-50 to-transparent dark:from-yellow-950/20' : 
                'from-red-50 to-transparent dark:from-red-950/20'
              }`}>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Users className={`w-6 h-6 ${
                    familyVisaComplexity === 'simple' ? 'text-green-600' :
                    familyVisaComplexity === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                  Family Visa Requirements
                  <Badge variant={familyVisaComplexity === 'simple' ? 'default' : 'secondary'} className="ml-2">
                    {familyVisaComplexity.charAt(0).toUpperCase() + familyVisaComplexity.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Alert className={
                  familyVisaComplexity === 'simple' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' :
                  familyVisaComplexity === 'moderate' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                  'border-red-200 bg-red-50 dark:bg-red-950/20'
                }>
                  {familyVisaComplexity === 'simple' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   familyVisaComplexity === 'moderate' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                   <AlertTriangle className="h-4 w-4 text-red-600" />}
                  <AlertDescription className={
                    familyVisaComplexity === 'simple' ? 'text-green-800 dark:text-green-200' :
                    familyVisaComplexity === 'moderate' ? 'text-yellow-800 dark:text-yellow-200' :
                    'text-red-800 dark:text-red-200'
                  }>
                    <div className="space-y-3">
                      <p><strong>Family Visa Status:</strong> {familyVisaAnalysis.summary}</p>
                      
                      {familyVisaAnalysis.visaRequirements.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Visa Requirements by Family Member:</p>
                          <div className="space-y-2">
                            {familyVisaAnalysis.visaRequirements.map((req, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-xs mt-1">
                                  {req.requiresVisa ? '🔴' : '🟢'}
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm">
                                    <strong>{req.memberType === 'partner' ? 'Partner' : `Dependent ${(req.memberIndex || 0) + 1}`}:</strong> 
                                    {req.requiresVisa ? ` Requires ${req.visaType}` : ' No visa required'}
                                  </p>
                                  {req.specialConsiderations.length > 0 && (
                                    <ul className="text-xs mt-1 ml-4 list-disc space-y-1">
                                      {req.specialConsiderations.map((consideration, cidx) => (
                                        <li key={cidx}>{consideration}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {familyVisaAnalysis.specialScenarios.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Special Considerations:</p>
                          <ul className="text-sm space-y-1">
                            {familyVisaAnalysis.specialScenarios.map((scenario, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600">ℹ️</span>
                                {scenario}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {familyVisaPlanningSteps.length > 0 && (
                        <div>
                          <p className="font-medium mb-2">Planning Steps:</p>
                          <ul className="text-sm space-y-1">
                            {familyVisaPlanningSteps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 text-xs mt-1">📋</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Alternative Options - Show when no visa issues and finance skipped */}
          {showAlternativeOptions && (
            <Card className="shadow-sm border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-600" />
                  What Are You Looking For?
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  You do not appear to be interested in taxation, nor do you or any of your family members need a visa to enter {destCountry}. What are you looking for?
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  
                  {/* Primary Interest Areas */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">What specific information interests you most?</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-cultural"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("culturalIntegration") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "culturalIntegration"]
                              : currentInterests.filter((i: string) => i !== "culturalIntegration")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-cultural" className="text-sm">
                          Cultural integration and lifestyle differences
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-healthcare"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("healthcareSystem") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "healthcareSystem"]
                              : currentInterests.filter((i: string) => i !== "healthcareSystem")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-healthcare" className="text-sm">
                          Healthcare system and medical services
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-education"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("educationSystem") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "educationSystem"]
                              : currentInterests.filter((i: string) => i !== "educationSystem")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-education" className="text-sm">
                          Education system and schooling options
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-employment"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("employmentMarket") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "employmentMarket"]
                              : currentInterests.filter((i: string) => i !== "employmentMarket")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-employment" className="text-sm">
                          Job market and employment opportunities
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-housing"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("housingMarket") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "housingMarket"]
                              : currentInterests.filter((i: string) => i !== "housingMarket")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-housing" className="text-sm">
                          Housing market and rental/purchase options
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-social"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("socialServices") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "socialServices"]
                              : currentInterests.filter((i: string) => i !== "socialServices")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-social" className="text-sm">
                          Social services and government benefits
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-legal"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("legalRequirements") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "legalRequirements"]
                              : currentInterests.filter((i: string) => i !== "legalRequirements")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-legal" className="text-sm">
                          Legal requirements and bureaucratic processes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="interest-cost"
                          checked={getFormData("residencyIntentions.alternativeInterests")?.includes("costOfLiving") ?? false}
                          onCheckedChange={(checked) => {
                            const currentInterests = getFormData("residencyIntentions.alternativeInterests") || []
                            const newInterests = checked 
                              ? [...currentInterests, "costOfLiving"]
                              : currentInterests.filter((i: string) => i !== "costOfLiving")
                            updateFormData("residencyIntentions.alternativeInterests", newInterests)
                          }}
                        />
                        <Label htmlFor="interest-cost" className="text-sm">
                          General cost of living and lifestyle expenses
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Specific Questions */}
                  <div className="space-y-4">
                    <Label htmlFor="specific-questions" className="text-base font-medium">
                      Specific Questions or Concerns
                    </Label>
                    <Textarea
                      id="specific-questions"
                      placeholder="What specific questions do you have about moving to and living in this country? (e.g., 'How do I register for healthcare?', 'What's the process for buying a house?', 'How do I enroll my children in school?')"
                      value={getFormData("residencyIntentions.specificQuestions") || ""}
                      onChange={(e) => updateFormData("residencyIntentions.specificQuestions", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Information Depth Preference */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Information Detail Level</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="depth-overview"
                          name="informationDepth"
                          value="overview"
                          checked={getFormData("residencyIntentions.informationDepth") === "overview"}
                          onChange={(e) => updateFormData("residencyIntentions.informationDepth", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="depth-overview" className="text-sm">
                          General overview and highlights
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="depth-practical"
                          name="informationDepth"
                          value="practical"
                          checked={getFormData("residencyIntentions.informationDepth") === "practical"}
                          onChange={(e) => updateFormData("residencyIntentions.informationDepth", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="depth-practical" className="text-sm">
                          Practical steps and how-to information
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="depth-detailed"
                          name="informationDepth"
                          value="detailed"
                          checked={getFormData("residencyIntentions.informationDepth") === "detailed"}
                          onChange={(e) => updateFormData("residencyIntentions.informationDepth", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="depth-detailed" className="text-sm">
                          Detailed analysis and comprehensive guidance
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Center of Life Tax Implications - Always show for citizens and EU movers */}
          {hasNoVisaRequirement && !showAlternativeOptions && (
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Globe className="w-6 h-6 text-orange-600" />
                  Center of Life Tax Implications
                </CardTitle>
                <p className="text-sm text-muted-foreground">Managing tax obligations across multiple countries</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2 text-sm">
                        <p><strong>Understanding 'Center of Life' for Tax Purposes:</strong></p>
                        <p>If you maintain significant presence or business connections with another country after moving, that country may consider your "Center of Life" to be there, making you liable for taxation.</p>
                        
                        <p><strong>Countries determine your "center of life" based on:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Time spent in the country (often &gt;183 days/year)</li>
                          <li>Location of permanent home</li>
                          <li>Family ties</li>
                          <li>Economic interests (job, bank accounts)</li>
                          <li>Social connections</li>
                        </ul>
                        
                        <p><strong>Simplified explanation:</strong> Your "center of life" is like your favorite playground. Countries want to know if their 'playground' is your favorite because it affects how much 'taxes' they can collect from you.</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox
                      id="significant_ties_citizen"
                      checked={maintainsSignificantTies}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.centerOfLife.maintainsSignificantTies", !!v)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="significant_ties_citizen" className="text-base font-medium">
                        I will maintain significant ties with my current country, or another country that is not {destCountry}, after moving.
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check if you'll keep a home, business, or spend substantial time in your current country
                      </p>
                    </div>
                  </div>

                  {maintainsSignificantTies && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Describe your ongoing connections</Label>
                      <Textarea
                        value={tiesDescription}
                        onChange={(e) => updateFormData("residencyIntentions.centerOfLife.tiesDescription", e.target.value)}
                        placeholder="E.g., I will keep my house and visit family for 2 months each year"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        Examples: keeping property, business interests, family connections, frequent visits
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Residency Plans (only show if not already citizen or EU) */}
          {!hasNoVisaRequirement && !citizenshipStatus && !showAlternativeOptions && (
            <Card className="shadow-sm border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
            Residency Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your plans for obtaining legal residency status</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="apply_residency"
                checked={applyForResidency}
                onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.applyForResidency", !!v)}
              />
              <Label htmlFor="apply_residency" className="text-base font-medium">
                      I want to apply for residency in {destCountry}
              </Label>
            </div>

            {applyForResidency && (
                    <>
                      {/* Minimum Stay Requirements */}
              <div className="space-y-4 p-4 border rounded-lg bg-card">
                        <div className="space-y-4">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Minimum Stay Requirements
                          </h4>
                          
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2 text-sm">
                                <p><strong>Important information about physical presence requirements:</strong></p>
                                <p>Many countries require applicants to be physically present for a minimum period each year:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  <li>This is especially important during initial residency years</li>
                                  <li>Requirements typically range from 3-9 months per year</li>
                                  <li>Some programs have reduced presence requirements for investors</li>
                                  <li>Absence periods may need pre-approval from immigration authorities</li>
                                  <li>Requirements often relax after permanent residency is granted</li>
                                </ul>
                                <p>Your answer helps identify suitable residency pathways based on your travel needs.</p>
                              </div>
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-3">
                            <Label className="text-base font-medium">
                              Maximum months per year I am willing to reside in {destCountry} in my first year
                            </Label>
                  <div className="px-3">
                    <Slider
                      value={[maxMonths]}
                      onValueChange={(value) => updateFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside", value[0])}
                      max={12}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>0 months</span>
                      <span className="font-medium">{maxMonths} months</span>
                      <span>12 months</span>
                    </div>
                </div>
              </div>

                          {maxMonths === 0 && (
                            <div className="space-y-3">
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  ⚠️ You've indicated you don't want to be physically present at all.
                                </AlertDescription>
                              </Alert>
                              <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Checkbox
                id="open_visiting"
                checked={openToVisiting}
                onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.openToVisiting", !!v)}
              />
                                <Label htmlFor="open_visiting" className="text-sm font-medium">
                                  I'm open to occasional visits if required
              </Label>
            </div>
                            </div>
                          )}

                          {maxMonths <= 6 && maxMonths > 0 && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                ℹ️ Limited physical presence may trigger 'Center of Life' tax issues in other countries. See section below.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      {/* Center of Life Tax Implications */}
                      <div className="space-y-4 p-4 border rounded-lg bg-card">
                        <h4 className="font-medium text-base flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          Center of Life Tax Implications
                        </h4>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2 text-sm">
                              <p><strong>Understanding 'Center of Life' for Tax Purposes:</strong></p>
                              <p>If you maintain significant presence or business connections with another country after moving, that country may consider your "Center of Life" to be there, making you liable for taxation.</p>
                              
                              <p><strong>Countries determine your "center of life" based on:</strong></p>
                              <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Time spent in the country (often &gt;183 days/year)</li>
                                <li>Location of permanent home</li>
                                <li>Family ties</li>
                                <li>Economic interests (job, bank accounts)</li>
                                <li>Social connections</li>
                              </ul>
                              
                              <p><strong>Simplified explanation:</strong> Your "center of life" is like your favorite playground. Countries want to know if their 'playground' is your favorite because it affects how much 'taxes' they can collect from you.</p>
                            </div>
                          </AlertDescription>
                        </Alert>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="significant_ties"
                            checked={maintainsSignificantTies}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.centerOfLife.maintainsSignificantTies", !!v)}
                          />
                          <div className="flex-1">
                            <Label htmlFor="significant_ties" className="text-sm font-medium">
                              I will maintain significant ties with my current country, or another country that is not the destination country, after moving.
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Check if you'll keep a home, business, or spend substantial time in your current country
                            </p>
                          </div>
                        </div>

                        {maintainsSignificantTies && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Describe your ongoing connections</Label>
                            <Textarea
                              value={tiesDescription}
                              onChange={(e) => updateFormData("residencyIntentions.centerOfLife.tiesDescription", e.target.value)}
                              placeholder="E.g., I will keep my house and visit family for 2 months each year"
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Examples: keeping property, business interests, family connections, frequent visits
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
          </div>
        </CardContent>
      </Card>
          )}

          {/* Citizenship Plans (only show if not already citizen/EU and interested) */}
          {!hasNoVisaRequirement && !citizenshipStatus && !showAlternativeOptions && (
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  Citizenship Interest
          </CardTitle>
                <p className="text-sm text-muted-foreground">Your interest in obtaining citizenship in {destCountry}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="interested_citizenship"
                checked={interestedInCitizenship}
                onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.interestedInCitizenship", !!v)}
              />
              <Label htmlFor="interested_citizenship" className="text-base font-medium">
                      I am interested in becoming a citizen of {destCountry}
              </Label>
            </div>

            {interestedInCitizenship && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        N.B. For most countries, being a resident (and taxpayer) for some number of years is a way to obtain citizenship. I will inform you whether this is so for {destCountry}.
                      </p>

                      {/* Citizenship Options */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg">🪪 Citizenship Options</h4>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Family Connections */}
                          <Card className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Family Connections
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Citizenship by family ties</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id="family_ties"
                                  checked={familyTies}
                                  onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.familyTies.hasConnections", !!v)}
                                />
                                <Label htmlFor="family_ties" className="text-sm font-medium">
                                  I have family ties to this country
                                </Label>
                              </div>
                              
                              {familyTies && (
                                <div className="space-y-2">
                                  <Label className="text-sm">Describe your closest family relation in the country</Label>
                                  <Input
                                    value={familyRelation}
                                    onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.familyTies.closestRelation", e.target.value)}
                                    placeholder="E.g., parent, grandparent, spouse, child"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Military Service */}
                          <Card className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Military Service
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Citizenship through military service</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id="military_service"
                                  checked={militaryService}
                                  onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.militaryService.willing", !!v)}
                                />
                                <Label htmlFor="military_service" className="text-sm font-medium">
                                  I am open to military service
                                </Label>
                              </div>
                              
                              {militaryService && (
                                <div className="space-y-2">
                                  <Label className="text-sm">Maximum years of service</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={maxServiceYears}
                                    onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.militaryService.maxServiceYears", parseInt(e.target.value) || 2)}
                                    placeholder="2"
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Investment */}
                          <Card className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Investment
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Citizenship by investment</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                                  id="investment"
                                  checked={investmentWilling}
                                  onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.investment.willing", !!v)}
                                />
                                <Label htmlFor="investment" className="text-sm font-medium">
                                  I am open to investment
                  </Label>
                </div>

                              {investmentWilling && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Investment Amount</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={investmentAmount}
                                      onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.investment.amount", parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Currency</Label>
                                    <Select
                                      value={investmentCurrency}
                                      onValueChange={(value) => updateFormData("residencyIntentions.citizenshipPlans.investment.currency", value)}
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
                              )}
                            </CardContent>
                          </Card>

                          {/* Donation */}
                          <Card className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Heart className="w-5 h-5" />
                                Donation
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Citizenship by donation</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                                  id="donation"
                                  checked={donationWilling}
                                  onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.donation.willing", !!v)}
                                />
                                <Label htmlFor="donation" className="text-sm font-medium">
                                  I am open to donate
                  </Label>
                              </div>
                              
                              {donationWilling && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Donation amount</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={donationAmount}
                                      onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.donation.amount", parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Currency</Label>
                                    <Select
                                      value={donationCurrency}
                                      onValueChange={(value) => updateFormData("residencyIntentions.citizenshipPlans.donation.currency", value)}
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
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </>
            )}
          </div>
        </CardContent>
      </Card>
          )}

        </>
                )}

          {/* Family Visa Planning - Only show if family requires visas */}
          {familyVisaAnalysis && familyVisaAnalysis.familyRequiresVisas && !showAlternativeOptions && (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Family Visa Planning
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Plan visa applications and timeline coordination for family members
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  
                  {/* Visa Application Timeline Preference */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Preferred Visa Application Timeline</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="timeline-together"
                          name="familyVisaTimeline"
                          value="together"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.applicationTimeline") === "together"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="timeline-together" className="text-sm">
                          Apply for all family visas together (coordinated timeline)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="timeline-sequential"
                          name="familyVisaTimeline" 
                          value="sequential"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.applicationTimeline") === "sequential"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="timeline-sequential" className="text-sm">
                          Apply sequentially (primary applicant first, then family)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="timeline-flexible"
                          name="familyVisaTimeline"
                          value="flexible"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.applicationTimeline") === "flexible"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="timeline-flexible" className="text-sm">
                          Flexible timing based on processing requirements
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Family Relocation Priority */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Family Relocation Priority</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="priority-together"
                          name="familyRelocationPriority"
                          value="moveTogetherEssential"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.relocationPriority") === "moveTogetherEssential"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="priority-together" className="text-sm">
                          Moving together is essential - will delay if needed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="priority-primary-first"
                          name="familyRelocationPriority"
                          value="primaryFirstAcceptable"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.relocationPriority") === "primaryFirstAcceptable"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="priority-primary-first" className="text-sm">
                          Primary applicant can move first, family follows later
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="priority-flexible-timing"
                          name="familyRelocationPriority"
                          value="flexibleTiming"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.relocationPriority") === "flexibleTiming"}
                          onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", e.target.value)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="priority-flexible-timing" className="text-sm">
                          Flexible timing - optimize for fastest overall process
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Document Preparation Concerns */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Main Document/Process Concerns</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="concern-documents"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.concerns")?.includes("documentPreparation") ?? false}
                          onCheckedChange={(checked) => {
                            const currentConcerns = getFormData("residencyIntentions.familyVisaPlanning.concerns") || []
                            const newConcerns = checked 
                              ? [...currentConcerns, "documentPreparation"]
                              : currentConcerns.filter((c: string) => c !== "documentPreparation")
                            updateFormData("residencyIntentions.familyVisaPlanning.concerns", newConcerns)
                          }}
                        />
                        <Label htmlFor="concern-documents" className="text-sm">
                          Document preparation and apostille/legalization requirements
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="concern-costs"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.concerns")?.includes("applicationCosts") ?? false}
                          onCheckedChange={(checked) => {
                            const currentConcerns = getFormData("residencyIntentions.familyVisaPlanning.concerns") || []
                            const newConcerns = checked 
                              ? [...currentConcerns, "applicationCosts"]
                              : currentConcerns.filter((c: string) => c !== "applicationCosts")
                            updateFormData("residencyIntentions.familyVisaPlanning.concerns", newConcerns)
                          }}
                        />
                        <Label htmlFor="concern-costs" className="text-sm">
                          Total application costs for multiple family members
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="concern-timing"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.concerns")?.includes("processingTiming") ?? false}
                          onCheckedChange={(checked) => {
                            const currentConcerns = getFormData("residencyIntentions.familyVisaPlanning.concerns") || []
                            const newConcerns = checked 
                              ? [...currentConcerns, "processingTiming"]
                              : currentConcerns.filter((c: string) => c !== "processingTiming")
                            updateFormData("residencyIntentions.familyVisaPlanning.concerns", newConcerns)
                          }}
                        />
                        <Label htmlFor="concern-timing" className="text-sm">
                          Processing times and potential delays
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="concern-schooling"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.concerns")?.includes("childSchooling") ?? false}
                          onCheckedChange={(checked) => {
                            const currentConcerns = getFormData("residencyIntentions.familyVisaPlanning.concerns") || []
                            const newConcerns = checked 
                              ? [...currentConcerns, "childSchooling"]
                              : currentConcerns.filter((c: string) => c !== "childSchooling")
                            updateFormData("residencyIntentions.familyVisaPlanning.concerns", newConcerns)
                          }}
                        />
                        <Label htmlFor="concern-schooling" className="text-sm">
                          School enrollment and academic year timing for children
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="concern-work"
                          checked={getFormData("residencyIntentions.familyVisaPlanning.concerns")?.includes("spouseWork") ?? false}
                          onCheckedChange={(checked) => {
                            const currentConcerns = getFormData("residencyIntentions.familyVisaPlanning.concerns") || []
                            const newConcerns = checked 
                              ? [...currentConcerns, "spouseWork"]
                              : currentConcerns.filter((c: string) => c !== "spouseWork")
                            updateFormData("residencyIntentions.familyVisaPlanning.concerns", newConcerns)
                          }}
                        />
                        <Label htmlFor="concern-work" className="text-sm">
                          Spouse/partner work authorization and employment timeline
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Special Family Circumstances */}
                  <div className="space-y-4">
                    <Label htmlFor="family-circumstances" className="text-base font-medium">
                      Special Family Circumstances
                    </Label>
                    <Textarea
                      id="family-circumstances"
                      placeholder="Any special family circumstances that might affect visa applications (e.g., medical needs, elderly dependents, dual citizenship considerations, previous visa history, etc.)"
                      value={getFormData("residencyIntentions.familyVisaPlanning.specialCircumstances") || ""}
                      onChange={(e) => updateFormData("residencyIntentions.familyVisaPlanning.specialCircumstances", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

      {/* Language Skills - Only show for non-citizens/non-EU */}
      {destCountry && !hasNoVisaRequirement && !showAlternativeOptions && (
        <Card className="shadow-sm border-l-4 border-l-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
                <Languages className="w-6 h-6 text-indigo-600" />
              Language Skills
            </CardTitle>
              <p className="text-sm text-muted-foreground">Your proficiency in languages for immigration and integration</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
                {languages.length > 0 ? (
                  <>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        🌐 The dominant language{languages.length > 1 ? 's' : ''} in {destCountry} {languages.length > 1 ? 'are' : 'is'}{' '}
                        <strong>{languages.join(', ')}</strong>.
                      </p>
                    </div>

                    {/* Your Language Skills */}
                <div className="space-y-4">
                      <h4 className="font-medium text-base">📊 Your Language Skills</h4>
                      {languages.map((lang: string) => {
                    const currentLevel = Number(getFormData(`residencyIntentions.languageProficiency.individual.${lang}`) || 0)
                        const willingToLearn = getFormData(`residencyIntentions.languageProficiency.willing_to_learn`) || []
                    
                    return (
                          <div key={`individual-${lang}`} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                              <Label className="text-base font-medium">Your proficiency in {lang}</Label>
                          <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                        </div>
                        <Slider
                          value={[currentLevel]}
                          onValueChange={(value) => {
                            updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0])
                          }}
                          max={6}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span>
                              <span>A1</span>
                              <span>A2</span>
                              <span>B1</span>
                              <span>B2</span>
                              <span>C1</span>
                              <span>C2</span>
                            </div>
                            
                            {/* Willing to learn checkbox */}
                            {currentLevel < 3 && (
                              <div className="flex items-center gap-2 mt-3">
                                <Checkbox
                                  id={`learn-${lang}`}
                                  checked={willingToLearn.includes(lang)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked 
                                      ? [...willingToLearn, lang]
                                      : willingToLearn.filter((l: string) => l !== lang)
                                    updateFormData("residencyIntentions.languageProficiency.willing_to_learn", updated)
                                  }}
                                />
                                <Label htmlFor={`learn-${lang}`} className="text-sm">
                                  Willing to learn {lang}
                                </Label>
                              </div>
                            )}

                            {/* Teaching capability for advanced speakers */}
                            {currentLevel >= 4 && (
                              <div className="space-y-2 mt-3">
                                <Label className="text-sm font-medium">Can you teach {lang}?</Label>
                                <div className="flex gap-4">
                                  {["No", "Informally", "Formally with credentials"].map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        id={`teach-${lang}-${option}`}
                                        name={`teach-${lang}`}
                                        value={option}
                                        checked={getFormData(`residencyIntentions.languageProficiency.can_teach.${lang}`) === option}
                                        onChange={() => updateFormData(`residencyIntentions.languageProficiency.can_teach.${lang}`, option)}
                                      />
                                      <label htmlFor={`teach-${lang}-${option}`} className="text-sm cursor-pointer">{option}</label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Partner's Language Skills */}
                    {hasPartner && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">👥 Partner's Language Skills</h4>
                        {languages.map((lang: string) => {
                          const currentLevel = Number(getFormData(`residencyIntentions.languageProficiency.partner.${lang}`) || 0)
                          
                          return (
                            <div key={`partner-${lang}`} className="space-y-3 p-4 border rounded-lg">
                              <div className="flex justify-between items-center">
                                <Label className="text-base font-medium">Partner's proficiency in {lang}</Label>
                                <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                              </div>
                              <Slider
                                value={[currentLevel]}
                                onValueChange={(value) => {
                                  updateFormData(`residencyIntentions.languageProficiency.partner.${lang}`, value[0])
                                }}
                                max={6}
                                min={0}
                                step={1}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>None</span>
                                <span>A1</span>
                                <span>A2</span>
                                <span>B1</span>
                                <span>B2</span>
                                <span>C1</span>
                                <span>C2</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

                    {/* Dependents' Language Skills */}
                    {numDependents > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">👨‍👩‍👧‍👦 Dependents' Language Skills</h4>
                        {Array.from({length: numDependents}, (_, i) => (
                          <Card key={i} className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Dependent {i + 1}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {languages.map((lang: string) => {
                                const currentLevel = Number(getFormData(`residencyIntentions.languageProficiency.dependents.${i}.${lang}`) || 0)
                                
                                return (
                                  <div key={`dependent-${i}-${lang}`} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <Label className="text-sm font-medium">Proficiency in {lang}</Label>
                                      <Badge variant="outline">{proficiencyLabels[currentLevel]}</Badge>
                                    </div>
                                    <Slider
                                      value={[currentLevel]}
                                      onValueChange={(value) => {
                                        updateFormData(`residencyIntentions.languageProficiency.dependents.${i}.${lang}`, value[0])
                                      }}
                                      max={6}
                                      min={0}
                                      step={1}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>None</span>
                                      <span>A1</span>
                                      <span>A2</span>
                                      <span>B1</span>
                                      <span>B2</span>
                                      <span>C1</span>
                                      <span>C2</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ No language information available for {destCountry}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Other Languages You Can Teach */}
              <div className="space-y-4 border-t pt-6">
                  <h4 className="font-medium text-base">🔤 Other languages you speak (and could teach)</h4>
                  <p className="text-sm text-muted-foreground">Add any other languages you can teach that aren't listed above</p>
                
                  <div className="flex gap-3 items-end">
                  <div className="flex-1">
                      <Label className="text-sm">Language name</Label>
                    <Input
                        value={newTeachingLang.language}
                        onChange={(e) => setNewTeachingLang({...newTeachingLang, language: e.target.value})}
                        placeholder="Enter language name"
                    />
                  </div>
                    <div>
                      <Label className="text-sm">Teaching capability</Label>
                    <Select
                        value={newTeachingLang.capability}
                        onValueChange={(value) => setNewTeachingLang({...newTeachingLang, capability: value})}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Not interested">Not interested</SelectItem>
                        <SelectItem value="Informally">Informally</SelectItem>
                        <SelectItem value="Formally with credentials">Formally with credentials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                        if (newTeachingLang.language && !otherLanguages[newTeachingLang.language]) {
                          const updated = {
                            ...otherLanguages,
                            [newTeachingLang.language]: newTeachingLang.capability
                          }
                          updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                          setNewTeachingLang({language: '', capability: 'Informally'})
                        }
                      }}
                      disabled={!newTeachingLang.language || !!otherLanguages[newTeachingLang.language]}
                    >
                      💾 Add Language
                  </Button>
                </div>

                  {Object.keys(otherLanguages).length > 0 && (
                  <div className="space-y-2">
                      <h5 className="font-medium">🔤 Languages you can teach:</h5>
                      {Object.entries(otherLanguages).map(([lang, level]: [string, any]) => (
                        <div key={lang} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                        <div>
                            <span className="font-medium">{lang}</span>
                            <span className="text-sm text-muted-foreground ml-2">({level})</span>
                        </div>
                        <Button
                            variant="destructive"
                          size="sm"
                            onClick={() => {
                              const updated = {...otherLanguages}
                              delete updated[lang]
                              updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                            }}
                          >
                            ❌ Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivation & Compliance - Only show for non-citizens/non-EU */}
      {!hasNoVisaRequirement && !showAlternativeOptions && (
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Heart className="w-6 h-6 text-amber-600" />
            Motivation & Compliance
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your motivation for moving and tax compliance commitment</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Briefly describe your motivation for moving</Label>
              <Textarea
                value={motivation}
                onChange={(e) => updateFormData("residencyIntentions.moveMotivation", e.target.value)}
                placeholder="This can help tailor advice to your personal goals and may be relevant for visa applications."
                rows={4}
              />
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="tax_compliance"
                checked={taxCompliant}
                onCheckedChange={(v) => updateFormData("residencyIntentions.taxCompliantEverywhere", !!v)}
              />
              <div>
                <Label htmlFor="tax_compliance" className="text-base font-medium">
                  I have been fully tax compliant in every country I have lived in
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Check this if you have always filed and paid taxes as required in every country where you have lived.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>⚠️ Please fix the following errors:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                  </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Check My Information Button */}
            <div className="flex justify-center">
              <CheckInfoButton
                onClick={() => showSectionInfo("residency")}
                isLoading={isCheckingInfo}
              />
            </div>

            <Button
              disabled={!canContinue}
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Continue to Finance
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