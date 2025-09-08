"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, BookOpen, CheckCircle, Info } from "lucide-react"
import { PageHeading } from "@/components/ui/page-heading"
import { SectionHint } from "@/components/ui/section-hint"
import { SectionFooter } from "@/components/ui/section-footer"

import { ValidationAlert } from "@/components/ui/validation-alert"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useFormStore } from "@/lib/stores"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { useEducationState } from "./hooks/use-education-state"
import { useTabStates } from "./hooks/use-tab-states"
import { hasEUCitizenship, isEUCountry, canMoveWithinEU } from "@/lib/utils/eu-utils"
import { DegreesSection } from "./academic/degrees-section"
import { SkillsSection } from "./academic/skills-section"
import { WorkExperienceSection } from "./academic/work-experience-section"
import { ProfessionalLicensesSection } from "./academic/professional-licenses-section"
import { MilitaryServiceSection } from "./academic/military-service-section"
import { StudyPlansSection } from "./future-plans/study-plans-section"
import { SchoolOffersSection } from "./future-plans/school-offers-section"
import { LearningGoalsSection } from "./future-plans/learning-goals-section"
import { OtherLanguagesSection } from "./language/other-languages-section"
import { LanguageProficiencyFull } from "./language/language-proficiency-full"
import type { EducationProps } from "./types"

export function Education({ onComplete }: EducationProps) {
  const { markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  
  // Use our custom hooks for state management
  const educationState = useEducationState()
  const tabStates = useTabStates()

  // Get user and family citizenship information
  const destCountry = educationState.getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const userNationalities = educationState.getFormData("personalInformation.nationalities") ?? []
  const partnerInfo = educationState.getFormData("personalInformation.relocationPartnerInfo")
  const dependentsInfo = educationState.getFormData("personalInformation.relocationDependents") ?? []
  
  // Check citizenship and EU status
  const isAlreadyCitizen = userNationalities.some((nat: any) => nat.country === destCountry)
  const userHasEUCitizenship = hasEUCitizenship(userNationalities)
  const canUserMoveWithinEU = destCountry && canMoveWithinEU(userNationalities, destCountry)
  const isDestinationEU = destCountry && isEUCountry(destCountry)
  
  // Check if partner needs visa
  const partnerNeedsVisa = (() => {
    if (!partnerInfo || !educationState.hasPartnerSelected) return false
    const partnerNationalities = partnerInfo.nationalities ?? []
    const partnerIsAlreadyCitizen = partnerNationalities.some((nat: any) => nat.country === destCountry)
    const partnerCanMoveWithinEU = destCountry && canMoveWithinEU(partnerNationalities, destCountry)
    return !partnerIsAlreadyCitizen && !partnerCanMoveWithinEU
  })()
  
  // Check if any dependents need visa
  const dependentsNeedVisa = dependentsInfo.some((dep: any) => {
    const depNationalities = dep.nationalities ?? []
    const depIsAlreadyCitizen = depNationalities.some((nat: any) => nat.country === destCountry)
    const depCanMoveWithinEU = destCountry && canMoveWithinEU(depNationalities, destCountry)
    return !depIsAlreadyCitizen && !depCanMoveWithinEU
  })
  
  // Determine education section behavior
  const userNeedsVisa = !isAlreadyCitizen && !canUserMoveWithinEU
  const anyFamilyNeedsVisa = partnerNeedsVisa || dependentsNeedVisa
  const shouldAutoComplete = !userNeedsVisa && !anyFamilyNeedsVisa && !educationState.hasPartnerSelected
  const shouldShowAdvisory = !userNeedsVisa && anyFamilyNeedsVisa

  // Auto-mark section as complete when auto-completed
  useEffect(() => {
    if (shouldAutoComplete) {
      markSectionComplete("education")
    }
  }, [shouldAutoComplete, markSectionComplete])

  const handleComplete = () => {
    markSectionComplete("education")
    onComplete()
  }

  // Check language proficiency requirement
  const languageData = educationState.getFormData("residencyIntentions.languageProficiency") ?? {}
  const individualProficiency = languageData.individual || {}
  const hasLanguageProficiency = Object.keys(individualProficiency).length > 0

  // Validation - relax requirements for auto-completed sections
  const errors: string[] = []
  if (!hasLanguageProficiency && !shouldAutoComplete) {
    errors.push("Language proficiency for destination country languages is required")
  }
  
  const canContinue = errors.length === 0 || shouldAutoComplete

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Education & Skills"
        description="Your educational background and professional skills for visa applications and career opportunities"
        icon={<GraduationCap className="w-7 h-7 text-green-600" />}
      />

      {/* Visa Requirement Summary (read-only) */}
      {destCountry && (
        (() => {
          const isUserCitizen = Array.isArray(userNationalities) && destCountry ? userNationalities.some((n: any) => n?.country === destCountry) : false
          const userCanMoveEU = destCountry ? canMoveWithinEU(userNationalities, destCountry) : false
          const eduUserNeedsVisa = !(isUserCitizen || userCanMoveEU)

          const partnerNats = partnerInfo?.nationalities ?? []
          const eduPartnerNeedsVisa = partnerInfo
            ? !(
                partnerNats.some((n: any) => n?.country === destCountry) ||
                canMoveWithinEU(partnerNats, destCountry)
              )
            : false

          const depStatuses = dependentsInfo.map((dep: any) => {
            const depNats = dep?.nationalities ?? []
            const depCitizen = depNats.some((n: any) => n?.country === destCountry)
            const depMoveEU = canMoveWithinEU(depNats, destCountry)
            return { needsVisa: !(depCitizen || depMoveEU) }
          })

          return (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">Visa Requirement Summary</CardTitle>
                <p className="text-sm text-muted-foreground">Based on citizenship and EU freedom of movement</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between max-w-md">
                    <span className="font-medium">You</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${eduUserNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {eduUserNeedsVisa ? 'Needs visa' : 'No visa needed'}
                    </span>
                  </div>
                  {partnerInfo && (
                    <div className="flex items-center justify-between max-w-md">
                      <span className="font-medium">Partner</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${eduPartnerNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {eduPartnerNeedsVisa ? 'Needs visa' : 'No visa needed'}
                      </span>
                    </div>
                  )}
                  {depStatuses.length > 0 && (
                    <div className="space-y-2">
                      {depStatuses.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between max-w-md">
                          <span className="font-medium">Dependent {i + 1}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.needsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {d.needsVisa ? 'Needs visa' : 'No visa needed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })()
      )}

      <SectionHint title="About this section">
        Educational qualifications and professional skills are crucial for visa applications, especially for skilled worker visas and professional registration in your destination country.
      </SectionHint>

      {/* Auto-completion message for EU citizens without visa requirements */}
      {shouldAutoComplete && (
        <Alert className="border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/50">
          <CheckCircle className="h-4 w-4 text-stone-600 dark:text-stone-400" />
          <AlertDescription className="text-stone-700 dark:text-stone-300">
            <strong>Education section auto-completed:</strong> You do not need a visa to move to {destCountry} as an EU citizen, so detailed educational documentation is not required for immigration purposes. You can still add information if desired for professional registration or other purposes.
          </AlertDescription>
        </Alert>
      )}

      {/* Advisory message for mixed EU/non-EU partnerships */}
      {shouldShowAdvisory && (
        <Alert className="border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900/50">
          <Info className="h-4 w-4 text-stone-600 dark:text-stone-400" />
          <AlertDescription className="text-stone-700 dark:text-stone-300">
            <strong>Recommendation:</strong> While you don't need a visa as an EU citizen, it's advisable to enter education information for both partners. This can increase your chances of successfully relocating together, as your partner {partnerNeedsVisa ? 'requires' : 'may benefit from'} visa documentation{dependentsNeedVisa ? ' and some dependents may need visa support' : ''}.
          </AlertDescription>
        </Alert>
      )}

      {/* Language Proficiency Card */}
      <LanguageProficiencyFull />

      {/* Other Languages Card */}
      <Card className="shadow-sm border-l-4 border-l-indigo-500">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Additional Language Skills
          </CardTitle>
          <p className="text-sm text-muted-foreground">Other languages you and your partner speak beyond the destination country languages</p>
        </CardHeader>
        <CardContent className="pt-6">
          <OtherLanguagesSection
            otherLanguagesTab={tabStates.otherLanguagesTab}
            setOtherLanguagesTab={tabStates.setOtherLanguagesTab}
            hasPartnerSelected={educationState.hasPartnerSelected}
            getFormData={educationState.getFormData}
            updateFormData={educationState.updateFormData}
          />
        </CardContent>
      </Card>

      {/* Academic & Professional Background Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            Academic & Professional Background
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your education, work experience, skills, credentials, and military service</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            
            {/* Degrees Section */}
            <DegreesSection
              degreesTab={tabStates.degreesTab}
              setDegreesTab={tabStates.setDegreesTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              degrees={educationState.degrees}
              setDegrees={educationState.setDegrees}
              partnerDegrees={educationState.partnerDegrees}
              setPartnerDegrees={educationState.setPartnerDegrees}
            />

            <Separator />

            {/* Skills & Credentials Section */}
            <SkillsSection
              skillsTab={tabStates.skillsTab}
              setSkillsTab={tabStates.setSkillsTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              skills={educationState.skills}
              setSkills={educationState.setSkills}
              partnerSkills={educationState.partnerSkills}
              setPartnerSkills={educationState.setPartnerSkills}
            />

            <Separator />

            {/* Work Experience Section */}
            <WorkExperienceSection
              workExpTab={tabStates.workExpTab}
              setWorkExpTab={tabStates.setWorkExpTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              workExperience={educationState.workExperience}
              setWorkExperience={educationState.setWorkExperience}
              partnerWorkExperience={educationState.partnerWorkExperience}
              setPartnerWorkExperience={educationState.setPartnerWorkExperience}
            />

            <Separator />

            {/* Professional Licenses Section */}
            <ProfessionalLicensesSection
              licensesTab={tabStates.licensesTab}
              setLicensesTab={tabStates.setLicensesTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              professionalLicenses={educationState.professionalLicenses}
              setProfessionalLicenses={educationState.setProfessionalLicenses}
              partnerProfessionalLicenses={educationState.partnerProfessionalLicenses}
              setPartnerProfessionalLicenses={educationState.setPartnerProfessionalLicenses}
            />

            <Separator />

            {/* Military Service Section */}
            <MilitaryServiceSection
              militaryTab={tabStates.militaryTab}
              setMilitaryTab={tabStates.setMilitaryTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              getFormData={educationState.getFormData}
              updateFormData={educationState.updateFormData}
            />
          </div>
        </CardContent>
      </Card>

      {/* Future Education Plans Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-green-600" />
            Future Education Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">Study plans, school offers, learning goals, and development interests in {educationState.countryPhrase}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            
            {/* Study Plans Section */}
            <StudyPlansSection
              studyPlansTab={tabStates.studyPlansTab}
              setStudyPlansTab={tabStates.setStudyPlansTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              countryPhrase={educationState.countryPhrase}
              getFormData={educationState.getFormData}
              updateFormData={educationState.updateFormData}
            />

            <Separator />

            {/* School Offers Section */}
            <SchoolOffersSection
              schoolOffersTab={tabStates.schoolOffersTab}
              setSchoolOffersTab={tabStates.setSchoolOffersTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              schoolOffers={educationState.schoolOffers}
              setSchoolOffers={educationState.setSchoolOffers}
              partnerSchoolOffers={educationState.getFormData("education.partner.schoolOffers") ?? []}
              setPartnerSchoolOffers={(offers) => educationState.updateFormData("education.partner.schoolOffers", offers)}
            />

            <Separator />

            {/* Learning Goals Section */}
            <LearningGoalsSection
              learningGoalsTab={tabStates.learningGoalsTab}
              setLearningGoalsTab={tabStates.setLearningGoalsTab}
              hasPartnerSelected={educationState.hasPartnerSelected}
              learningInterests={educationState.learningInterests}
              setLearningInterests={educationState.setLearningInterests}
              partnerLearningInterests={educationState.getFormData("education.partner.learningInterests") ?? []}
              setPartnerLearningInterests={(interests) => educationState.updateFormData("education.partner.learningInterests", interests)}
            />


          </div>
        </CardContent>
      </Card>

      {/* Validation Alert */}
      <ValidationAlert 
        errors={errors} 
        isComplete={canContinue}
      />

      <SectionFooter
        sectionId="education"
        canContinue={canContinue}
        onContinue={handleComplete}
        nextSectionName="Income and Assets"
        onCheckInfo={async () => {
          showSectionInfo('education')
        }}
        isCheckingInfo={isCheckingInfo}
      />


      
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
