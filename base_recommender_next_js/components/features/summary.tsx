"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useFormStore } from "@/lib/stores"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { apiClient } from "@/lib/api-client"
import { 
  Download, 
  FileText, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  User, 
  MapPin, 
  GraduationCap, 
  Heart, 
  DollarSign, 
  Lightbulb, 
  PiggyBank, 
  Receipt, 
  TrendingUp, 
  FileEdit,
  Calendar,
  Shield,
  Target,
  AlertCircle,
  Info,
  ChevronDown,
  Loader2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { canMoveWithinEU, hasEUCitizenship, isEUCountry } from "@/lib/utils/eu-utils"
import { analyzeFamilyVisaRequirements } from "@/lib/utils/family-visa-utils"

export function Summary() {
  const { formData, hasRequiredData, completedSections, isSectionMarkedComplete } = useFormStore()
  const [showJSON, setShowJSON] = useState(false)
  
  // Section info modal functionality
  const { 
    isLoading: isCheckingInfo, 
    currentStory, 
    modalTitle, 
    isModalOpen, 
    currentSection, 
    isFullView, 
    showSectionInfo, 
    closeModal, 
    expandFullInformation, 
    backToSection, 
    goToSection, 
    navigateToSection 
  } = useSectionInfo()
  
  // State for individual section stories
  const [sectionStories, setSectionStories] = useState<{[key: string]: string}>({})
  const [loadingSections, setLoadingSections] = useState<{[key: string]: boolean}>({})

  // Function to fetch individual section story
  const fetchSectionStory = async (sectionId: string) => {
    if (sectionStories[sectionId] || loadingSections[sectionId]) return
    
    setLoadingSections(prev => ({ ...prev, [sectionId]: true }))
    
    try {
      let response
      const destCountry = formData.residencyIntentions?.destinationCountry?.country
      const skipFinanceDetails = formData.finance?.skipDetails ?? false
      
      switch (sectionId) {
        case "personal":
          const personalInfo = formData.personalInformation || {}
          response = await apiClient.getPersonalInformationStory(personalInfo, destCountry)
          break
        case "education":
          const education = formData.education || {}
          response = await apiClient.getEducationStory(education, destCountry)
          break
        case "residency":
          const residency = formData.residencyIntentions || {}
          response = await apiClient.getResidencyIntentionsStory(residency, destCountry)
          break
        case "finance":
          const finance = formData.finance || {}
          response = await apiClient.getFinanceStory(finance, destCountry)
          break
        case "socialSecurity":
          const socialSecurity = formData.socialSecurityAndPensions || {}
          response = await apiClient.getSocialSecurityStory(socialSecurity, destCountry, skipFinanceDetails)
          break
        case "taxDeductions":
          const taxDeductions = formData.taxDeductionsAndCredits || {}
          response = await apiClient.getTaxDeductionsStory(taxDeductions, destCountry, skipFinanceDetails)
          break
        case "futurePlans":
          const futurePlans = formData.futureFinancialPlans || {}
          response = await apiClient.getFutureFinancialPlansStory(futurePlans, destCountry, skipFinanceDetails)
          break
        case "additional":
          const additionalInfo = formData.additionalInformation || {}
          response = await apiClient.getAdditionalInformationStory(additionalInfo, destCountry)
          break
        default:
          throw new Error(`Unknown section: ${sectionId}`)
      }
      
      setSectionStories(prev => ({ ...prev, [sectionId]: response.story }))
    } catch (error) {
      console.error(`Error fetching story for ${sectionId}:`, error)
      setSectionStories(prev => ({ ...prev, [sectionId]: "Error loading section information." }))
    } finally {
      setLoadingSections(prev => ({ ...prev, [sectionId]: false }))
    }
  }

  const json = JSON.stringify(formData, null, 2)
  
  // Check if this is an alternative interests completion
  const alternativeInterests = formData.alternativeInterests
  const userPurpose = alternativeInterests?.purpose
  
  // Check user's citizenship and finance status
  const destCountry = formData.residencyIntentions?.destinationCountry?.country
  const userNationalities = formData.personalInformation?.nationalities || []
  const partnerInfo = formData.personalInformation?.relocationPartnerInfo 
  const dependentsInfo = formData.personalInformation?.relocationDependents || []
  const hasSkippedFinance = formData.finance?.skipDetails
  
  // Check if user is already a citizen of destination country
  const isAlreadyCitizen = destCountry && userNationalities.some((nat: any) => nat.country === destCountry)
  
  // Check EU movement rights for primary user
  const canMoveWithinEUFreedom = destCountry && canMoveWithinEU(userNationalities, destCountry)
  
  // Treat EU movement the same as direct citizenship for most purposes
  const hasNoVisaRequirement = isAlreadyCitizen || canMoveWithinEUFreedom
  
  // Analyze family visa requirements
  const familyVisaAnalysis = destCountry ? (() => {
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
  })() : null
  
  const hasNoFamilyVisaIssues = !familyVisaAnalysis || !familyVisaAnalysis.familyRequiresVisas
  
  // Check if Personal Information section is completed (required to have complete family data)
  const isPersonalInfoComplete = isSectionMarkedComplete("personal")
  
  // Check if user CURRENTLY qualifies for alternative pathway
  // Must meet ALL original conditions: Personal Info complete + citizen/EU + finance skipped + no family visa issues
  const currentlyQualifiesForAlternative = isPersonalInfoComplete && hasSkippedFinance && hasNoVisaRequirement && hasNoFamilyVisaIssues && destCountry
  
  // Only show alternative pathway if user completed via that pathway AND still qualifies for it
  // The section should disappear completely if ANY condition is no longer met
  const isCurrentlyAlternativeCase = Boolean(
    alternativeInterests?.completedViaSummary && 
    isPersonalInfoComplete &&
    hasSkippedFinance && 
    hasNoVisaRequirement && 
    hasNoFamilyVisaIssues && 
    destCountry && 
    userPurpose
  )
  
  // Temporary debug - remove after fixing
  console.log('🔍 Alternative Summary Debug:', {
    'completedViaSummary': alternativeInterests?.completedViaSummary,
    'isPersonalInfoComplete': isPersonalInfoComplete,
    'hasSkippedFinance': hasSkippedFinance,
    'hasNoVisaRequirement': hasNoVisaRequirement,
    'hasNoFamilyVisaIssues': hasNoFamilyVisaIssues,
    'destCountry': destCountry,
    'userPurpose': !!userPurpose,
    'FINAL_RESULT': isCurrentlyAlternativeCase
  })

  const downloadJSON = () => {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tax_migration_profile.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const printPDF = () => {
    window.print()
  }

  const resetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.removeItem("tax-migration-form")
      window.location.reload()
    }
  }

  // Section completion status
  const sections = [
    { id: "destination", name: "Destination Country", icon: MapPin, data: formData.destination },
    { id: "personal", name: "Personal Information", icon: User, data: formData.personalInformation },
    { id: "education", name: "Education & Skills", icon: GraduationCap, data: formData.education },
    { id: "residency", name: "Residency Intentions", icon: Heart, data: formData.residencyIntentions },
    { id: "finance", name: "Financial Information", icon: DollarSign, data: formData.finance },
    { id: "socialSecurity", name: "Social Security & Pensions", icon: Shield, data: formData.socialSecurityAndPensions },
    { id: "taxDeductions", name: "Tax Deductions & Credits", icon: Receipt, data: formData.taxDeductionsAndCredits },
    { id: "futurePlans", name: "Future Financial Plans", icon: TrendingUp, data: formData.futureFinancialPlans },
    { id: "additional", name: "Additional Information", icon: FileEdit, data: formData.additionalInformation }
  ]

  const completedCount = sections.filter(section => 
    (section.data && Object.keys(section.data).length > 0)
  ).length

  const completionPercentage = Math.round((completedCount / sections.length) * 100)

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Profile Summary</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review your tax migration profile and view your complete information
        </p>
        
        {/* Prominent View Full Profile Button */}
        <div className="mt-6 flex justify-center">
          <CheckInfoButton
            onClick={() => {
              // Immediately expand to full information view
              expandFullInformation()
            }}
            isLoading={isCheckingInfo}
            variant="default"
            size="lg"
            className="px-8 py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            icon={<Eye className="w-5 h-5" />}
            loadingText="Generating Complete Profile..."
          >
            View Complete Profile
          </CheckInfoButton>
        </div>
      </div>

      {/* Special Alternative Interests Summary */}
      {isCurrentlyAlternativeCase && (
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-600" />
              Alternative Pathway Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                <div className="space-y-3">
                  <p>
                    <strong>Status:</strong> You are already a citizen of {destCountry} and do not need taxation advice.
                  </p>
                  {hasSkippedFinance && (
                    <p>
                      <strong>Financial Details:</strong> You chose to skip detailed financial information.
                    </p>
                  )}
                  <div>
                    <strong>Your Specific Purpose:</strong>
                    <p className="mt-1 italic">"{userPurpose}"</p>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-4">
                    All sections have been marked as complete based on your alternative pathway completion.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Completion Overview Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <Target className="w-6 h-6 text-primary" />
            Profile Completion
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your progress through the questionnaire</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Overall progress */}
            <div className="text-center p-6 border rounded-lg bg-card">
              <div className="text-4xl font-bold text-primary mb-2">{completionPercentage}%</div>
              <div className="text-lg font-medium mb-1">Profile Complete</div>
              <div className="text-sm text-muted-foreground">
                {completedCount} of {sections.length} sections completed
              </div>
            </div>

            {/* Expandable Section breakdown */}
            <Accordion type="multiple" className="w-full">
              {sections.map((section) => {
                const hasData = section.data && Object.keys(section.data).length > 0
                const status = hasData
                const isLoading = loadingSections[section.id]
                const story = sectionStories[section.id]
                
                if (!status) {
                  // Show non-expandable item for incomplete sections
                  return (
                    <div key={section.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
                      <div className="p-2 rounded-full bg-card text-gray-500">
                        <section.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-600">{section.name}</div>
                      </div>
                      <Badge variant="secondary">Incomplete</Badge>
                    </div>
                  )
                }
                
                return (
                  <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                    <AccordionTrigger 
                      className="flex items-center gap-3 p-3 hover:no-underline"
                      onClick={() => fetchSectionStory(section.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-full bg-green-100 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{section.name}</div>
                        </div>
                        <Badge variant="default">Complete</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="ml-11 pt-2 border-t bg-gray-50/50 p-4 rounded">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading section information...</span>
                          </div>
                        ) : story ? (
                          <div className="prose prose-sm max-w-none text-gray-700">
                            {story.split('\n').map((paragraph, idx) => (
                              paragraph.trim() ? (
                                <p key={idx} className="mb-2 last:mb-0">{paragraph}</p>
                              ) : null
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            Click to load section information
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Profile Overview Card */}
      {formData && (
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              Profile Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground">Key information from your profile</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Destination */}
              {formData.destination && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Destination</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.destination.region && formData.destination.region !== "I don't know yet / open to any" 
                      ? `${formData.destination.region}, ${formData.destination.country}`
                      : formData.destination.country}
                  </p>
                </div>
              )}

              {/* Current Country */}
              {formData.personalInformation?.currentResidency?.country && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Current Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.personalInformation.currentResidency.country}
                  </p>
                </div>
              )}

              {/* Move Type */}
              {formData.residencyIntentions?.destinationCountry?.moveType && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Move Type</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {formData.residencyIntentions.destinationCountry.moveType}
                  </p>
                </div>
              )}

                             {/* Income Sources */}
               {formData.finance?.incomeSources && formData.finance.incomeSources.length > 0 && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <DollarSign className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Income Sources</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     {formData.finance.incomeSources.length} source{formData.finance.incomeSources.length !== 1 ? 's' : ''}
                   </p>
                 </div>
               )}

               {/* Education */}
               {formData.education?.previousDegrees && formData.education.previousDegrees.length > 0 && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <GraduationCap className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Education</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     {formData.education.previousDegrees.length} degree{formData.education.previousDegrees.length !== 1 ? 's' : ''}
                   </p>
                 </div>
               )}

               {/* Family */}
               {formData.personalInformation?.partner && (
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-muted-foreground" />
                     <span className="font-medium">Family</span>
                   </div>
                   <p className="text-sm text-muted-foreground ml-6">
                     Relocating with partner
                     {formData.personalInformation.dependents && formData.personalInformation.dependents.length > 0 && 
                       ` and ${formData.personalInformation.dependents.length} dependent${formData.personalInformation.dependents.length !== 1 ? 's' : ''}`
                     }
                   </p>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Download className="w-6 h-6 text-green-600" />
            Export & Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">Download your profile or manage your data</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                onClick={downloadJSON}
                variant="default"
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Profile (JSON)
              </Button>

              <Button
                onClick={printPDF}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print Summary (PDF)
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button
                onClick={() => setShowJSON(!showJSON)}
                variant="ghost"
                className="w-full"
              >
                {showJSON ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showJSON ? "Hide" : "Show"} Raw Data
              </Button>

              <Button
                onClick={resetData}
                variant="destructive"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Display */}
      {showJSON && (
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-600" />
              Raw Profile Data
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your complete profile in JSON format</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-card p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {json}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes Card */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy:</strong> Your data is stored locally in your browser and is not automatically shared with any third parties. Make sure to download your profile before clearing your browser data.
              </AlertDescription>
            </Alert>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Professional Advice:</strong> This profile is a starting point for your tax migration planning. Always consult with qualified tax professionals, immigration lawyers, and financial advisors for your specific situation.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Accuracy:</strong> Tax laws and immigration requirements change frequently. Ensure you have the most current information before making any major decisions based on this profile.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
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