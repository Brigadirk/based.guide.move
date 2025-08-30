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
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Plane, MapPin, Heart, DollarSign, FileText, Clock, Globe, Target, Users, Shield, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { ValidationAlert } from "@/components/ui/validation-alert"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { canMoveWithinEU, isEUCountry, hasEUCitizenship } from "@/lib/utils/eu-utils"
import { analyzeFamilyVisaRequirements, getFamilyVisaComplexity, getFamilyVisaPlanningSteps } from "@/lib/utils/family-visa-utils"
import { useCurrencies } from "@/lib/hooks/use-currencies"

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
  


  // Move type and duration
  const moveType = getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const tempDuration = getFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") ?? 0

  // Automatically update citizenship status based on personal information
  useEffect(() => {
    if (destCountry) {
      updateFormData("residencyIntentions.destinationCountry.citizenshipStatus", isAlreadyCitizen)
    }
  }, [destCountry, isAlreadyCitizen, updateFormData])

  // Residency plans
  const applyForResidency = getFormData("residencyIntentions.residencyPlans.applyForResidency") ?? false
  const maxMonths = getFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside") ?? 6
  const wantMinimumOnly = getFormData("residencyIntentions.residencyPlans.wantMinimumOnly") ?? false
  const openToVisiting = getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false

  // Exploratory visit details
  const visitPurpose = getFormData("residencyIntentions.residencyPlans.exploratoryVisits.purpose") ?? ""
  const visitTiming = getFormData("residencyIntentions.residencyPlans.exploratoryVisits.timing") ?? ""
  const visitDuration = getFormData("residencyIntentions.residencyPlans.exploratoryVisits.duration") ?? ""
  const multipleVisits = getFormData("residencyIntentions.residencyPlans.exploratoryVisits.multipleVisits") ?? false

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



  // Motivation and compliance
  const motivation = getFormData("residencyIntentions.moveMotivation") ?? ""
  const taxCompliant = getFormData("residencyIntentions.taxCompliantEverywhere") ?? true
  const taxComplianceExplanation = getFormData("residencyIntentions.taxComplianceExplanation") ?? ""

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
      <div className="text-left pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary mb-3">
          🌐 Residency Intentions
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
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
                      onFocus={(e) => e.target.select()}
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

          {/* Center of Life Tax Implications - Always show for citizens and EU movers */}
          {hasNoVisaRequirement && (
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
          {!hasNoVisaRequirement && !isAlreadyCitizen && (
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
                            {!wantMinimumOnly && (
                              <>
                                <Label className="text-base font-medium">
                                  Maximum months per year I am willing to reside in {destCountry} in my first year
                                </Label>
                                <div className="px-3">
                                  <Slider
                                    value={[maxMonths]}
                                    onValueChange={(value) => {
                                      updateFormData("residencyIntentions.residencyPlans.maxMonthsWillingToReside", value[0])
                                    }}
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
                              </>
                            )}

                            {/* Checkbox for minimum requirement */}
                            <div className="flex items-center space-x-2 mt-4">
                              <Checkbox
                                id="want-minimum-only"
                                checked={wantMinimumOnly}
                                onCheckedChange={(checked) => {
                                  updateFormData("residencyIntentions.residencyPlans.wantMinimumOnly", checked)
                                  // When checked, we don't set a specific month value, 
                                  // letting the backend determine the minimum requirement
                                }}
                              />
                              <Label 
                                htmlFor="want-minimum-only" 
                                className="text-sm font-normal cursor-pointer"
                              >
                                Just let me know about minimum stay requirements
                              </Label>
                            </div>
              </div>

                          {maxMonths === 0 && !wantMinimumOnly && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                ⚠️ You've indicated you don't want to be physically present at all.
                              </AlertDescription>
                            </Alert>
                          )}

                          {wantMinimumOnly && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                ✅ We'll provide recommendations based on the minimum residency requirements for your destination country. This typically ranges from a few days to a few months per year, depending on the visa type.
                              </AlertDescription>
                            </Alert>
                          )}

                          {maxMonths <= 6 && maxMonths > 0 && !wantMinimumOnly && (
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

          {/* Exploratory Visits Section */}
          {!hasNoVisaRequirement && !isAlreadyCitizen && (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Plane className="w-6 h-6 text-blue-600" />
                  Exploratory Visits
                </CardTitle>
                <p className="text-sm text-muted-foreground">Planning visits before your main relocation</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox
                      id="open_visiting"
                      checked={openToVisiting}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.openToVisiting", !!v)}
                    />
                    <Label htmlFor="open_visiting" className="text-base font-medium">
                      I plan or I am open to making exploratory visits before relocating
                    </Label>
                  </div>

                  {openToVisiting && (
                    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tell us about your visit plans</Label>
                        <Textarea
                          className="resize-none text-sm"
                          placeholder="e.g., I want to visit in spring to find housing and check out schools for my kids. Planning 2-3 weeks initially, maybe multiple trips..."
                          maxLength={280}
                          rows={4}
                          value={getFormData("residencyIntentions.residencyPlans.exploratoryVisits.details") || ""}
                          onChange={(e) => updateFormData("residencyIntentions.residencyPlans.exploratoryVisits.details", e.target.value)}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Be specific about timing, purpose, and duration</span>
                          <span>{(getFormData("residencyIntentions.residencyPlans.exploratoryVisits.details") || "").length}/280</span>
                        </div>
                      </div>

                      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <strong>Important:</strong> Exploratory visits may count toward annual tax residency day limits and affect visa application timing. We'll factor this into your recommendations.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Citizenship Plans (only show if not already citizen/EU and interested) */}
          {!hasNoVisaRequirement && !isAlreadyCitizen && (
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
                      {/* Important Note about Residency Path to Citizenship */}
                      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <strong>Important:</strong> For most countries, being a resident (and taxpayer) for some number of years is a way to obtain citizenship. I will inform you whether this is so for {destCountry}. <strong>You may not need to select any of the options below.</strong>
                        </AlertDescription>
                      </Alert>

                      {/* Citizenship Options */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg">🪪 Alternative Citizenship Options</h4>
                        
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
                                    onFocus={(e) => e.target.select()}
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
                                      onFocus={(e) => e.target.select()}
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
                                      onFocus={(e) => e.target.select()}
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
          {familyVisaAnalysis && familyVisaAnalysis.familyRequiresVisas && (
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
                  
                  {/* Combined Family Visa Timeline & Priority */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Family Visa Application Strategy</Label>
                    <p className="text-sm text-muted-foreground">Choose how you prefer to coordinate applications and relocation timing.</p>
                    {(() => {
                      const currentTimeline = getFormData("residencyIntentions.familyVisaPlanning.applicationTimeline") || ""
                      const currentPriority = getFormData("residencyIntentions.familyVisaPlanning.relocationPriority") || ""
                      const combinedValue = (() => {
                        if (currentTimeline === "together" && currentPriority === "moveTogetherEssential") return "together_essential"
                        if (currentTimeline === "together" && currentPriority === "flexibleTiming") return "together_flexible"
                        if (currentTimeline === "sequential" && currentPriority === "primaryFirstAcceptable") return "sequential_primary"
                        if (currentTimeline === "flexible" && currentPriority === "flexibleTiming") return "flexible_flexible"
                        return ""
                      })()

                      const selectPlan = (value: string) => {
                        switch (value) {
                          case "together_essential":
                            updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", "together")
                            updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", "moveTogetherEssential")
                            break
                          case "together_flexible":
                            updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", "together")
                            updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", "flexibleTiming")
                            break
                          case "sequential_primary":
                            updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", "sequential")
                            updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", "primaryFirstAcceptable")
                            break
                          case "flexible_flexible":
                            updateFormData("residencyIntentions.familyVisaPlanning.applicationTimeline", "flexible")
                            updateFormData("residencyIntentions.familyVisaPlanning.relocationPriority", "flexibleTiming")
                            break
                        }
                      }

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="plan-together-essential"
                              name="familyVisaPlan"
                              value="together_essential"
                              checked={combinedValue === "together_essential"}
                              onChange={(e) => selectPlan(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="plan-together-essential" className="text-sm">
                              Apply together; moving together is essential
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="plan-together-flexible"
                              name="familyVisaPlan"
                              value="together_flexible"
                              checked={combinedValue === "together_flexible"}
                              onChange={(e) => selectPlan(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="plan-together-flexible" className="text-sm">
                              Apply together; flexible timing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="plan-sequential-primary"
                              name="familyVisaPlan"
                              value="sequential_primary"
                              checked={combinedValue === "sequential_primary"}
                              onChange={(e) => selectPlan(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="plan-sequential-primary" className="text-sm">
                              Apply sequentially; primary applicant first
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="plan-flexible-flexible"
                              name="familyVisaPlan"
                              value="flexible_flexible"
                              checked={combinedValue === "flexible_flexible"}
                              onChange={(e) => selectPlan(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="plan-flexible-flexible" className="text-sm">
                              Flexible timing for applications and relocation
                            </Label>
                          </div>
                        </div>
                      )
                    })()}
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



      {/* Motivation & Compliance - Only show for non-citizens/non-EU */}
      {!hasNoVisaRequirement && (
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
                  Uncheck this if you have NOT always filed and paid taxes as required in every country where you have lived. 
                </p>
              </div>
            </div>

            {!taxCompliant && (
              <div className="space-y-3">
                <Label htmlFor="tax_compliance_explanation" className="text-base font-medium">
                  Please explain your tax compliance situation
                </Label>
                <Textarea
                  id="tax_compliance_explanation"
                  placeholder="Please provide details about your tax compliance history. For example: missed filings in certain years, outstanding tax obligations, or other relevant circumstances..."
                  value={taxComplianceExplanation}
                  onChange={(e) => updateFormData("residencyIntentions.taxComplianceExplanation", e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  This information helps us provide more accurate recommendations and identify potential issues before they become problems.
                </p>
              </div>
            )}
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

            {/* Validation Alert */}
            <ValidationAlert 
              errors={errors} 
              isComplete={canContinue}
            />

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("residency")}
              isCheckingInfo={isCheckingInfo}
              sectionId="residency"
              onContinue={handleComplete}
              canContinue={canContinue}
              nextSectionName="Education"
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