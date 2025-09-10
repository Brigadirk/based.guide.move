"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  User,
  BookOpen, 
  Plane, 
  Banknote, 
  Briefcase, 
  Calculator, 
  TrendingUp, 
  Info,
  CheckCircle,
  AlertCircle,
  Check,
  Zap,
  Bug,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CountryFlag } from "@/components/features/country/CountryFlag";
import { Disclaimer } from "@/components/features/disclaimer";
import { Destination } from "@/components/features/destination";
import { PersonalInformation } from "@/components/features/personal";
import { Education } from "@/components/features/education";
import { ResidencyIntentions } from "@/components/features/residency-intentions";
import { Finance } from "@/components/features/finance";
import { SocialSecurityPensions } from "@/components/features/social-security-pensions";
import { TaxDeductionsAndCredits } from "@/components/features/tax-deductions-and-credits";
import { FutureFinancialPlans } from "@/components/features/future-financial-plans";
import { AdditionalInformation } from "@/components/features/additional-information";
import { Summary } from "@/components/features/summary-clean";
import { Results } from "@/components/features/results";
import { useFormStore } from "@/lib/stores";
import { DevStateViewer } from "@/components/dev/state-viewer";
import { AlternativeInterestsModal } from "@/components/ui/alternative-interests-modal";
import { useAlternativeInterests } from "@/lib/hooks/use-alternative-interests";
import { SelectedDestinationCard } from "@/components/features/selected-destination-card";

interface Section {
  id: string
  title: string
  icon: any
  required: boolean
  showDot: boolean
}

const SECTIONS: Section[] = [
  { id: "disclaimer", title: "Disclaimer", icon: AlertCircle, required: true, showDot: true },
  { id: "destination", title: "Candidate Destination", icon: Globe, required: true, showDot: true },
  { id: "personal", title: "Personal Information", icon: User, required: true, showDot: true },
  { id: "residency", title: "Residency Intentions", icon: Plane, required: true, showDot: true },
  { id: "education", title: "Education", icon: BookOpen, required: false, showDot: true },
  { id: "finance", title: "Income and Assets", icon: Banknote, required: true, showDot: true },
  { id: "social-security", title: "Social Security and Pensions", icon: Briefcase, required: false, showDot: true },
  { id: "tax-deductions", title: "Tax Deductions and Credits", icon: Calculator, required: false, showDot: true },
  { id: "future-plans", title: "Future Financial Plans", icon: TrendingUp, required: false, showDot: true },
  { id: "additional", title: "Additional Information", icon: Info, required: false, showDot: true },
  { id: "summary", title: "Summary & Results", icon: CheckCircle, required: false, showDot: false }, // Combined section
];

export default function HomePage() {
  const { 
    isSectionComplete, 
    hasRequiredData, 
    markSectionComplete, 
    isSectionMarkedComplete, 
    formData, 
    updateFormData, 
    resetFormData,
    currentSection,
    setCurrentSection,
    getFormData
  } = useFormStore();

  // Debug mode state (only in development)
  const [debugMode, setDebugMode] = useState(false)
  const [debugCollapsed, setDebugCollapsed] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  // Finance skip functionality (moved from toggle component to main app)
  const handleFinanceSkipToggle = (checked: boolean) => {
    const financeeSections = ["finance", "social-security", "tax-deductions", "future-plans"]
    
    updateFormData("finance.skipDetails", checked)
    
    if (checked) {
      // Mark all finance sections as complete
      financeeSections.forEach(sectionId => {
        markSectionComplete(sectionId)
      })
      updateFormData("finance.autoCompletedSections", financeeSections)
    } else {
      // Unmark all finance sections
      financeeSections.forEach(sectionId => {
        updateFormData(`completedSections.${sectionId}`, false)
      })
      updateFormData("finance.autoCompletedSections", false)
    }
  }

  // Alternative interests modal for visa-free + finance-skipped users
  const {
    shouldShowAlternativeInterests,
    isModalOpen,
    closeModal,
    destCountry: modalDestCountry,
    handleContinueToSummary,
    handleMistake
  } = useAlternativeInterests();
  
  // Finance skip state
  const skipFinanceDetails = getFormData("finance.skipDetails") ?? false
  
  const destCountry = (formData.residencyIntentions?.destinationCountry as any)?.country ?? formData.destination?.country ?? "";
  const destRegion = (formData.residencyIntentions?.destinationCountry as any)?.region ?? formData.destination?.region ?? "";

  // Handle section persistence on mount
  useEffect(() => {
    const savedSection = localStorage.getItem('migration-current-section')
    if (savedSection !== null) {
      const sectionNum = parseInt(savedSection, 10)
      if (sectionNum >= 0 && sectionNum < SECTIONS.length) {
        setCurrentSection(sectionNum)
      }
    }
  }, [setCurrentSection])

  // Save current section to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('migration-current-section', currentSection.toString())
  }, [currentSection])

  // Auto-complete education when no visa is needed
  useEffect(() => {
    const destCountry = getFormData("residencyIntentions.destinationCountry.country")
    const userNationalities = getFormData("personalInformation.nationalities") || []
    const partnerNationalities = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") || []
    const hasPartner = getFormData("personalInformation.relocationPartner") || false
    
    if (destCountry && isSectionComplete("personal") && isSectionComplete("residency")) {
      // Check if user needs visa
      const isUserCitizen = Array.isArray(userNationalities) && userNationalities.some((n: any) => n?.country === destCountry)
      const userCanMoveEU = destCountry && Array.isArray(userNationalities) ? userNationalities.some((n: any) => {
        // Simple EU check - would need to import canMoveWithinEU for full check
        const euCountries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"]
        return euCountries.includes(n?.country) && euCountries.includes(destCountry)
      }) : false
      const userNeedsVisa = !(isUserCitizen || userCanMoveEU)
      
      // Check if partner needs visa
      const isPartnerCitizen = hasPartner && Array.isArray(partnerNationalities) && partnerNationalities.some((n: any) => n?.country === destCountry)
      const partnerCanMoveEU = hasPartner && destCountry && Array.isArray(partnerNationalities) ? partnerNationalities.some((n: any) => {
        const euCountries = ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"]
        return euCountries.includes(n?.country) && euCountries.includes(destCountry)
      }) : false
      const partnerNeedsVisa = hasPartner && !(isPartnerCitizen || partnerCanMoveEU)
      
      // If neither user nor partner need visa, auto-complete education
      if (!userNeedsVisa && !partnerNeedsVisa) {
        if (!isSectionComplete("education")) {
          markSectionComplete("education")
          updateFormData("education.autoSkipped", true)
        }
      } else {
        // If someone needs visa, unmark education if it was auto-skipped
        if (getFormData("education.autoSkipped")) {
          updateFormData("completedSections.education", false)
          updateFormData("education.autoSkipped", false)
        }
      }
    }
  }, [getFormData("residencyIntentions.destinationCountry.country"), getFormData("personalInformation.nationalities"), getFormData("personalInformation.relocationPartnerInfo.partnerNationalities"), getFormData("personalInformation.relocationPartner")])

  // Listen for formData changes from custom events
  useEffect(() => {
    const handleFormDataChange = (event: CustomEvent) => {
      // Event listener for form data changes
    }
    
    const handleFinanceSkipEvent = (event: CustomEvent) => {
      const { checked } = event.detail
      handleFinanceSkipToggle(checked)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("formDataChange", handleFormDataChange as EventListener)
      window.addEventListener("financeSkipToggle", handleFinanceSkipEvent as EventListener)
      return () => {
        window.removeEventListener("formDataChange", handleFormDataChange as EventListener)
        window.removeEventListener("financeSkipToggle", handleFinanceSkipEvent as EventListener)
      }
    }
  }, [])

  // Called when user clicks "Continue" button within a section component
  const handleContinue = () => {
    markSectionComplete(SECTIONS[currentSection].id)
    
    // Check if we should skip finance sections
    const skipDetails = getFormData("finance.skipDetails") ?? false
    const currentSectionId = SECTIONS[currentSection].id
    const isFinanceSection = ["finance", "social-security", "tax-deductions", "future-plans"].includes(currentSectionId)
    
    if (skipDetails && isFinanceSection) {
      // Skip to Additional Information (index 9)
      const additionalInfoIndex = SECTIONS.findIndex(s => s.id === "additional")
      if (additionalInfoIndex !== -1) {
        setCurrentSection(additionalInfoIndex)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }
    
    // Normal progression
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
      // Scroll to top of the page when navigating to next section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigation functions removed - users now navigate only through section Submit buttons

  // canProceed function removed - no longer needed without navigation buttons

  // FIXED: Progress based on actual completion, not navigation position
  // Only count the 10 data entry sections (exclude Summary & Results)
  const dataEntrySections = SECTIONS.filter(section => section.id !== "summary")
  const completedDataSections = dataEntrySections.filter(section => isSectionComplete(section.id))
  const progress = (completedDataSections.length / 10) * 100; // Fixed denominator to 10

  const renderSection = () => {
    const section = SECTIONS[currentSection];
    
    // Gate all sections beyond disclaimer and destination until both are complete
    const disclaimerComplete = isSectionMarkedComplete("disclaimer");
    const destinationComplete = destCountry && destCountry.trim() !== "";
    
    if (
      !["disclaimer", "destination", "summary", "results"].includes(section.id) &&
      (!disclaimerComplete || !destinationComplete)
    ) {
      const missingSteps = [];
      if (!disclaimerComplete) missingSteps.push("Disclaimer");
      if (!destinationComplete) missingSteps.push("Destination Candidate");
      
      return (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Please complete the {missingSteps.join(" and ")} section{missingSteps.length > 1 ? "s" : ""} first.
        </div>
      );
    }

    switch (section.id) {
      case "disclaimer":
        return <Disclaimer onComplete={handleContinue} />;
      case "destination":
        return <Destination onComplete={handleContinue} debugMode={debugMode} />;
      case "personal":
        return <PersonalInformation onComplete={handleContinue} />;
      case "residency":
        return <ResidencyIntentions onComplete={handleContinue} debugMode={debugMode} />;
      case "education":
        return <Education onComplete={handleContinue} debugMode={debugMode} />;
      case "finance":
        return <Finance onComplete={handleContinue} />;
      case "social-security":
        return <SocialSecurityPensions onComplete={handleContinue} />;
      case "tax-deductions":
        return <TaxDeductionsAndCredits onComplete={handleContinue} />;
      case "future-plans":
        return <FutureFinancialPlans onComplete={handleContinue} />;
      case "additional":
        return <AdditionalInformation onComplete={handleContinue} />;
      case "summary":
        return (
          <div className="space-y-8">
            <Summary debugMode={debugMode} />
            <Results debugMode={debugMode} />
          </div>
        );
      default:
        return <div>Section not found</div>;
    }
  };

  // Current stepʼs icon component
  const HeaderIcon = SECTIONS[currentSection].icon

  return (
    <div className="min-h-screen bg-background text-foreground">
        {/* Debug Toggle (Development Only) */}
        {isDev && (
          <div className="fixed top-4 left-4 z-50">
            <Card className="shadow-lg border-amber-200 bg-amber-50/90 dark:bg-amber-950/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-600" />
                    <Label htmlFor="debug-mode" className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Debug
                    </Label>
                    <Switch
                      id="debug-mode"
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                    {debugMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDebugCollapsed(!debugCollapsed)}
                        className="p-1 h-6 w-6"
                      >
                        {debugCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>
                  {debugMode && !debugCollapsed && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 pt-1 border-t border-amber-200 dark:border-amber-800 space-y-2 max-w-xs">
                      <div>Finance Skip: <span className="font-medium">{skipFinanceDetails ? "ON" : "OFF"}</span></div>
                      
                      <div className="space-y-0.5">
                        <div className="font-medium">Section Completion:</div>
                        <div>• Finance: {isSectionComplete("finance") ? "✅" : "❌"}</div>
                        <div>• Social Security: {isSectionComplete("social-security") ? "✅" : "❌"}</div>
                        <div>• Tax Deductions: {isSectionComplete("tax-deductions") ? "✅" : "❌"}</div>
                        <div>• Future Plans: {isSectionComplete("future-plans") ? "✅" : "❌"}</div>
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="font-medium">Raw completedSections:</div>
                        <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded text-xs font-mono max-h-20 overflow-y-auto">
                          {JSON.stringify(getFormData("completedSections"), null, 1)}
                        </div>
                      </div>
                      
                      <div className="space-y-0.5">
                        <div className="font-medium">Skip State:</div>
                        <div>• autoCompleted: {JSON.stringify(getFormData("finance.autoCompletedSections"))}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center relative">
          <Image
            src="/images/wordmark.png"
            alt="Mr Pro Bonobo's Ape Escape Consultancy"
            width={300}
            height={90}
            priority
            className="mx-auto mb-4"
          />
          {/* Visually hidden heading for accessibility */}
          <h1 className="sr-only">Mr Pro Bonobo's Ape Escape Consultancy</h1>
          <p className="text-lg text-muted-foreground">
            Mr. Pro Bonobo's Ape Escape Consultancy Migration Questionnaire
          </p>
          
          {/* Auto-save indicator and reset button */}
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <span className="text-xs text-muted-foreground opacity-50" title="Your progress is automatically saved to browser storage">
              💾 Persistent storage active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to reset all form data? This cannot be undone.")) {
                  // Reset the form data
                  resetFormData()
                  setCurrentSection(0)
                  
                  // Clear all persistent storage
                  localStorage.removeItem('migration-current-section')
                  localStorage.removeItem('base-recommender-form-data')
                  
                  // Force a page reload to ensure clean state
                  window.location.reload()
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100 transition-opacity"
              title="Reset all form data"
            >
              🗑️ Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block w-80">
            {/* Selected Destination Card - Show only when destination is completed */}
            {destCountry && destCountry.trim() !== "" && isSectionComplete("destination") ? (
              <div className="mb-4">
                <SelectedDestinationCard 
                  country={destCountry} 
                  region={destRegion || "No specific region"} 
                  compact={true}
                />
              </div>
            ) : null}
            
            <nav className="space-y-1 sticky top-24">
              {SECTIONS.map((section, index) => {
                // Insert Finance Skip Toggle between Education (index 4) and Income and Assets (index 5)
                const showFinanceToggle = index === 5 // Before Income and Assets section
                
                const Icon = section.icon
                const isCompleted = isSectionComplete(section.id)
                const isMarkedComplete = isSectionMarkedComplete(section.id)
                const isCurrent = index === currentSection
                
                // Sequential progression: check if all previous sections are completed
                let canAccess = true
                if (index > 0) {
                  // Check if all previous sections are completed
                  for (let i = 0; i < index; i++) {
                    const prevSection = SECTIONS[i]
                    if (prevSection.required && !isSectionMarkedComplete(prevSection.id)) {
                      // For destination, also check if country is selected
                      if (prevSection.id === "destination" && (!destCountry || destCountry.trim() === "")) {
                        canAccess = false
                        break
                      } else if (prevSection.id !== "destination") {
                        canAccess = false
                        break
                      }
                    }
                  }
                }
                const disabled = !canAccess
                
                return (
                  <div key={section.id}>
                    {showFinanceToggle && (
                      <Card className="mb-3 border-emerald-200/60 bg-stone-50/50 dark:bg-stone-950/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-stone-100 dark:bg-stone-900/50">
                                <Zap className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <Label htmlFor="finance-skip-main" className="text-sm font-medium text-stone-800 dark:text-stone-200 cursor-pointer">
                                  Finance Skip
                                </Label>
                                <p className="text-xs text-stone-700 dark:text-stone-300">
                                  Skip detailed finance sections
                                </p>
                              </div>
                            </div>
                            <Switch
                              id="finance-skip-main"
                              checked={skipFinanceDetails}
                              onCheckedChange={handleFinanceSkipToggle}
                            />
                          </div>
                          
                          <div className="border-t border-emerald-200/40 pt-2">
                            <details className="group">
                              <summary className="text-base font-semibold text-stone-900 dark:text-white cursor-pointer">
                                💡 Why would I want to do this?
                              </summary>
                              <p className="text-base text-stone-800 dark:text-stone-200 mt-2 leading-relaxed">
                                You may not care about detailed taxation and finance tracking—you simply want to know if there are any financial requirements (income thresholds, bank balances, etc.) needed to be allowed into your destination country.
                              </p>
                            </details>
                          </div>
                          
                          {skipFinanceDetails && (
                            <div className="mt-2 p-1.5 rounded bg-emerald-100 dark:bg-emerald-900/30">
                              <p className="text-xs text-emerald-900 dark:text-emerald-100">
                                ✅ Finance sections auto-completed
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    
                    <button
                      key={`${section.id}-button`}
                      title={disabled ? "Complete previous sections first" : undefined}
                      className={`flex items-center w-full px-4 py-3 rounded-md text-sm transition-colors relative ${
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                          ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800"
                          : "hover:bg-muted"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (!disabled) {
                          setCurrentSection(index)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                    >
                      <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isCurrent ? "text-white" : ""}`} />
                      <span className="flex-1 text-left">
                        {section.title}
                      </span>
                      
                      {/* Enhanced completion indicators */}
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        {isCompleted && <Check className="w-4 h-4 text-green-600" />}
                        {isMarkedComplete && !isCompleted && <Check className="w-4 h-4 text-yellow-500" />}
                        {section.showDot && !isCompleted && (
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-80 shadow-sm" title="Section to complete" />
                        )}
                      </div>
                    </button>
                  </div>
                )
              })}
            </nav>
            

          </aside>

          {/* Main column */}
          <main className="flex-1">
            {/* Selected Destination Card - Mobile only */}
            {destCountry && destRegion && destCountry.trim() !== "" && destRegion.trim() !== "" && isSectionComplete('destination') && (
              <div className="mb-6 lg:hidden flex justify-center">
                <SelectedDestinationCard 
                  country={destCountry} 
                  region={destRegion} 
                  compact={true}
                />
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress: {Math.round(progress)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Step {Math.min(currentSection + 1, 10)} of 10
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Section Navigation (chips) - Mobile only */}
            <div className="mb-8 lg:hidden">
              <div className="flex flex-wrap gap-3 justify-center px-4">
                {SECTIONS.map((section, index) => {
                  const Icon = section.icon
                  const isCompleted = isSectionMarkedComplete(section.id)
                  const isCurrent = index === currentSection
                  
                  // Sequential progression: check if all previous sections are completed
                  let canAccess = true
                  if (index > 0) {
                    // Check if all previous sections are completed
                    for (let i = 0; i < index; i++) {
                      const prevSection = SECTIONS[i]
                      if (prevSection.required && !isSectionMarkedComplete(prevSection.id)) {
                        // For destination, also check if country is selected
                        if (prevSection.id === "destination" && (!destCountry || destCountry.trim() === "")) {
                          canAccess = false
                          break
                        } else if (prevSection.id !== "destination") {
                          canAccess = false
                          break
                        }
                      }
                    }
                  }
                  return (
                    <Badge
                      key={section.id}
                      title={!canAccess ? "Complete previous sections first" : undefined}
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                      className={`transition-all relative px-3 py-2 ${isCurrent ? "ring-2 ring-primary" : ""} ${!canAccess ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => {
                        if (canAccess) {
                          setCurrentSection(index)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                      }}
                    >
                      <Icon className={`w-4 h-4 mr-2 flex-shrink-0 ${isCurrent ? "text-white" : ""}`} />
                      <span className="truncate max-w-[120px]">{section.title}</span>
                      {isCompleted && <Check className="w-4 h-4 ml-2 text-green-600 flex-shrink-0" />}
                      {section.showDot && !isCompleted && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full opacity-80 shadow-sm" />
                      )}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                {/* Removed top-left CardHeader (icon + description) to avoid duplication with section headers */}
                <CardContent className="pt-8">
                  {renderSection()}
                </CardContent>
              </Card>

              {/* Navigation Buttons - Completely removed */}
              {/* Users now navigate only through section-specific Submit buttons */}
            </div>

          </main>
        </div>

        {/* Dev JSON viewer (Debug Mode Only) */}
        {debugMode && <DevStateViewer />}

        {/* Alternative Interests Modal */}
        <AlternativeInterestsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          destinationCountry={modalDestCountry}
          onContinueToSummary={handleContinueToSummary}
          onMistake={handleMistake}
        />
      </div>
    </div>
  );
} 