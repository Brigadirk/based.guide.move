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
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { Plus, Trash2, GraduationCap, BookOpen, Award, Users, Info, Target, Brain, School, Shield } from "lucide-react"

type Degree = {
  degree: string
  institution: string
  field: string
  start_year: string
  end_year: string
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
  year: string
  fundingStatus: string
}

export function Education({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()

  // Work experience state
  const [workExpDraft, setWorkExpDraft] = useState({
    jobTitle: "", company: "", country: "", startYear: "", endYear: "", current: false
  })

  // Professional license state  
  const [licenseDraft, setLicenseDraft] = useState({
    licenseType: "", licenseName: "", issuingBody: "", country: "", active: false
  })

  // Get destination country for context
  const destCountry = getFormData("destination.country") ?? ""
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

  // Local state for forms
  const [degreeDraft, setDegreeDraft] = useState<Degree>({
    degree: "",
    institution: "",
    field: "",
    start_year: "",
    end_year: "",
    in_progress: false
  })

  const [skillDraft, setSkillDraft] = useState<Skill>({
    skill: "", credentialName: "", credentialInstitute: ""
  })

  const [learningDraft, setLearningDraft] = useState<LearningInterest>({
    skill: "", status: "planned", institute: "", months: 12, hoursPerWeek: 10, fundingStatus: "Self-funded"
  })

  const [offerDraft, setOfferDraft] = useState<SchoolOffer>({
    school: "", program: "", year: "", fundingStatus: "Self-funded"
  })

  const handleComplete = () => {
    markSectionComplete("education")
    onComplete()
  }

  const canContinue = degrees.length > 0 // At least one degree required

  const canAddDegree = degreeDraft.degree && degreeDraft.institution && degreeDraft.start_year && degreeDraft.end_year
  const canAddSkill = skillDraft.skill.trim().length > 0
  const canAddLearning = learningDraft.skill && learningDraft.institute
  const canAddOffer = offerDraft.school && offerDraft.program

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

      {/* Previous Degrees Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-primary" />
            Previous Degrees
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your completed and in-progress formal education</p>
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
                            {degree.start_year} - {degree.in_progress ? "Present" : (degree.end_year || "Not specified")}
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
                  <Label>Start year *</Label>
                  <Input
                    type="number"
                    min="1950"
                    max="2030"
                    placeholder="2020"
                    value={degreeDraft.start_year}
                    onChange={(e) => setDegreeDraft({...degreeDraft, start_year: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End year {!degreeDraft.in_progress && "*"}</Label>
                  <Input
                    type="number"
                    min="1950"
                    max="2030"
                    placeholder="2024"
                    disabled={degreeDraft.in_progress}
                    value={degreeDraft.end_year}
                    onChange={(e) => setDegreeDraft({...degreeDraft, end_year: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in_progress"
                  checked={degreeDraft.in_progress}
                  onCheckedChange={(v) => setDegreeDraft({...degreeDraft, in_progress: !!v, end_year: v ? "" : degreeDraft.end_year})}
                />
                <Label htmlFor="in_progress">Currently in progress</Label>
              </div>
              <Button
                disabled={!canAddDegree}
                                  onClick={() => {
                    setDegrees([...degrees, degreeDraft])
                    setDegreeDraft({degree: "", institution: "", field: "", start_year: "", end_year: "", in_progress: false})
                  }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Degree
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Skills Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Award className="w-6 h-6 text-blue-600" />
            Professional Skills & Credentials
          </CardTitle>
          <p className="text-sm text-muted-foreground">Skills and certifications that may help with visa applications</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
          </div>
        </CardContent>
      </Card>

      {/* Military Service Card */}
      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            Military Service
          </CardTitle>
          <p className="text-sm text-muted-foreground">Military experience, skills, and security clearances for visa applications</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
                  <h4 className="font-medium text-base">Military Service Details</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Military experience can be valuable for skilled worker visas, security clearances, and demonstrating transferable skills to employers.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country of service *</Label>
                    <Input
                      placeholder="e.g., United States"
                      value={getFormData("education.militaryService.country") ?? ""}
                      onChange={(e) => updateFormData("education.militaryService.country", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch/Service *</Label>
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
                      <SelectItem value="Top Secret/SCI">Top Secret/SCI</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Languages learned during service</Label>
                  <Textarea
                    placeholder="List any languages you learned or improved during military service..."
                    value={getFormData("education.militaryService.languages") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.languages", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technical certifications gained</Label>
                  <Textarea
                    placeholder="List technical certifications, training programs, or specialized skills gained..."
                    value={getFormData("education.militaryService.certifications") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.certifications", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Leadership roles held</Label>
                  <Textarea
                    placeholder="Describe leadership positions, team management experience, or command responsibilities..."
                    value={getFormData("education.militaryService.leadership") ?? ""}
                    onChange={(e) => updateFormData("education.militaryService.leadership", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Experience Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            Work Experience
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your employment history for visa purposes</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
                              <Badge variant="secondary">{job.jobTitle || "Not specified"}</Badge>
                              {job.current && <Badge variant="outline">Current</Badge>}
                            </div>
                            <p className="font-medium">{job.company || "Company not specified"}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.startYear} - {job.current ? "Present" : (job.endYear || "Not specified")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {job.country || "Country not specified"}
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
                       placeholder="e.g., Tech Corp Inc"
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
                     <Label>Start year *</Label>
                     <Input
                       type="number"
                       placeholder="2020"
                       value={workExpDraft.startYear}
                       onChange={(e) => setWorkExpDraft({...workExpDraft, startYear: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>End year</Label>
                     <Input
                       type="number"
                       placeholder="2023"
                       value={workExpDraft.endYear}
                       onChange={(e) => setWorkExpDraft({...workExpDraft, endYear: e.target.value})}
                       disabled={workExpDraft.current}
                     />
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <Checkbox 
                     id="current_job" 
                     checked={workExpDraft.current}
                     onCheckedChange={(v) => setWorkExpDraft({...workExpDraft, current: !!v, endYear: !!v ? "" : workExpDraft.endYear})}
                   />
                   <Label htmlFor="current_job">This is my current job</Label>
                 </div>
                 <Button
                   disabled={!workExpDraft.jobTitle || !workExpDraft.company || !workExpDraft.country || !workExpDraft.startYear || (!workExpDraft.current && !workExpDraft.endYear)}
                   onClick={() => {
                     const currentExp = getFormData("education.workExperience") ?? []
                     updateFormData("education.workExperience", [...currentExp, workExpDraft])
                     setWorkExpDraft({jobTitle: "", company: "", country: "", startYear: "", endYear: "", current: false})
                   }}
                   className="w-full"
                 >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Experience
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Licenses Card */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Award className="w-6 h-6 text-purple-600" />
            Professional Licenses
          </CardTitle>
          <p className="text-sm text-muted-foreground">Professional certifications and licenses</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Existing licenses */}
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
                              <Badge variant="secondary">{license.licenseType || "Not specified"}</Badge>
                              {license.active && <Badge variant="outline">Active</Badge>}
                            </div>
                            <p className="font-medium">{license.licenseName || "License not specified"}</p>
                            <p className="text-sm text-muted-foreground">
                              Issued by: {license.issuingBody || "Not specified"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Country: {license.country || "Not specified"}
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
                     <Select
                       value={licenseDraft.licenseType}
                       onValueChange={(v) => setLicenseDraft({...licenseDraft, licenseType: v})}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select license type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Medical">Medical</SelectItem>
                         <SelectItem value="Legal">Legal</SelectItem>
                         <SelectItem value="Engineering">Engineering</SelectItem>
                         <SelectItem value="Teaching">Teaching</SelectItem>
                         <SelectItem value="Financial">Financial</SelectItem>
                         <SelectItem value="Other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>License name *</Label>
                     <Input
                       placeholder="e.g., Registered Nurse, Professional Engineer"
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
        </CardContent>
      </Card>

      {/* Study Interest Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-green-600" />
            Study Plans in {countryPhrase}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Interest in further education or training</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
        </CardContent>
      </Card>

      {/* Learning Interests Card */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            Learning & Development Goals
          </CardTitle>
          <p className="text-sm text-muted-foreground">Skills you'd like to learn or improve</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skill or subject *</Label>
                    <Input
                      placeholder="e.g., Machine Learning, German Language..."
                      value={learningDraft.skill}
                      onChange={(e) => setLearningDraft({...learningDraft, skill: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={learningDraft.status}
                      onValueChange={(v: "planned" | "open") => setLearningDraft({...learningDraft, status: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Definitely planned</SelectItem>
                        <SelectItem value="open">Open to it</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred institution/platform *</Label>
                  <Input
                    placeholder="e.g., Local university, Coursera, Udemy..."
                    value={learningDraft.institute}
                    onChange={(e) => setLearningDraft({...learningDraft, institute: e.target.value})}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (months) *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={learningDraft.months}
                      onChange={(e) => setLearningDraft({...learningDraft, months: parseInt(e.target.value) || 12})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hours per week *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="80"
                      value={learningDraft.hoursPerWeek}
                      onChange={(e) => setLearningDraft({...learningDraft, hoursPerWeek: parseInt(e.target.value) || 10})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding *</Label>
                    <Select
                      value={learningDraft.fundingStatus}
                      onValueChange={(v) => setLearningDraft({...learningDraft, fundingStatus: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Self-funded">Self-funded</SelectItem>
                        <SelectItem value="Employer-funded">Employer-funded</SelectItem>
                        <SelectItem value="Scholarship">Scholarship</SelectItem>
                        <SelectItem value="Government grant">Government grant</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  disabled={!canAddLearning}
                  onClick={() => {
                    setLearningInterests([...learningInterests, learningDraft])
                    setLearningDraft({skill: "", status: "planned", institute: "", months: 12, hoursPerWeek: 10, fundingStatus: "Self-funded"})
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning Goal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* School Offers Card */}
      <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <School className="w-6 h-6 text-orange-600" />
            School Offers & Applications
          </CardTitle>
          <p className="text-sm text-muted-foreground">Existing school offers or applications in {countryPhrase}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
                            {offer.year} • {offer.fundingStatus}
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
                    <Label>Start year *</Label>
                    <Input
                      placeholder="2024"
                      value={offerDraft.year}
                      onChange={(e) => setOfferDraft({...offerDraft, year: e.target.value})}
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
                    setOfferDraft({school: "", program: "", year: "", fundingStatus: "Self-funded"})
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add School Offer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {!canContinue && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Complete required fields:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {degrees.length === 0 && <li>At least one degree</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("education")}
              isCheckingInfo={isCheckingInfo}
              sectionId="education"
              onContinue={handleComplete}
              canContinue={canContinue}
              nextSectionName="Residency Intentions"
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