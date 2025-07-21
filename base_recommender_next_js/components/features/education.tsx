/* --------------------------------------------------------------------- *
 *  Education section: Previous Degrees list                              *
 *  (visa-skills & learning-interests still TODO)                         *
 * --------------------------------------------------------------------- */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useFormData } from "@/lib/hooks/use-form-data"
import { SectionHint } from "@/components/ui/section-hint"

type Degree = {
  degreeName: string
  institution: string
  startYear: string
  endYear: string
  inProgress: boolean
}

export function Education({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormData()

  const degrees: Degree[] = getFormData("education.previousDegrees") ?? []
  const setDegrees = (next: Degree[]) =>
    updateFormData("education.previousDegrees", next)

  /* local state for the "New degree" mini-form */
  const [draft, setDraft] = useState<Degree>({
    degreeName: "",
    institution: "",
    startYear: "",
    endYear: "",
    inProgress: false,
  })

  const resetDraft = () =>
    setDraft({
      degreeName: "",
      institution: "",
      startYear: "",
      endYear: "",
      inProgress: false,
    })

  const canAdd =
    draft.degreeName && draft.institution && draft.startYear && (draft.inProgress || draft.endYear)

  /* ---------------- Visa-relevant skills ---------------- */
  type Skill = {
    skill: string
    credentialName?: string
    credentialInstitute?: string
  }

  const skills: Skill[] = getFormData("education.visaSkills") ?? []
  const setSkills = (next: Skill[]) => updateFormData("education.visaSkills", next)

  const [skillDraft, setSkillDraft] = useState<Skill>({ skill: "" })
  const canAddSkill = skillDraft.skill.trim().length > 0

  /* ---------------- Education interests ---------------- */
  const interestedInStudy: boolean = getFormData("education.interestedInStudying") ?? false
  const setInterested = (v: boolean) => updateFormData("education.interestedInStudying", v)

  const studyDetails: string = getFormData("education.studyInterestDetails") ?? ""
  const setStudyDetails = (txt: string) => updateFormData("education.studyInterestDetails", txt)

  /* ---------------- Planned study entries ---------------- */
  type Planned = {
    kind: "course" | "offer"
    name: string
    institute: string
    interestType?: "Open" | "Planned"
  }

  const planned: Planned[] = getFormData("education.plannedStudies") ?? []
  const setPlanned = (next: Planned[]) => updateFormData("education.plannedStudies", next)

  const [planDraft, setPlanDraft] = useState<Planned>({ kind: "course", name: "", institute: "", interestType: "Open" })
  const canAddPlan = planDraft.name.trim() !== "" && planDraft.institute.trim() !== ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Degrees</CardTitle>
      </CardHeader>

      <CardContent>
        <SectionHint title="Why your earlier degrees are relevant">
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li><strong>Points-based migration</strong> – many skilled-visa systems award extra points for Bachelor's, Master's or PhD credentials.</li>
            <li><strong>Professional licensing & salary thresholds</strong> – regulated professions or salary rules depend on your highest qualification.</li>
            <li><strong>Qualification recognition</strong> – listing degrees helps us flag any equivalency steps you may need.</li>
          </ul>
        </SectionHint>
      </CardContent>

      <CardContent className="space-y-6">
        {/* Existing degrees list */}
        {degrees.length > 0 && (
          <div className="space-y-2">
            {degrees.map((deg, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3"
              >
                <span className="font-medium">
                  {deg.degreeName} – {deg.institution}
                </span>
                <span className="text-sm text-muted-foreground">
                  {deg.startYear} – {deg.inProgress ? "Present" : deg.endYear}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDegrees(degrees.filter((_, i) => i !== idx))}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add-degree form */}
        <div className="space-y-3">
          <Input
            placeholder="Degree name (e.g. BSc Economics)"
            value={draft.degreeName}
            onChange={(e) => setDraft({ ...draft, degreeName: e.target.value })}
          />
          <Input
            placeholder="Institution"
            value={draft.institution}
            onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Start year"
              className="flex-1"
              value={draft.startYear}
              onChange={(e) => setDraft({ ...draft, startYear: e.target.value })}
            />
            {!draft.inProgress && (
              <Input
                type="number"
                placeholder="End year"
                className="flex-1"
                value={draft.endYear}
                onChange={(e) => setDraft({ ...draft, endYear: e.target.value })}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="inProgress"
              checked={draft.inProgress}
              onCheckedChange={(v) =>
                setDraft({
                  ...draft,
                  inProgress: !!v,
                  endYear: v ? "" : draft.endYear,
                })
              }
            />
            <Label htmlFor="inProgress">Currently in progress</Label>
          </div>

          <Button
            disabled={!canAdd}
            onClick={() => {
              setDegrees([...degrees, draft])
              resetDraft()
            }}
          >
            Add degree
          </Button>
        </div>
      </CardContent>

      {/* Visa-relevant skills */}
      <CardHeader>
        <CardTitle>Visa-relevant skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.length > 0 && (
          <div className="space-y-2">
            {skills.map((s, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3">
                <span className="font-medium">
                  {s.skill}
                  {s.credentialName && (
                    <span className="text-xs ml-1 text-muted-foreground"> — {s.credentialName}</span>
                  )}
                </span>
                {s.credentialInstitute && (
                  <span className="text-sm text-muted-foreground">{s.credentialInstitute}</span>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>✕</Button>
              </div>
            ))}
          </div>
        )}

        {/* add skill form */}
        <div className="space-y-3">
          <Input
            placeholder="Skill / Expertise (e.g. Software Engineering)"
            value={skillDraft.skill}
            onChange={(e) => setSkillDraft({ ...skillDraft, skill: e.target.value })}
          />
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

          <Button
            disabled={!canAddSkill}
            onClick={() => {
              setSkills([...skills, skillDraft])
              setSkillDraft({ skill: "" })
            }}
          >
            Add skill
          </Button>
        </div>
      </CardContent>

      {/* Education Interests */}
      <CardHeader>
        <CardTitle>Education interests</CardTitle>
      </CardHeader>
      <CardContent>
        <SectionHint title="Why list future studies / skills?">
          <p className="text-sm text-muted-foreground">
            Many countries run <strong>occupation- or skill-shortage visas</strong>. Documenting what you plan to study – especially high-demand skills – helps us match you with these programs.
          </p>
        </SectionHint>
      </CardContent>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox id="interestChk" checked={interestedInStudy} onCheckedChange={(v)=>setInterested(!!v)} />
          <Label htmlFor="interestChk">I plan or am interested in formal study (courses, degrees or certified skills) in my destination country.</Label>
        </div>

        {interestedInStudy && (
          <div className="space-y-2">
            <Label htmlFor="studyDetails">Details about your education / skill interests</Label>
            <textarea
              id="studyDetails"
              className="w-full min-h-[120px] rounded-md border bg-background p-2"
              value={studyDetails}
              onChange={(e)=>setStudyDetails(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      {/* Planned study */}
      {interestedInStudy && (
        <>
          <CardHeader>
            <CardTitle>Planned study / offers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {planned.length > 0 && (
              <div className="space-y-2">
                {planned.map((p, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded-md p-3">
                    <span className="font-medium">
                      {p.kind === "course" ? "📘" : "🏛️"} {p.name}
                    </span>
                    <span className="text-sm text-muted-foreground">{p.institute}</span>
                    <Button variant="ghost" size="icon" onClick={() => setPlanned(planned.filter((_, i)=>i!==idx))}>✕</Button>
                  </div>
                ))}
              </div>
            )}

            {/* add planned study form */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Label className="flex items-center gap-1">
                  <input type="radio" name="planKind" checked={planDraft.kind==='course'} onChange={()=>setPlanDraft({...planDraft, kind:'course'})} />
                  Skill / Certificate course
                </Label>
                <Label className="flex items-center gap-1">
                  <input type="radio" name="planKind" checked={planDraft.kind==='offer'} onChange={()=>setPlanDraft({...planDraft, kind:'offer'})} />
                  School / University offer
                </Label>
              </div>
              <Input placeholder={planDraft.kind==='course' ? 'Course name' : 'Programme name'} value={planDraft.name} onChange={(e)=>setPlanDraft({...planDraft, name:e.target.value})} />
              <Input placeholder="Institute / Provider" value={planDraft.institute} onChange={(e)=>setPlanDraft({...planDraft, institute:e.target.value})} />

              <Button disabled={!canAddPlan} onClick={()=>{
                setPlanned([...planned, planDraft]);
                setPlanDraft({ ...planDraft, name:'', institute:'' });
              }}>Add</Button>
            </div>
          </CardContent>
        </>
      )}

      <CardFooter>
        <Button className="w-full" onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 