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
  const { isLoading: isCheckingInfo, showSectionInfo } = useSectionInfo()

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
                
                {/* YOU TAB */}
                <TabsContent value="you" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                  <div className="space-y-6">
                    {/* Your Degrees */}
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

                    {/* Add Your Degree */}
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

                    <Separator />

                    {/* Your Skills */}
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

                    {/* Add Your Skill */}
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium text-base">Add Skill</h4>
                      <div className="flex gap-2">
                        <Input placeholder="Add a skill" value={skillDraft.skill} onChange={(e) => setSkillDraft({...skillDraft, skill: e.target.value})} />
                        <Button disabled={!skillDraft.skill} onClick={() => { setSkills([...skills, skillDraft]); setSkillDraft({skill: "", credentialName: "", credentialInstitute: ""}) }}>Add</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* PARTNER TAB */}
                <TabsContent value="partner" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
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

                    {/* Add Partner Degree */}
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

                    <Separator />

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

                    {/* Add Partner Skill */}
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
                {/* Single User Mode - All Sections */}
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

                <Separator />

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

            <Separator />

            {/* School Offers Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <School className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">School Offers & Applications</h3>
              </div>
              
              {schoolOffers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Your School Offers</h4>
                  <div className="grid gap-4">
                    {schoolOffers.map((offer, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{offer.program}</h5>
                            <p className="text-sm text-muted-foreground mb-1">{offer.school}</p>
                            <p className="text-sm text-muted-foreground">
                              {offer.startDate ? new Date(offer.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'} • {offer.fundingStatus}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSchoolOffers(schoolOffers.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-base">Add School Offer</h4>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>School/University *</Label>
                      <Input placeholder="e.g., University of Toronto" value={offerDraft.school} onChange={(e) => setOfferDraft({...offerDraft, school: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Program/Course *</Label>
                      <Input placeholder="e.g., Master of Computer Science" value={offerDraft.program} onChange={(e) => setOfferDraft({...offerDraft, program: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start date *</Label>
                      <Input type="date" value={offerDraft.startDate} onChange={(e) => setOfferDraft({...offerDraft, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Funding status *</Label>
                      <Select value={offerDraft.fundingStatus} onValueChange={(v) => setOfferDraft({...offerDraft, fundingStatus: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Button disabled={!canAddOffer} onClick={() => { setSchoolOffers([...schoolOffers, offerDraft]); setOfferDraft({school: "", program: "", startDate: "", fundingStatus: ""}) }} className="w-full">
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
                            <p className="text-sm text-muted-foreground mb-1">{interest.institute}</p>
                            <p className="text-sm text-muted-foreground">
                              {interest.months} months • {interest.hoursPerWeek} hrs/week • {interest.fundingStatus}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setLearningInterests(learningInterests.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 border rounded-lg bg-card">
                <h4 className="font-medium text-base">Add Learning Goal</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill or subject *</Label>
                    <Input placeholder="e.g., Spanish Language, Digital Marketing, Data Science..." value={interestDraft.skill} onChange={(e) => setInterestDraft({...interestDraft, skill: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Commitment level *</Label>
                    <Select value={interestDraft.status} onValueChange={(v) => setInterestDraft({...interestDraft, status: v as "planned" | "open"})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">I have concrete plans to learn this</SelectItem>
                        <SelectItem value="open">I'm open to learning this</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Preferred institution/method</Label>
                      <Input placeholder="e.g., Local university, online course, self-study..." value={interestDraft.institute} onChange={(e) => setInterestDraft({...interestDraft, institute: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected duration (months)</Label>
                      <Input type="number" min="1" max="120" placeholder="12" value={interestDraft.months} onChange={(e) => setInterestDraft({...interestDraft, months: parseInt(e.target.value) || 0})} onFocus={(e) => e.target.select()} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hours per week</Label>
                      <Input type="number" min="1" max="40" placeholder="10" value={interestDraft.hoursPerWeek} onChange={(e) => setInterestDraft({...interestDraft, hoursPerWeek: parseInt(e.target.value) || 0})} onFocus={(e) => e.target.select()} />
                    </div>
                    <div className="space-y-2">
                      <Label>Funding approach</Label>
                      <Select value={interestDraft.fundingStatus} onValueChange={(v) => setInterestDraft({...interestDraft, fundingStatus: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Button disabled={!canAddInterest} onClick={() => { setLearningInterests([...learningInterests, interestDraft]); setInterestDraft({skill: "", status: "planned", institute: "", months: 0, hoursPerWeek: 0, fundingStatus: ""}) }} className="w-full">
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
        onCheckInfo={async () => {
          showSectionInfo('education')
        }}
        isCheckingInfo={isCheckingInfo}
      />
    </div>
  )
}

function LanguageProficiencyFull() {
  const { getFormData, updateFormData } = useFormStore()
  
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

          {/* Beautiful Language Skills Tabs */}
          {hasPartner ? (
            <Tabs defaultValue="you" className="w-full">
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
              <TabsContent value="you" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
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
              <TabsContent value="partner" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
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
                    <Slider 
                      value={[currentLevel]} 
                      onValueChange={(value) => { 
                        updateFormData(`residencyIntentions.languageProficiency.individual.${lang}`, value[0]) 
                      }} 
                      max={7} min={0} step={1} className="w-full" 
                    />
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
