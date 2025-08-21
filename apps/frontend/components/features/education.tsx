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

  const skills: Skill[] = getFormData("education.visaSkills") ?? []
  const setSkills = (next: Skill[]) => updateFormData("education.visaSkills", next)

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
  const errors = []
  if (!hasLanguageProficiency) errors.push("Language proficiency for destination country languages is required")
  
  const canContinue = errors.length === 0

  const canAddDegree = degreeDraft.degree && degreeDraft.institution && degreeDraft.start_date && (degreeDraft.in_progress || degreeDraft.end_date)
  const canAddSkill = skillDraft.skill.trim().length > 0
  const canAddInterest = interestDraft.skill.trim() !== "" && interestDraft.institute.trim() !== "" && interestDraft.months > 0 && interestDraft.hoursPerWeek > 0 && interestDraft.fundingStatus !== ""
  const canAddOffer = offerDraft.school.trim() !== "" && offerDraft.program.trim() !== "" && offerDraft.startDate.trim() !== "" && offerDraft.fundingStatus !== ""

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GraduationCap className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Education & Skills</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
            {/* Existing degrees */}
            {degrees.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your Degrees</h4>
                <div className="grid gap-4">
                  {degrees.map((degree, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary">{degree.degree || "Not specified"}</Badge>
                            {degree.in_progress && <Badge variant="outline">In Progress</Badge>}
                          </div>
                          <p className="font-medium">{degree.institution || "Institution not specified"}</p>
                          <p className="text-sm text-muted-foreground">
                            {degree.field || "Field not specified"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {degree.start_date ? new Date(degree.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'} - {degree.in_progress ? "Present" : (degree.end_date ? new Date(degree.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "End date not specified")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDegrees(degrees.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add degree form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Degree</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree name *</Label>
                  <Input
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    value={degreeDraft.degree}
                    onChange={(e) => setDegreeDraft({...degreeDraft, degree: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Institution *</Label>
                  <Input
                    placeholder="e.g., University of Technology"
                    value={degreeDraft.institution}
                    onChange={(e) => setDegreeDraft({...degreeDraft, institution: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start date *</Label>
                  <Input
                    type="date"
                    value={degreeDraft.start_date}
                    onChange={(e) => setDegreeDraft({...degreeDraft, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date {!degreeDraft.in_progress && "*"}</Label>
                  <Input
                    type="date"
                    disabled={degreeDraft.in_progress}
                    value={degreeDraft.end_date}
                    onChange={(e) => setDegreeDraft({...degreeDraft, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in_progress"
                  checked={degreeDraft.in_progress}
                  onCheckedChange={(v) => setDegreeDraft({...degreeDraft, in_progress: !!v, end_date: v ? "" : degreeDraft.end_date})}
                />
                <Label htmlFor="in_progress">Currently in progress</Label>
              </div>
              <Button
                disabled={!canAddDegree}
                                  onClick={() => {
                    setDegrees([...degrees, degreeDraft])
                    setDegreeDraft({degree: "", institution: "", field: "", start_date: "", end_date: "", in_progress: false})
                  }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Degree
              </Button>
            </div>

            <Separator />

            {/* Professional Skills & Credentials Section */}
          <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Professional Skills & Credentials</h3>
              </div>
              
            {/* Existing skills */}
            {skills.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-base">Your Skills & Credentials</h4>
                <div className="grid gap-3">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="p-3 border rounded-lg bg-card flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill.skill}</span>
                        {skill.credentialName && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {skill.credentialName} {skill.credentialInstitute && `• ${skill.credentialInstitute}`}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add skill form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Skill or Credential</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Skill or profession *</Label>
                  <Input
                    placeholder="e.g., Software Development, Nursing, Accounting..."
                    value={skillDraft.skill}
                    onChange={(e) => setSkillDraft({...skillDraft, skill: e.target.value})}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credential name</Label>
                    <Input
                      placeholder="e.g., CPA, RN License, AWS Certification..."
                      value={skillDraft.credentialName}
                      onChange={(e) => setSkillDraft({...skillDraft, credentialName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing organization</Label>
                    <Input
                      placeholder="e.g., AICPA, State Board, Amazon..."
                      value={skillDraft.credentialInstitute}
                      onChange={(e) => setSkillDraft({...skillDraft, credentialInstitute: e.target.value})}
                    />
                  </div>
                </div>
                <Button
                  disabled={!canAddSkill}
                  onClick={() => {
                    setSkills([...skills, skillDraft])
                    setSkillDraft({skill: "", credentialName: "", credentialInstitute: ""})
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </div>

              <Separator />

              {/* Work Experience Section */}
          <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Work Experience</h3>
            </div>

            {/* Existing work experience */}
            {(() => {
              const workExp = getFormData("education.workExperience") ?? []
              return workExp.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Your Work Experience</h4>
                  <div className="grid gap-4">
                    {workExp.map((job: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-medium">{job.jobTitle}</h5>
                              {job.current && <Badge variant="outline">Current</Badge>}
                            </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {job.company} • {job.country}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'} - {job.current ? "Present" : (job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "End date not specified")}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = workExp.filter((_: any, i: number) => i !== idx)
                              updateFormData("education.workExperience", updated)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Add work experience form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Work Experience</h4>
              <div className="space-y-4">
                                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Job title *</Label>
                     <Input
                       placeholder="e.g., Software Engineer"
                       value={workExpDraft.jobTitle}
                       onChange={(e) => setWorkExpDraft({...workExpDraft, jobTitle: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Company *</Label>
                     <Input
                          placeholder="e.g., Tech Corp"
                       value={workExpDraft.company}
                       onChange={(e) => setWorkExpDraft({...workExpDraft, company: e.target.value})}
                     />
                   </div>
                 </div>
                 <div className="grid md:grid-cols-3 gap-4">
                   <div className="space-y-2">
                     <Label>Country *</Label>
                     <Input
                       placeholder="e.g., United States"
                       value={workExpDraft.country}
                       onChange={(e) => setWorkExpDraft({...workExpDraft, country: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                        <Label>Start date *</Label>
                     <Input
                          type="date"
                          value={workExpDraft.startDate}
                          onChange={(e) => setWorkExpDraft({...workExpDraft, startDate: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                        <Label>End date {!workExpDraft.current && "*"}</Label>
                     <Input
                          type="date"
                       disabled={workExpDraft.current}
                          value={workExpDraft.endDate}
                          onChange={(e) => setWorkExpDraft({...workExpDraft, endDate: e.target.value})}
                     />
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Checkbox 
                     id="current_job" 
                     checked={workExpDraft.current}
                        onCheckedChange={(v) => setWorkExpDraft({...workExpDraft, current: !!v, endDate: v ? "" : workExpDraft.endDate})}
                   />
                   <Label htmlFor="current_job">This is my current job</Label>
                 </div>
                 <Button
                      disabled={!workExpDraft.jobTitle || !workExpDraft.company || !workExpDraft.country || !workExpDraft.startDate || (!workExpDraft.current && !workExpDraft.endDate)}
                   onClick={() => {
                     const currentExp = getFormData("education.workExperience") ?? []
                     updateFormData("education.workExperience", [...currentExp, workExpDraft])
                        setWorkExpDraft({jobTitle: "", company: "", country: "", startDate: "", endDate: "", current: false})
                   }}
                   className="w-full"
                 >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Experience
                </Button>
              </div>
            </div>
          </div>

              <Separator />

              {/* Professional Licenses Section */}
          <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Professional Licenses</h3>
                </div>
                
                {/* Existing professional licenses */}
            {(() => {
              const licenses = getFormData("education.professionalLicenses") ?? []
              return licenses.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Your Professional Licenses</h4>
                  <div className="grid gap-4">
                    {licenses.map((license: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-medium">{license.licenseName}</h5>
                                  <Badge variant={license.active ? "default" : "secondary"}>
                                    {license.active ? "Active" : "Inactive"}
                                  </Badge>
                            </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {license.licenseType} • {license.issuingBody}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                  {license.country}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = licenses.filter((_: any, i: number) => i !== idx)
                              updateFormData("education.professionalLicenses", updated)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Add professional license form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <h4 className="font-medium text-base">Add Professional License</h4>
              <div className="space-y-4">
                                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>License type *</Label>
                        <Input
                          placeholder="e.g., Medical License, Bar Admission"
                       value={licenseDraft.licenseType}
                          onChange={(e) => setLicenseDraft({...licenseDraft, licenseType: e.target.value})}
                        />
                   </div>
                   <div className="space-y-2">
                     <Label>License name *</Label>
                     <Input
                          placeholder="e.g., Medical Doctor License"
                       value={licenseDraft.licenseName}
                       onChange={(e) => setLicenseDraft({...licenseDraft, licenseName: e.target.value})}
                     />
                   </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Issuing body *</Label>
                     <Input
                       placeholder="e.g., State Medical Board"
                       value={licenseDraft.issuingBody}
                       onChange={(e) => setLicenseDraft({...licenseDraft, issuingBody: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Country *</Label>
                     <Input
                       placeholder="e.g., United States"
                       value={licenseDraft.country}
                       onChange={(e) => setLicenseDraft({...licenseDraft, country: e.target.value})}
                     />
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Checkbox 
                     id="license_active"
                     checked={licenseDraft.active}
                     onCheckedChange={(v) => setLicenseDraft({...licenseDraft, active: !!v})}
                   />
                   <Label htmlFor="license_active">License is currently active</Label>
                 </div>
                 <Button
                   disabled={!licenseDraft.licenseType || !licenseDraft.licenseName || !licenseDraft.issuingBody || !licenseDraft.country}
                   onClick={() => {
                     const currentLicenses = getFormData("education.professionalLicenses") ?? []
                     updateFormData("education.professionalLicenses", [...currentLicenses, licenseDraft])
                     setLicenseDraft({licenseType: "", licenseName: "", issuingBody: "", country: "", active: false})
                   }}
                   className="w-full"
                 >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Professional License
                </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Military Service Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Military Service</h3>
                </div>
                
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="has_military"
                    checked={getFormData("education.militaryService.hasService") ?? false}
                    onCheckedChange={(v) => updateFormData("education.militaryService.hasService", !!v)}
                  />
                  <Label htmlFor="has_military" className="text-base font-medium">
                    I have served in the military
                  </Label>
                </div>

                {getFormData("education.militaryService.hasService") && (
                  <div className="space-y-4 p-4 border rounded-lg bg-card">
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        Military experience, skills, and security clearances can strengthen visa applications
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country of service</Label>
                        <Input
                          placeholder="e.g., United States"
                          value={getFormData("education.militaryService.country") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.country", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Branch of service</Label>
                        <Input
                          placeholder="e.g., Army, Navy, Air Force"
                          value={getFormData("education.militaryService.branch") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.branch", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <Input
                          type="date"
                          value={getFormData("education.militaryService.startDate") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.startDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End date</Label>
                        <Input
                          type="date"
                          value={getFormData("education.militaryService.endDate") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.endDate", e.target.value)}
                          disabled={getFormData("education.militaryService.currentlyServing") ?? false}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="currently_serving"
                        checked={getFormData("education.militaryService.currentlyServing") ?? false}
                        onCheckedChange={(v) => updateFormData("education.militaryService.currentlyServing", !!v)}
                      />
                      <Label htmlFor="currently_serving">Currently serving</Label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rank achieved</Label>
                        <Input
                          placeholder="e.g., Sergeant, Lieutenant"
                          value={getFormData("education.militaryService.rank") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.rank", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Military occupation/specialization</Label>
                        <Input
                          placeholder="e.g., Intelligence Analyst, Combat Engineer"
                          value={getFormData("education.militaryService.occupation") ?? ""}
                          onChange={(e) => updateFormData("education.militaryService.occupation", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Security clearance level</Label>
                      <Select
                        value={getFormData("education.militaryService.securityClearance") ?? ""}
                        onValueChange={(v) => updateFormData("education.militaryService.securityClearance", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select clearance level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Confidential">Confidential</SelectItem>
                          <SelectItem value="Secret">Secret</SelectItem>
                          <SelectItem value="Top Secret">Top Secret</SelectItem>
                          <SelectItem value="SCI">Sensitive Compartmented Information (SCI)</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Languages used in service</Label>
                      <Textarea
                        placeholder="Languages you learned or used during military service..."
                        value={getFormData("education.militaryService.languages") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.languages", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Military certifications and training</Label>
                      <Textarea
                        placeholder="Special training, certifications, or skills acquired during service..."
                        value={getFormData("education.militaryService.certifications") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.certifications", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Leadership experience</Label>
                      <Textarea
                        placeholder="Leadership roles, team management, or command experience..."
                        value={getFormData("education.militaryService.leadership") ?? ""}
                        onChange={(e) => updateFormData("education.militaryService.leadership", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
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

            <Separator />

            {/* School Offers Section */}
          <div className="space-y-6">
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">School Offers & Applications</h3>
              </div>
              
              {/* Existing school offers */}
              {schoolOffers.length > 0 && (
              <div className="space-y-4">
                  <h4 className="font-medium text-base">Your School Offers</h4>
                <div className="grid gap-4">
                    {schoolOffers.map((offer, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h5 className="font-medium mb-1">{offer.program}</h5>
                          <p className="text-sm text-muted-foreground mb-1">
                              {offer.school}
                          </p>
                          <p className="text-sm text-muted-foreground">
                              {offer.startDate ? new Date(offer.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'} • {offer.fundingStatus}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                            onClick={() => setSchoolOffers(schoolOffers.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Add school offer form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-base">Add School Offer</h4>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>School/University *</Label>
                    <Input
                        placeholder="e.g., University of Toronto"
                        value={offerDraft.school}
                        onChange={(e) => setOfferDraft({...offerDraft, school: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label>Program/Course *</Label>
                  <Input
                        placeholder="e.g., Master of Computer Science"
                        value={offerDraft.program}
                        onChange={(e) => setOfferDraft({...offerDraft, program: e.target.value})}
                  />
                </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Start date *</Label>
                    <Input
                        type="date"
                        value={offerDraft.startDate}
                        onChange={(e) => setOfferDraft({...offerDraft, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label>Funding status *</Label>
                    <Select
                        value={offerDraft.fundingStatus}
                        onValueChange={(v) => setOfferDraft({...offerDraft, fundingStatus: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Self-funded">Self-funded</SelectItem>
                        <SelectItem value="Scholarship">Scholarship</SelectItem>
                          <SelectItem value="Teaching assistantship">Teaching assistantship</SelectItem>
                          <SelectItem value="Research assistantship">Research assistantship</SelectItem>
                          <SelectItem value="Government funding">Government funding</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                    disabled={!canAddOffer}
                  onClick={() => {
                      setSchoolOffers([...schoolOffers, offerDraft])
                      setOfferDraft({school: "", program: "", startDate: "", fundingStatus: ""})
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                    Add School Offer
                </Button>
              </div>
            </div>
          </div>

            <Separator />

            {/* Learning & Development Goals Section */}
          <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Learning & Development Goals</h3>
              </div>
              
              {/* Existing learning interests */}
              {learningInterests.length > 0 && (
              <div className="space-y-4">
                  <h4 className="font-medium text-base">Your Learning Goals</h4>
                <div className="grid gap-4">
                    {learningInterests.map((interest, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-medium">{interest.skill}</h5>
                              <Badge variant={interest.status === "planned" ? "default" : "secondary"}>
                                {interest.status === "planned" ? "Planned" : "Open to it"}
                              </Badge>
                            </div>
                          <p className="text-sm text-muted-foreground mb-1">
                              {interest.institute}
                          </p>
                          <p className="text-sm text-muted-foreground">
                              {interest.months} months • {interest.hoursPerWeek} hrs/week • {interest.fundingStatus}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                            onClick={() => setLearningInterests(learningInterests.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Add learning interest form */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-base">Add Learning Goal</h4>
              <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill or subject *</Label>
                    <Input
                      placeholder="e.g., Spanish Language, Digital Marketing, Data Science..."
                      value={interestDraft.skill}
                      onChange={(e) => setInterestDraft({...interestDraft, skill: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Commitment level *</Label>
                    <Select
                      value={interestDraft.status}
                      onValueChange={(v) => setInterestDraft({...interestDraft, status: v as "planned" | "open"})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">I have concrete plans to learn this</SelectItem>
                        <SelectItem value="open">I'm open to learning this</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Preferred institution/method</Label>
                    <Input
                        placeholder="e.g., Local university, online course, self-study..."
                        value={interestDraft.institute}
                        onChange={(e) => setInterestDraft({...interestDraft, institute: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label>Expected duration (months)</Label>
                    <Input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="12"
                        value={interestDraft.months}
                        onChange={(e) => setInterestDraft({...interestDraft, months: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Hours per week</Label>
                    <Input
                        type="number"
                        min="1"
                        max="40"
                        placeholder="10"
                        value={interestDraft.hoursPerWeek}
                        onChange={(e) => setInterestDraft({...interestDraft, hoursPerWeek: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                      <Label>Funding approach</Label>
                    <Select
                        value={interestDraft.fundingStatus}
                        onValueChange={(v) => setInterestDraft({...interestDraft, fundingStatus: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Self-funded">Self-funded</SelectItem>
                          <SelectItem value="Employer-sponsored">Employer-sponsored</SelectItem>
                          <SelectItem value="Scholarship/Grant">Scholarship/Grant</SelectItem>
                          <SelectItem value="Government program">Government program</SelectItem>
                          <SelectItem value="Free/Open source">Free/Open source</SelectItem>
                          <SelectItem value="To be determined">To be determined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                    disabled={!canAddInterest}
                  onClick={() => {
                      setLearningInterests([...learningInterests, interestDraft])
                      setInterestDraft({skill: "", status: "planned", institute: "", months: 0, hoursPerWeek: 0, fundingStatus: ""})
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                    Add Learning Goal
                </Button>
                </div>
              </div>
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
        onCheckInfo={() => showSectionInfo('education')}
        isCheckingInfo={isCheckingInfo}
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
          <div className="space-y-4">
            <h4 className="font-medium text-base">📊 Your Language Skills</h4>
            {languages.map((lang: string) => {
              const currentLevel = Number(individualProficiency[lang] || 0)
              const willingToLearnThis = willingToLearn.includes(lang)
              
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
                  
                  {/* Credential verification option */}
                  {currentLevel > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        id={`individual-credentials-${lang}`}
                        checked={languageData.individual_credentials?.[lang] || false}
                        onCheckedChange={(checked) => {
                          const currentCredentials = languageData.individual_credentials || {}
                          const updated = {
                            ...currentCredentials,
                            [lang]: !!checked
                          }
                          updateFormData("residencyIntentions.languageProficiency.individual_credentials", updated)
                        }}
                      />
                      <Label htmlFor={`individual-credentials-${lang}`} className="text-sm">
                        I have formal credentials to prove this proficiency level
                      </Label>
                    </div>
                  )}

                  {/* Willing to learn checkbox */}
                  {currentLevel < 3 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Checkbox
                        id={`learn-${lang}`}
                        checked={willingToLearnThis}
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

                  {/* Teaching capability for intermediate+ speakers */}
                  {currentLevel >= 3 && (
                    <div className="space-y-2 mt-3">
                      <Label className="text-sm font-medium">Can you teach {lang}?</Label>
                      <div className="flex gap-4">
                        {["No/not interested", "Informally", "Formally with credentials"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`teach-${lang}-${option}`}
                              name={`teach-${lang}`}
                              value={option}
                              checked={canTeach[lang] === option}
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

                    {/* Partner credential verification option */}
                    {currentLevel > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Checkbox
                          id={`partner-credentials-${lang}`}
                          checked={languageData.partner_credentials?.[lang] || false}
                          onCheckedChange={(checked) => {
                            const currentCredentials = languageData.partner_credentials || {}
                            const updated = {
                              ...currentCredentials,
                              [lang]: !!checked
                            }
                            updateFormData("residencyIntentions.languageProficiency.partner_credentials", updated)
                          }}
                        />
                        <Label htmlFor={`partner-credentials-${lang}`} className="text-sm">
                          Partner has formal credentials to prove this proficiency level
                        </Label>
                      </div>
                    )}

                    {/* Partner willing to learn checkbox */}
                    {currentLevel < 3 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Checkbox
                          id={`partner-learn-${lang}`}
                          checked={languageData.partner_willing_to_learn?.includes(lang) || false}
                          onCheckedChange={(checked) => {
                            const currentWilling = languageData.partner_willing_to_learn || []
                            const updated = checked 
                              ? [...currentWilling, lang]
                              : currentWilling.filter((l: string) => l !== lang)
                            updateFormData("residencyIntentions.languageProficiency.partner_willing_to_learn", updated)
                          }}
                        />
                        <Label htmlFor={`partner-learn-${lang}`} className="text-sm">
                          Partner is willing to learn {lang}
                        </Label>
                      </div>
                    )}

                    {/* Partner teaching capability for intermediate+ speakers */}
                    {currentLevel >= 3 && (
                      <div className="space-y-2 mt-3">
                        <Label className="text-sm font-medium">Can your partner teach {lang}?</Label>
                        <div className="flex gap-4">
                          {["No/not interested", "Informally", "Formally with credentials"].map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={`partner-teach-${lang}-${option}`}
                                name={`partner-teach-${lang}`}
                                value={option}
                                checked={languageData.partner_can_teach?.[lang] === option}
                                onChange={() => {
                                  const currentCanTeach = languageData.partner_can_teach || {}
                                  const updated = {
                                    ...currentCanTeach,
                                    [lang]: option
                                  }
                                  updateFormData("residencyIntentions.languageProficiency.partner_can_teach", updated)
                                }}
                              />
                              <label htmlFor={`partner-teach-${lang}-${option}`} className="text-sm cursor-pointer">{option}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                      const currentLevel = Number((dependentsProficiency[i] && dependentsProficiency[i][lang]) || 0)
                      
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
                  </CardContent>
      </Card>
              ))}
            </div>
          )}

          {/* Other Languages You Speak */}
          <div className="space-y-6 border-t pt-6">
            <div className="space-y-2">
              <h4 className="font-medium text-base">🔤 Other languages you speak</h4>
              <p className="text-sm text-muted-foreground">Add any other languages you know that aren't listed above</p>
            </div>
          
            {/* Add new language input */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-sm">Language name</Label>
                <Input
                  value={newTeachingLang.language}
                  onChange={(e) => setNewTeachingLang({...newTeachingLang, language: e.target.value})}
                  placeholder="e.g., French, German, Mandarin..."
                />
              </div>
              <Button
                onClick={() => {
                  if (newTeachingLang.language && !otherLanguages[newTeachingLang.language]) {
                    // Initialize with default values
                    const updatedOtherLanguages = {
                      ...otherLanguages,
                      [newTeachingLang.language]: {
                        proficiency: 3, // Default to B1 Intermediate - A1 is minimum, B1 is reasonable default
                        canTeach: "No/not interested",
                        hasCredentials: false
                      }
                    }
                    updateFormData("residencyIntentions.languageProficiency.other_languages", updatedOtherLanguages)
                    setNewTeachingLang({language: '', capability: 'Informally'})
                  }
                }}
                disabled={!newTeachingLang.language || !!otherLanguages[newTeachingLang.language]}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Language
              </Button>
            </div>

            {/* Display added languages with full controls */}
            {Object.keys(otherLanguages).length > 0 && (
              <div className="space-y-4">
                <h5 className="font-medium">Your additional languages:</h5>
                {Object.entries(otherLanguages).map(([lang, langData]: [string, any]) => {
                  // Handle both old format (string) and new format (object)
                  // For additional languages, minimum is A1 (1), not None (0)
                  const proficiency = typeof langData === 'object' ? Math.max(langData.proficiency || 1, 1) : 1
                  const canTeach = typeof langData === 'object' ? (langData.canTeach || "No/not interested") : langData
                  const hasCredentials = typeof langData === 'object' ? (langData.hasCredentials || false) : false
                  
                  return (
                    <div key={lang} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex justify-between items-center flex-1">
                          <Label className="text-base font-medium">Your proficiency in {lang}</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{proficiencyLabels[proficiency]}</Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updated = {...otherLanguages}
                                delete updated[lang]
                                updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Slider
                        value={[proficiency]}
                        onValueChange={(value) => {
                          const updated = {
                            ...otherLanguages,
                            [lang]: {
                              ...langData,
                              proficiency: value[0]
                            }
                          }
                          updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                        }}
                        max={7}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>A1</span>
                        <span>A2</span>
                        <span>B1</span>
                        <span>B2</span>
                        <span>C1</span>
                        <span>C2</span>
                        <span>Native</span>
                      </div>

                      {/* Credential verification option */}
                      {proficiency >= 1 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Checkbox
                            id={`credentials-${lang}`}
                            checked={hasCredentials}
                            onCheckedChange={(checked) => {
                              const updated = {
                                ...otherLanguages,
                                [lang]: {
                                  ...langData,
                                  hasCredentials: !!checked
                                }
                              }
                              updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                            }}
                          />
                          <Label htmlFor={`credentials-${lang}`} className="text-sm">
                            I have formal credentials to prove this proficiency level
                          </Label>
                        </div>
                      )}
                      
                      {/* Teaching capability for intermediate+ speakers */}
                      {proficiency >= 3 && (
                        <div className="space-y-2 mt-3">
                          <Label className="text-sm font-medium">Can you teach {lang}?</Label>
                          <div className="flex gap-4">
                            {["No/not interested", "Informally", "Formally with credentials"].map((option) => (
                              <div key={option} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`teach-other-${lang}-${option}`}
                                  name={`teach-other-${lang}`}
                                  value={option}
                                  checked={canTeach === option}
                                  onChange={() => {
                                    const updated = {
                                      ...otherLanguages,
                                      [lang]: {
                                        ...langData,
                                        canTeach: option
                                      }
                                    }
                                    updateFormData("residencyIntentions.languageProficiency.other_languages", updated)
                                  }}
                                />
                                <label htmlFor={`teach-other-${lang}-${option}`} className="text-sm cursor-pointer">{option}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 