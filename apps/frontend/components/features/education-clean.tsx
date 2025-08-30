"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
 
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { ValidationAlert } from "@/components/ui/validation-alert"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { getLanguages } from "@/lib/utils/country-utils"
import { Slider } from "@/components/ui/slider"
import { CountryFlag } from "@/components/features/country/CountryFlag"
import { Plus, Trash2, GraduationCap, BookOpen, Award, Users, Info, Target, Brain, School, Shield, Languages } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

type Degree = {
  degree: string
  institution: string
  field: string
  start_date: string
  end_date: string
  in_progress: boolean
}

type Skill = {
  skill: string
  credentialName?: string
  credentialInstitute?: string
}

type LearningInterest = {
  skill: string
  status: "planned" | "open"
  institute: string
  months: number
  hoursPerWeek: number
  fundingStatus: string
}

type SchoolOffer = {
  school: string
  program: string
  startDate: string
  fundingStatus: string
}

export function Education({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()

  // Work experience state
  const [workExpDraft, setWorkExpDraft] = useState({
    jobTitle: "", company: "", country: "", startDate: "", endDate: "", current: false
  })

  // Professional license state  
  const [licenseDraft, setLicenseDraft] = useState({
    licenseType: "", licenseName: "", issuingBody: "", country: "", active: false
  })

  // Get destination country for context
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const countryPhrase = destCountry || "your destination country"

  const degrees: Degree[] = getFormData("education.previousDegrees") ?? []
  const setDegrees = (next: Degree[]) => updateFormData("education.previousDegrees", next)
  const partnerDegrees: Degree[] = getFormData("education.partner.previousDegrees") ?? []
  const setPartnerDegrees = (next: Degree[]) => updateFormData("education.partner.previousDegrees", next)

  const skills: Skill[] = getFormData("education.visaSkills") ?? []
  const setSkills = (next: Skill[]) => updateFormData("education.visaSkills", next)
  const partnerSkills: Skill[] = getFormData("education.partner.visaSkills") ?? []
  const setPartnerSkills = (next: Skill[]) => updateFormData("education.partner.visaSkills", next)

  const interestedInStudy: boolean = getFormData("education.interestedInStudying") ?? false
  const setInterested = (v: boolean) => updateFormData("education.interestedInStudying", v)

  const studyDetails: string = getFormData("education.schoolInterestDetails") ?? ""
  const setStudyDetails = (txt: string) => updateFormData("education.schoolInterestDetails", txt)

  const learningInterests: LearningInterest[] = getFormData("education.learningInterests") ?? []
  const setLearningInterests = (next: LearningInterest[]) => updateFormData("education.learningInterests", next)

  const schoolOffers: SchoolOffer[] = getFormData("education.schoolOffers") ?? []
  const setSchoolOffers = (next: SchoolOffer[]) => updateFormData("education.schoolOffers", next)

  // Draft states for forms
  const [interestDraft, setInterestDraft] = useState<LearningInterest>({
    skill: "", status: "planned", institute: "", months: 0, hoursPerWeek: 0, fundingStatus: ""
  })

  // Local state for forms
  const [degreeDraft, setDegreeDraft] = useState<Degree>({
    degree: "",
    institution: "",
    field: "",
    start_date: "",
    end_date: "",
    in_progress: false
  })

  const [skillDraft, setSkillDraft] = useState<Skill>({
    skill: "", credentialName: "", credentialInstitute: ""
  })

  const [learningDraft, setLearningDraft] = useState<LearningInterest>({
    skill: "", status: "planned", institute: "", months: 12, hoursPerWeek: 10, fundingStatus: "Self-funded"
  })

  const [offerDraft, setOfferDraft] = useState<SchoolOffer>({
    school: "", program: "", startDate: "", fundingStatus: "Self-funded"
  })

  const handleComplete = () => {
    markSectionComplete("education")
    onComplete()
  }

  // Check language proficiency requirement
  const languageData = getFormData("residencyIntentions.languageProficiency") ?? {}
  const individualProficiency = languageData.individual || {}
  const hasLanguageProficiency = Object.keys(individualProficiency).length > 0

  // Validation
  const errors: string[] = []
  if (!hasLanguageProficiency) errors.push("Language proficiency for destination country languages is required")
  
  const canContinue = errors.length === 0

  const canAddDegree = degreeDraft.degree && degreeDraft.institution && degreeDraft.start_date && (degreeDraft.in_progress || degreeDraft.end_date)
  const canAddSkill = skillDraft.skill.trim().length > 0
  const canAddInterest = interestDraft.skill.trim() !== "" && interestDraft.institute.trim() !== "" && interestDraft.months > 0 && interestDraft.hoursPerWeek > 0 && interestDraft.fundingStatus !== ""
  const canAddOffer = offerDraft.school.trim() !== "" && offerDraft.program.trim() !== "" && offerDraft.startDate.trim() !== "" && offerDraft.fundingStatus !== ""
  
  // Whether a partner was selected in Personal section
  const hasPartnerSelected = getFormData("personalInformation.relocationPartner") ?? false

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
            {hasPartnerSelected ? (
              <Tabs defaultValue="you" className="w-full">
                <TabsList>
                  <TabsTrigger value="you">You</TabsTrigger>
                  <TabsTrigger value="partner">Partner</TabsTrigger>
                </TabsList>
                <TabsContent value="you">
                  <div className="space-y-6">
                    {/* Degrees for You */}
                    {degrees.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Your Degrees</h4>
                        <div className="grid gap-4">
                          {degrees.map((degree, idx) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <Badge variant="secondary">{degree.degree || "Not specified"}</Badge>
                                  <p className="font-medium">{degree.institution || "Institution not specified"}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setDegrees(degrees.filter((_, i) => i !== idx))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Degree Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Degree</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Degree name *" value={degreeDraft.degree} onChange={(e) => setDegreeDraft({...degreeDraft, degree: e.target.value})} />
                        <Input placeholder="Institution *" value={degreeDraft.institution} onChange={(e) => setDegreeDraft({...degreeDraft, institution: e.target.value})} />
                      </div>
                      <Button disabled={!degreeDraft.degree || !degreeDraft.institution} onClick={() => { setDegrees([...degrees, degreeDraft]); setDegreeDraft({degree: "", institution: "", field: "", start_date: "", end_date: "", in_progress: false}) }} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Degree
                      </Button>
                    </div>

                    {/* Skills for You */}
                    {skills.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Your Skills</h4>
                        <div className="grid gap-3">
                          {skills.map((skill, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-card flex items-center justify-between">
                              <span className="font-medium">{skill.skill}</span>
                              <Button variant="ghost" size="sm" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Skill Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Skill</h4>
                      <div className="flex gap-2">
                        <Input placeholder="Add a skill" value={skillDraft.skill} onChange={(e) => setSkillDraft({...skillDraft, skill: e.target.value})} />
                        <Button disabled={!skillDraft.skill} onClick={() => { setSkills([...skills, skillDraft]); setSkillDraft({skill: "", credentialName: "", credentialInstitute: ""}) }}>Add</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="partner">
                  <div className="space-y-6">
                    {/* Partner Degrees */}
                    {partnerDegrees.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Partner Degrees</h4>
                        <div className="grid gap-4">
                          {partnerDegrees.map((degree, idx) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <Badge variant="secondary">{degree.degree || "Not specified"}</Badge>
                                  <p className="font-medium">{degree.institution || "Institution not specified"}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setPartnerDegrees(partnerDegrees.filter((_, i) => i !== idx))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Partner Degree Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Partner Degree</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Degree name *" value={degreeDraft.degree} onChange={(e) => setDegreeDraft({...degreeDraft, degree: e.target.value})} />
                        <Input placeholder="Institution *" value={degreeDraft.institution} onChange={(e) => setDegreeDraft({...degreeDraft, institution: e.target.value})} />
                      </div>
                      <Button disabled={!degreeDraft.degree || !degreeDraft.institution} onClick={() => { setPartnerDegrees([...partnerDegrees, degreeDraft]); setDegreeDraft({degree: "", institution: "", field: "", start_date: "", end_date: "", in_progress: false}) }} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Partner Degree
                      </Button>
                    </div>

                    {/* Partner Skills */}
                    {partnerSkills.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Partner Skills</h4>
                        <div className="grid gap-3">
                          {partnerSkills.map((skill, idx) => (
                            <div key={idx} className="p-3 border rounded-lg bg-card flex items-center justify-between">
                              <span className="font-medium">{skill.skill}</span>
                              <Button variant="ghost" size="sm" onClick={() => setPartnerSkills(partnerSkills.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Partner Skill Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Partner Skill</h4>
                      <div className="flex gap-2">
                        <Input placeholder="Add partner skill" value={skillDraft.skill} onChange={(e) => setSkillDraft({...skillDraft, skill: e.target.value})} />
                        <Button disabled={!skillDraft.skill} onClick={() => { setPartnerSkills([...partnerSkills, skillDraft]); setSkillDraft({skill: "", credentialName: "", credentialInstitute: ""}) }}>Add</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6">
                {/* Degrees without partner */}
                {degrees.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-base">Your Degrees</h4>
                    <div className="grid gap-4">
                      {degrees.map((degree, idx) => (
                        <div key={idx} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Badge variant="secondary">{degree.degree || "Not specified"}</Badge>
                              <p className="font-medium">{degree.institution || "Institution not specified"}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setDegrees(degrees.filter((_, i) => i !== idx))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Degree Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <h4 className="font-medium text-base">Add Degree</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Degree name *" value={degreeDraft.degree} onChange={(e) => setDegreeDraft({...degreeDraft, degree: e.target.value})} />
                    <Input placeholder="Institution *" value={degreeDraft.institution} onChange={(e) => setDegreeDraft({...degreeDraft, institution: e.target.value})} />
                  </div>
                  <Button disabled={!degreeDraft.degree || !degreeDraft.institution} onClick={() => { setDegrees([...degrees, degreeDraft]); setDegreeDraft({degree: "", institution: "", field: "", start_date: "", end_date: "", in_progress: false}) }} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Degree
                  </Button>
                </div>

                {/* Skills without partner */}
                {skills.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-base">Your Skills</h4>
                    <div className="grid gap-3">
                      {skills.map((skill, idx) => (
                        <div key={idx} className="p-3 border rounded-lg bg-card flex items-center justify-between">
                          <span className="font-medium">{skill.skill}</span>
                          <Button variant="ghost" size="sm" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Skill Form */}
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <h4 className="font-medium text-base">Add Skill</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Add a skill" value={skillDraft.skill} onChange={(e) => setSkillDraft({...skillDraft, skill: e.target.value})} />
                    <Button disabled={!skillDraft.skill} onClick={() => { setSkills([...skills, skillDraft]); setSkillDraft({skill: "", credentialName: "", credentialInstitute: ""}) }}>Add</Button>
                  </div>
                </div>
              </div>
            )}
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
          <p className="text-sm text-muted-foreground">Study plans, school offers, learning goals, and development interests in {countryPhrase}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Study Interest Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Study Plans in {countryPhrase}</h3>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                <Checkbox
                  id="interested_study"
                  checked={interestedInStudy}
                  onCheckedChange={(v) => setInterested(!!v)}
                />
                <Label htmlFor="interested_study" className="text-base font-medium">
                  I'm interested in studying in {countryPhrase}
                </Label>
              </div>

              {interestedInStudy && (
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="space-y-2">
                    <Label>Study details</Label>
                    <Textarea
                      placeholder="Describe what you'd like to study, preferred institutions, program types..."
                      value={studyDetails}
                      onChange={(e) => setStudyDetails(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
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
        onContinue={onComplete}
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

function LanguageProficiencyFull() {
  const { getFormData, updateFormData } = useFormStore()
  
  // State for adding new teaching languages
  const [newTeachingLang, setNewTeachingLang] = useState({
    language: '', 
    capability: 'Informally'
  })
  
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const destRegion = getFormData("residencyIntentions.destinationCountry.region") ?? ""
  
  // Family information
  const hasPartner = getFormData("personalInformation.relocationPartner") ?? false
  const numDependents = getFormData("personalInformation.numRelocationDependents") ?? 0
  
  // Get languages for the destination
  const languages = (() => {
    try {
      return getLanguages(destCountry, destRegion)
    } catch {
      return []
    }
  })()
  
  // Get existing language data
  const languageData = getFormData("residencyIntentions.languageProficiency") ?? {}
  const individualProficiency = languageData.individual || {}
  const partnerProficiency = languageData.partner || {}
  const dependentsProficiency = languageData.dependents || []
  const willingToLearn = languageData.willing_to_learn || []
  const canTeach = languageData.can_teach || {}
  const otherLanguages = languageData.other_languages || {}
  
  const proficiencyLabels: {[key: number]: string} = {
    0: "None",
    1: "A1 Basic",
    2: "A2 Elementary", 
    3: "B1 Intermediate",
    4: "B2 Upper Intermediate",
    5: "C1 Advanced",
    6: "C2 Proficient",
    7: "Native Speaker"
  }
  
  if (!destCountry) {
    return (
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Languages className="w-6 h-6 text-amber-600" />
            Language Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please complete the <strong>Destination</strong> section first to see language requirements.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Check if user has basic language proficiency
  const hasBasicLanguageData = Object.keys(individualProficiency).length > 0

  return (
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
          {/* Required notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Language proficiency is required to complete this section.</strong> Please fill in your language skills for at least the destination country languages.
            </AlertDescription>
          </Alert>

          {/* Destination Language Info */}
          {languages.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CountryFlag 
                  countryCode={destCountry} 
                  className="w-8 h-6 rounded border border-gray-200 dark:border-gray-700" 
                />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Languages in {destCountry}</h4>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Dominant language{languages.length > 1 ? 's' : ''} in {destCountry}: <strong>{languages.join(', ')}</strong>
                </p>
                {destRegion && destRegion !== "I don't know yet" && (
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Dominant language{languages.length > 1 ? 's' : ''} for {destRegion} region: <strong>{languages.join(', ')}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Your Language Skills */}
          {hasPartner ? (
            <Tabs defaultValue="you" className="w-full">
              <TabsList>
                <TabsTrigger value="you">You</TabsTrigger>
                <TabsTrigger value="partner">Partner</TabsTrigger>
              </TabsList>
              <TabsContent value="you">
                <div className="space-y-4">
                  <h4 className="font-medium text-base">📊 Your Language Skills</h4>
                  {languages.map((lang: string) => {
                    const currentLevel = Number(individualProficiency[lang] || 0)
                    
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
                          max={7}
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
                          <span>Native</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              <TabsContent value="partner">
                <div className="space-y-4">
                  <h4 className="font-medium text-base">👥 Partner's Language Skills</h4>
                  {languages.map((lang: string) => {
                    const currentLevel = Number(partnerProficiency[lang] || 0)
                    
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
                          max={7}
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
                          <span>Native</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-base">📊 Your Language Skills</h4>
              {languages.map((lang: string) => {
                const currentLevel = Number(individualProficiency[lang] || 0)
                return (
                  <div key={`individual-${lang}`} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium">Your proficiency in {lang}</Label>
                      <Badge variant="secondary">{proficiencyLabels[currentLevel]}</Badge>
                    </div>
                    <Slider value={[currentLevel]} onValueChange={(value) => { updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0]) }} max={7} min={0} step={1} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span><span>Native</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
