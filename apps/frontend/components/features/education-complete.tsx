"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

type LanguageEntry = {
  language: string
  proficiency: number
  hasCredentials: boolean
  willingToLearn: boolean
  canTeach: string
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

  // Language draft state
  const [languageDraft, setLanguageDraft] = useState<LanguageEntry>({
    language: "", proficiency: 0, hasCredentials: false, willingToLearn: false, canTeach: "No/not interested"
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

  const languages: LanguageEntry[] = getFormData("education.languages") ?? []
  const setLanguages = (next: LanguageEntry[]) => updateFormData("education.languages", next)
  const partnerLanguages: LanguageEntry[] = getFormData("education.partner.languages") ?? []
  const setPartnerLanguages = (next: LanguageEntry[]) => updateFormData("education.partner.languages", next)

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
  const hasLanguageProficiency = Object.keys(individualProficiency).length > 0 || languages.length > 0

  // Validation
  const errors: string[] = []
  if (!hasLanguageProficiency) errors.push("Language proficiency for destination country languages is required")
  
  const canContinue = errors.length === 0

  const canAddDegree = degreeDraft.degree && degreeDraft.institution && degreeDraft.start_date && (degreeDraft.in_progress || degreeDraft.end_date)
  const canAddSkill = skillDraft.skill.trim().length > 0
  const canAddLanguage = languageDraft.language.trim().length > 0
  const canAddInterest = interestDraft.skill.trim() !== "" && interestDraft.institute.trim() !== "" && interestDraft.months > 0 && interestDraft.hoursPerWeek > 0 && interestDraft.fundingStatus !== ""
  const canAddOffer = offerDraft.school.trim() !== "" && offerDraft.program.trim() !== "" && offerDraft.startDate.trim() !== "" && offerDraft.fundingStatus !== ""
  
  // Whether a partner was selected in Personal section
  const hasPartnerSelected = getFormData("personalInformation.relocationPartner") ?? false

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

  // Beautiful Tab Component
  const BeautifulTabs = ({ children, defaultValue = "you" }: { children: React.ReactNode, defaultValue?: string }) => (
    <Tabs defaultValue={defaultValue} className="w-full">
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
      {children}
    </Tabs>
  )

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

      {/* Language Skills Card */}
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
            {/* Language Section with Individual Tabs */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Languages</h3>
              </div>
              
              {hasPartnerSelected ? (
                <BeautifulTabs>
                  <TabsContent value="you" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                    {/* Your Languages */}
                    {languages.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Your Languages</h4>
                        <div className="grid gap-4">
                          {languages.map((lang, idx) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary">{lang.language}</Badge>
                                    <Badge variant="outline">{proficiencyLabels[lang.proficiency]}</Badge>
                                  </div>
                                  {lang.hasCredentials && <p className="text-sm text-muted-foreground">Has formal credentials</p>}
                                  {lang.willingToLearn && <p className="text-sm text-muted-foreground">Willing to learn</p>}
                                  {lang.canTeach !== "No/not interested" && <p className="text-sm text-muted-foreground">Can teach: {lang.canTeach}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Language Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Language</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Language *</Label>
                          <Input
                            placeholder="e.g., Spanish, French, German..."
                            value={languageDraft.language}
                            onChange={(e) => setLanguageDraft({...languageDraft, language: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Proficiency Level</Label>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Proficiency</span>
                            <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
                          </div>
                          <Slider
                            value={[languageDraft.proficiency]}
                            onValueChange={(value) => setLanguageDraft({...languageDraft, proficiency: value[0]})}
                            max={7}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>None</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span><span>Native</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="has_credentials"
                              checked={languageDraft.hasCredentials}
                              onCheckedChange={(v) => setLanguageDraft({...languageDraft, hasCredentials: !!v})}
                            />
                            <Label htmlFor="has_credentials" className="text-sm">I have formal credentials</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="willing_to_learn"
                              checked={languageDraft.willingToLearn}
                              onCheckedChange={(v) => setLanguageDraft({...languageDraft, willingToLearn: !!v})}
                            />
                            <Label htmlFor="willing_to_learn" className="text-sm">Willing to learn more</Label>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Can you teach this language?</Label>
                            <Select value={languageDraft.canTeach} onValueChange={(v) => setLanguageDraft({...languageDraft, canTeach: v})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="No/not interested">No/not interested</SelectItem>
                                <SelectItem value="Informally">Informally</SelectItem>
                                <SelectItem value="Formally with credentials">Formally with credentials</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          disabled={!canAddLanguage}
                          onClick={() => {
                            setLanguages([...languages, languageDraft])
                            setLanguageDraft({language: "", proficiency: 0, hasCredentials: false, willingToLearn: false, canTeach: "No/not interested"})
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Language
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="partner" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                    {/* Partner Languages */}
                    {partnerLanguages.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Partner Languages</h4>
                        <div className="grid gap-4">
                          {partnerLanguages.map((lang, idx) => (
                            <div key={idx} className="p-4 border rounded-lg bg-card">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary">{lang.language}</Badge>
                                    <Badge variant="outline">{proficiencyLabels[lang.proficiency]}</Badge>
                                  </div>
                                  {lang.hasCredentials && <p className="text-sm text-muted-foreground">Has formal credentials</p>}
                                  {lang.willingToLearn && <p className="text-sm text-muted-foreground">Willing to learn</p>}
                                  {lang.canTeach !== "No/not interested" && <p className="text-sm text-muted-foreground">Can teach: {lang.canTeach}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setPartnerLanguages(partnerLanguages.filter((_, i) => i !== idx))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Partner Language Form */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Partner Language</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Language *</Label>
                          <Input
                            placeholder="e.g., Spanish, French, German..."
                            value={languageDraft.language}
                            onChange={(e) => setLanguageDraft({...languageDraft, language: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Proficiency Level</Label>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Proficiency</span>
                            <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
                          </div>
                          <Slider
                            value={[languageDraft.proficiency]}
                            onValueChange={(value) => setLanguageDraft({...languageDraft, proficiency: value[0]})}
                            max={7}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>None</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span><span>Native</span>
                          </div>
                        </div>
                        <Button
                          disabled={!canAddLanguage}
                          onClick={() => {
                            setPartnerLanguages([...partnerLanguages, languageDraft])
                            setLanguageDraft({language: "", proficiency: 0, hasCredentials: false, willingToLearn: false, canTeach: "No/not interested"})
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Partner Language
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </BeautifulTabs>
              ) : (
                <div className="space-y-6">
                  {/* Your Languages */}
                  {languages.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-base">Your Languages</h4>
                      <div className="grid gap-4">
                        {languages.map((lang, idx) => (
                          <div key={idx} className="p-4 border rounded-lg bg-card">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="secondary">{lang.language}</Badge>
                                  <Badge variant="outline">{proficiencyLabels[lang.proficiency]}</Badge>
                                </div>
                                {lang.hasCredentials && <p className="text-sm text-muted-foreground">Has formal credentials</p>}
                                {lang.willingToLearn && <p className="text-sm text-muted-foreground">Willing to learn</p>}
                                {lang.canTeach !== "No/not interested" && <p className="text-sm text-muted-foreground">Can teach: {lang.canTeach}</p>}
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Language Form */}
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <h4 className="font-medium text-base">Add Language</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Language *</Label>
                        <Input
                          placeholder="e.g., Spanish, French, German..."
                          value={languageDraft.language}
                          onChange={(e) => setLanguageDraft({...languageDraft, language: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Proficiency Level</Label>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Proficiency</span>
                          <Badge variant="secondary">{proficiencyLabels[languageDraft.proficiency]}</Badge>
                        </div>
                        <Slider
                          value={[languageDraft.proficiency]}
                          onValueChange={(value) => setLanguageDraft({...languageDraft, proficiency: value[0]})}
                          max={7}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>None</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span><span>Native</span>
                        </div>
                      </div>
                      <Button
                        disabled={!canAddLanguage}
                        onClick={() => {
                          setLanguages([...languages, languageDraft])
                          setLanguageDraft({language: "", proficiency: 0, hasCredentials: false, willingToLearn: false, canTeach: "No/not interested"})
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Language
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
          <div className="space-y-8">
            {/* Degrees Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Degrees</h3>
              </div>
              
              {hasPartnerSelected ? (
                <BeautifulTabs>
