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
import { PageHeading } from "@/components/ui/page-heading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"

import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { useCurrencies } from "@/lib/hooks/use-currencies"
import { getCountries } from "@/lib/utils/country-utils"

const PENSION_TYPES = [
  "Employer-sponsored plan",
  "Individual retirement account",
  "Government pension",
  "Industry-wide plan",
  "Cross-border pension",
  "Other"
]

export function SocialSecurityPensions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  
  // Check if finance details are skipped
  const skipDetails = getFormData("finance.skipDetails") ?? false

  const handleComplete = () => {
    markSectionComplete("socialSecurityAndPensions")
    onComplete()
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Social Security & Pensions"
        description="Your pension and social security profile for international tax compliance and retirement planning"
        icon={<Shield className="w-7 h-7 text-green-600" />}
      />

      {/* Skip Mode Indicator */}
      {skipDetails && (
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Social Security & Pensions Details Skipped
            </CardTitle>
            <p className="text-sm text-muted-foreground">Focus on basic requirements only</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-green-800 dark:text-green-200">
                ✅ Social security and pension details skipped. We'll focus only on basic transfer requirements and eligibility.
              </p>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Toggle Finance Skip in the sidebar to enable detailed inputs
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!skipDetails && (
        <>
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

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Detailed social security and pension forms would appear here when not skipped.
              </p>
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
              nextSectionName={skipDetails ? "Additional Information" : "Tax Deductions & Credits"}
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
