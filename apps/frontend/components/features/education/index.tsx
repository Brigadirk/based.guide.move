"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, BookOpen } from "lucide-react"
import { SectionHint } from "@/components/ui/section-hint"
import { SectionFooter } from "@/components/ui/section-footer"
import { ValidationAlert } from "@/components/ui/validation-alert"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { useFormStore } from "@/lib/stores"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { useEducationState } from "./hooks/use-education-state"
import { useTabStates } from "./hooks/use-tab-states"
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

  const handleComplete = () => {
    markSectionComplete("education")
    onComplete()
  }

  // Check language proficiency requirement
  const languageData = educationState.getFormData("residencyIntentions.languageProficiency") ?? {}
  const individualProficiency = languageData.individual || {}
  const hasLanguageProficiency = Object.keys(individualProficiency).length > 0

  // Validation
  const errors: string[] = []
  if (!hasLanguageProficiency) errors.push("Language proficiency for destination country languages is required")
  
  const canContinue = errors.length === 0

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-left pb-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Education & Skills</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your educational background and professional skills for visa applications and career opportunities
        </p>
      </div>

      <SectionHint title="About this section">
        Educational qualifications and professional skills are crucial for visa applications, especially for skilled worker visas and professional registration in your destination country.
      </SectionHint>

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
