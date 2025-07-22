/* --------------------------------------------------------------------- *
 *  Education section: Enhanced with visa skills, study interests, etc.  *
 * --------------------------------------------------------------------- */

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
import { Plus, Trash2, GraduationCap, BookOpen, Award, Users, Info } from "lucide-react"

type Degree = {
  degreeName: string
  institution: string
  startYear: string
  endYear: string
  inProgress: boolean
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
  const { getFormData, updateFormData } = useFormStore()

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
    degreeName: "", institution: "", startYear: "", endYear: "", inProgress: false
  })
  const [skillDraft, setSkillDraft] = useState<Skill>({ skill: "" })
  const [studyType, setStudyType] = useState<"course" | "offer">("course")
  const [courseDraft, setCourseDraft] = useState<Omit<LearningInterest, "status">>({
    skill: "", institute: "", months: 0, hoursPerWeek: 0, fundingStatus: "Not sure / need scholarship"
  })
  const [offerDraft, setOfferDraft] = useState<SchoolOffer>({
    school: "", program: "", year: "", fundingStatus: "Not sure / need scholarship"
  })

  const resetDegreeDraft = () => setDegreeDraft({
    degreeName: "", institution: "", startYear: "", endYear: "", inProgress: false
  })

  const resetSkillDraft = () => setSkillDraft({ skill: "" })

  const canAddDegree = degreeDraft.degreeName && degreeDraft.institution && degreeDraft.startYear && 
    (degreeDraft.inProgress || degreeDraft.endYear)
  
  const canAddSkill = skillDraft.skill.trim().length > 0
  
  const canAddCourse = courseDraft.skill.trim() !== ""
  
  const canAddOffer = offerDraft.school.trim() !== ""

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          📚 Education
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint title="ℹ️ Why your educational background matters">
          Your educational background helps assess visa eligibility, professional licensing requirements, and qualification recognition in your destination country.
          <ul className="mt-3 space-y-1 list-disc list-inside">
            <li><strong>Points-based migration</strong> – many skilled-visa systems (e.g. Canada, Australia, UK PBS) award extra points for Bachelor's, Master's or PhD credentials.</li>
            <li><strong>Professional licensing & salary thresholds</strong> – regulated professions or minimum-salary rules often depend on your highest qualification.</li>
            <li><strong>Qualification recognition</strong> – some countries grant simplified diploma-recognition or "blue-card" routes when the awarding institution is accredited. Listing your degrees helps us flag any equivalency steps you may need.</li>
          </ul>
        </SectionHint>

        <Separator />

        {/* Education History Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            📚 Education History (past & present)
          </h3>

          {/* Existing degrees list */}
          {degrees.length > 0 && (
            <div className="space-y-3">
              {degrees.map((deg, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3 bg-muted/50"
                >
                  <div>
                    <span className="font-medium">{deg.degreeName}</span>
                    <p className="text-sm text-muted-foreground">{deg.institution}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {deg.startYear} – {deg.inProgress ? "Present" : deg.endYear}
                    </span>
                    {deg.inProgress && <Badge variant="secondary">In Progress</Badge>}
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
          )}

          {/* Add degree form */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Educational Qualification
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Degree name (e.g. BSc Economics, PhD Physics)"
                value={degreeDraft.degreeName}
                onChange={(e) => setDegreeDraft({ ...degreeDraft, degreeName: e.target.value })}
              />
              <Input
                placeholder="Institution"
                value={degreeDraft.institution}
                onChange={(e) => setDegreeDraft({ ...degreeDraft, institution: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Start year"
                className="flex-1"
                value={degreeDraft.startYear}
                onChange={(e) => setDegreeDraft({ ...degreeDraft, startYear: e.target.value })}
              />
              {!degreeDraft.inProgress && (
                <Input
                  type="number"
                  placeholder="End year"
                  className="flex-1"
                  value={degreeDraft.endYear}
                  onChange={(e) => setDegreeDraft({ ...degreeDraft, endYear: e.target.value })}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="inProgress"
                checked={degreeDraft.inProgress}
                onCheckedChange={(v) => setDegreeDraft({
                  ...degreeDraft,
                  inProgress: !!v,
                  endYear: v ? "" : degreeDraft.endYear,
                })}
              />
              <Label htmlFor="inProgress">Currently in progress</Label>
            </div>

            <Button
              disabled={!canAddDegree}
              onClick={() => {
                setDegrees([...degrees, degreeDraft])
                resetDegreeDraft()
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Degree
            </Button>
          </div>
        </div>

        <Separator />

        {/* Visa-relevant Skills Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5" />
            🛂 Visa-relevant Skills
          </h3>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Why list skills?</strong> Many countries run occupation- or skill-shortage visas (e.g. Australian Skills Independent Visa, New Zealand Green List, Canada Express Entry). Documenting your skills helps us match you with these programs.
            </AlertDescription>
          </Alert>

          {/* Existing skills list */}
          {skills.length > 0 && (
            <div className="space-y-3">
              {skills.map((s, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3 bg-muted/50">
                  <div>
                    <span className="font-medium">{s.skill}</span>
                    {s.credentialName && (
                      <p className="text-sm text-muted-foreground">Credential: {s.credentialName}</p>
                    )}
                    {s.credentialInstitute && (
                      <p className="text-sm text-muted-foreground">Institution: {s.credentialInstitute}</p>
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
          )}

          {/* Add skill form */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Skill/Expertise
            </h4>
            
            <Input
              placeholder="Skill / Expertise (e.g. Software Engineering, Nursing)"
              value={skillDraft.skill}
              onChange={(e) => setSkillDraft({ ...skillDraft, skill: e.target.value })}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Credential name (optional)"
                value={skillDraft.credentialName ?? ""}
                onChange={(e) => setSkillDraft({ ...skillDraft, credentialName: e.target.value })}
              />
              <Input
                placeholder="Credential institute (optional)"
                value={skillDraft.credentialInstitute ?? ""}
                onChange={(e) => setSkillDraft({ ...skillDraft, credentialInstitute: e.target.value })}
              />
            </div>

            <Button
              disabled={!canAddSkill}
              onClick={() => {
                setSkills([...skills, skillDraft])
                resetSkillDraft()
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>

        <Separator />

        {/* Education Interests Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            🎓 Education Interests
          </h3>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Why list future studies / skills?</strong> Documenting what you plan to study—especially high-demand skills—helps us match you with skill-shortage programs and study visa options.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="interestChk" 
              checked={interestedInStudy} 
              onCheckedChange={(v) => setInterested(!!v)} 
            />
            <Label htmlFor="interestChk">
              I plan or am interested in formal study (courses, degrees or certified skills) in {countryPhrase}.
            </Label>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Tick if you expect to enroll in a school, university <strong>or official skills course</strong>.
          </p>

          {interestedInStudy && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studyDetails">Details about your education / skill interests</Label>
                <p className="text-xs text-muted-foreground">
                  Tell us which qualifications or skills you'd like to pursue.
                </p>
                <Textarea
                  id="studyDetails"
                  className="min-h-[120px]"
                  value={studyDetails}
                  onChange={(e) => setStudyDetails(e.target.value)}
                  placeholder="Describe your educational interests, goals, and planned studies..."
                />
              </div>

              {/* Planned Study Management */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  ➕ Add planned study (course OR university offer)
                </h4>

                {/* Study Type Selection */}
                <div className="flex gap-4">
                  <Label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="studyType" 
                      checked={studyType === 'course'} 
                      onChange={() => setStudyType('course')} 
                    />
                    📘 Skill / Certificate course
                  </Label>
                  <Label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="studyType" 
                      checked={studyType === 'offer'} 
                      onChange={() => setStudyType('offer')} 
                    />
                    🏛️ School / University offer
                  </Label>
                </div>

                {studyType === 'course' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Skill or Course Name"
                        value={courseDraft.skill}
                        onChange={(e) => setCourseDraft({ ...courseDraft, skill: e.target.value })}
                      />
                      <Input
                        placeholder="Institution / Provider"
                        value={courseDraft.institute}
                        onChange={(e) => setCourseDraft({ ...courseDraft, institute: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Duration (months)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={courseDraft.months}
                          onChange={(e) => setCourseDraft({ ...courseDraft, months: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Hours per week</Label>
                        <Input
                          type="number"
                          min={0}
                          value={courseDraft.hoursPerWeek}
                          onChange={(e) => setCourseDraft({ ...courseDraft, hoursPerWeek: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Funding status</Label>
                      <Select 
                        value={courseDraft.fundingStatus} 
                        onValueChange={(v) => setCourseDraft({ ...courseDraft, fundingStatus: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Have funds">Have funds</SelectItem>
                          <SelectItem value="Not sure / need scholarship">Not sure / need scholarship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      disabled={!canAddCourse}
                      onClick={() => {
                        setLearningInterests([...learningInterests, { ...courseDraft, status: "planned" }])
                        setCourseDraft({ skill: "", institute: "", months: 0, hoursPerWeek: 0, fundingStatus: "Not sure / need scholarship" })
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Course Interest
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="School / University Name *"
                        value={offerDraft.school}
                        onChange={(e) => setOfferDraft({ ...offerDraft, school: e.target.value })}
                      />
                      <Input
                        placeholder="Offer / Programme"
                        value={offerDraft.program}
                        onChange={(e) => setOfferDraft({ ...offerDraft, program: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Year (YYYY)"
                        value={offerDraft.year}
                        onChange={(e) => setOfferDraft({ ...offerDraft, year: e.target.value })}
                      />
                      <Select 
                        value={offerDraft.fundingStatus} 
                        onValueChange={(v) => setOfferDraft({ ...offerDraft, fundingStatus: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Funding status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Have funds">Have funds</SelectItem>
                          <SelectItem value="Not sure / need scholarship">Not sure / need scholarship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      disabled={!canAddOffer}
                      onClick={() => {
                        setSchoolOffers([...schoolOffers, offerDraft])
                        setOfferDraft({ school: "", program: "", year: "", fundingStatus: "Not sure / need scholarship" })
                      }}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add School Offer
                    </Button>
                  </div>
                )}
              </div>

              {/* Display Learning Interests */}
              {learningInterests.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">📘 Your Course/Skill Interests</h4>
                  {learningInterests.map((interest, idx) => (
                    <div key={idx} className="border rounded p-3 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{interest.skill}</p>
                          <p className="text-sm text-muted-foreground">{interest.institute}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            {interest.months > 0 && <span>Duration: {interest.months} months</span>}
                            {interest.hoursPerWeek > 0 && <span>Hours/week: {interest.hoursPerWeek}</span>}
                            <span>Funding: {interest.fundingStatus}</span>
                          </div>
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
              )}

              {/* Display School Offers */}
              {schoolOffers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">🏛️ Your School / University Offers</h4>
                  {schoolOffers.map((offer, idx) => (
                    <div key={idx} className="border rounded p-3 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{offer.school}</p>
                          <p className="text-sm text-muted-foreground">{offer.program}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            {offer.year && <span>Year: {offer.year}</span>}
                            <span>Status: {offer.fundingStatus}</span>
                          </div>
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
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={onComplete} size="lg">
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 