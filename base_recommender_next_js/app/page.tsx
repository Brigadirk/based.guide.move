"use client";

import { useState, useEffect } from "react";
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
  Check
} from "lucide-react";
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
import { Summary } from "@/components/features/summary";
import { useFormStore } from "@/lib/stores";
import { DevStateViewer } from "@/components/dev/state-viewer";
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
  { id: "destination", title: "Desired Destination", icon: Globe, required: true, showDot: true },
  { id: "personal", title: "Personal Information", icon: User, required: true, showDot: true },
  { id: "education", title: "Education", icon: BookOpen, required: false, showDot: true },
  { id: "residency", title: "Residency Intentions", icon: Plane, required: true, showDot: true },
  { id: "finance", title: "Income and Assets", icon: Banknote, required: true, showDot: true },
  { id: "social-security", title: "Social Security and Pensions", icon: Briefcase, required: false, showDot: true },
  { id: "tax-deductions", title: "Tax Deductions and Credits", icon: Calculator, required: false, showDot: true },
  { id: "future-plans", title: "Future Financial Plans", icon: TrendingUp, required: false, showDot: true },
  { id: "additional", title: "Additional Information", icon: Info, required: false, showDot: true },
  { id: "summary", title: "Summary", icon: CheckCircle, required: false, showDot: false }, // No red dot for summary
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const { isSectionComplete, hasRequiredData, markSectionComplete, isSectionMarkedComplete, formData, updateFormData } = useFormStore();
  const destCountry = formData.destination?.country ?? "";
  const destRegion = formData.destination?.region ?? "";

  // Listen for formData changes from custom events
  useEffect(() => {
    const handleFormDataChange = (event: CustomEvent) => {
      // Event listener for form data changes
    }

    if (typeof window !== "undefined") {
      window.addEventListener("formDataChange", handleFormDataChange as EventListener)
      return () => window.removeEventListener("formDataChange", handleFormDataChange as EventListener)
    }
  }, [])

  // Called when user clicks "Continue" button within a section component
  const handleContinue = () => {
    markSectionComplete(SECTIONS[currentSection].id)
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  // Called when user clicks navigation "Next" button (should NOT mark complete)
  const handleNavigateNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const canProceed = () => {
    const currentSectionData = SECTIONS[currentSection];
    if (!currentSectionData.required) return true;
    // Use hasRequiredData for navigation (not isSectionComplete which is for manual completion)
    return hasRequiredData(currentSectionData.id);
  };

  // FIXED: Progress based on actual completion, not navigation position
  const completedSections = SECTIONS.filter(section => isSectionComplete(section.id))
  const progress = (completedSections.length / SECTIONS.length) * 100;

  const renderSection = () => {
    const section = SECTIONS[currentSection];
    
    // Gate all sections beyond destination until destination has required data
    if (
      !["disclaimer", "destination", "summary"].includes(section.id) &&
      !hasRequiredData("destination")
    ) {
      return (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Please complete the &quot;Desired Destination&quot; section first.
        </div>
      );
    }

    switch (section.id) {
      case "disclaimer":
        return <Disclaimer onComplete={handleContinue} />;
      case "destination":
        return <Destination onComplete={handleContinue} />;
      case "personal":
        return <PersonalInformation onComplete={handleContinue} />;
      case "education":
        return <Education onComplete={handleContinue} />;
      case "residency":
        return <ResidencyIntentions onComplete={handleContinue} />;
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
        return <Summary />;
      default:
        return <div>Section not found</div>;
    }
  };

  // Current stepʼs icon component
  const HeaderIcon = SECTIONS[currentSection].icon

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
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
            Migration Questionnaire
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 mb-6 lg:mb-0">
            {/* Selected Destination Card - Only show after section completion */}
            {destCountry && destRegion && destCountry.trim() !== "" && destRegion.trim() !== "" && isSectionComplete('destination') ? (
              <div className="mb-4">
                <SelectedDestinationCard 
                  country={destCountry} 
                  region={destRegion} 
                  compact={true}
                />
              </div>
            ) : null}
            <nav className="space-y-1 lg:sticky lg:top-24 flex lg:block overflow-x-auto lg:overflow-visible">
              {SECTIONS.map((section, index) => {
                const Icon = section.icon
                const isCompleted = isSectionComplete(section.id)
                const isMarkedComplete = isSectionMarkedComplete(section.id)
                const disabled = index > 1 && !hasRequiredData("destination")
                const isCurrent = index === currentSection
                return (
                  <button
                    key={section.id}
                    title={disabled ? "Please enter your destination first" : undefined}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors relative ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800"
                        : "hover:bg-muted"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !disabled && setCurrentSection(index)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left truncate">
                      {section.title}
                    </span>
                    
                    {/* Enhanced completion indicators */}
                    <div className="flex items-center gap-1">
                      {isCompleted && <Check className="w-4 h-4 text-green-600" />}
                      {isMarkedComplete && !isCompleted && <Check className="w-4 h-4 text-yellow-500" />}
                      {section.showDot && !isCompleted && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full opacity-80 shadow-sm" title="Section to complete" />
                      )}
                    </div>


                  </button>
                )
              })}
            </nav>
            

          </aside>

          {/* Main column */}
          <main className="flex-1">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress: {Math.round(progress)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  Step {currentSection + 1} of {SECTIONS.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Section Navigation (chips) */}
            <div className="mb-8 lg:hidden">
              <div className="flex flex-wrap gap-2 justify-center">
                {SECTIONS.map((section, index) => {
                  const Icon = section.icon
                  const isCompleted = isSectionMarkedComplete(section.id)
                  const disabled = index > 1 && !hasRequiredData("destination")
                  const isCurrent = index === currentSection
                  return (
                    <Badge
                      key={section.id}
                      title={disabled ? "Please enter your destination first" : undefined}
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                      className={`transition-all relative ${isCurrent ? "ring-2 ring-primary" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      onClick={() => !disabled && setCurrentSection(index)}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {section.title}
                      {isCompleted && <Check className="w-4 h-4 ml-1 text-accent-positive" />}
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeaderIcon className="w-6 h-6" />
                    {SECTIONS[currentSection].title}
                  </CardTitle>
                  <CardDescription>
                    {currentSection === 0 && "Please read and accept the disclaimer to continue"}
                    {currentSection === 1 && "Select your desired destination country and region"}
                    {currentSection === 2 && "Tell us about yourself and your family"}
                    {currentSection === 3 && "Share your educational background and skills"}
                    {currentSection === 4 && "Describe your residency intentions and timeline"}
                    {currentSection === 5 && "Provide details about your income and assets"}
                    {currentSection === 6 && "Information about your social security and pension plans"}
                    {currentSection === 7 && "Potential tax deductions and credits you may qualify for"}
                    {currentSection === 8 && "Your future financial plans and investments"}
                    {currentSection === 9 && "Any additional information or special circumstances"}
                    {currentSection === 10 && "Review and download your completed questionnaire"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderSection()}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              {currentSection < SECTIONS.length - 1 && (
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentSection === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNavigateNext}
                    disabled={!canProceed()}
                  >
                    {currentSection === SECTIONS.length - 2 ? "Finish" : "Next"}
                  </Button>
                </div>
              )}
            </div>

          </main>
        </div>

        {/* Dev JSON viewer */}
        <DevStateViewer />
      </div>
    </div>
  );
} 