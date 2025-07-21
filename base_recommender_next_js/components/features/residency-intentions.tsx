/* --------------------------------------------------------------------- *
 *  Residency Intentions – quick-win subset                              *
 *  Captures: move-type, duration (if temporary), residency / citizenship *
 *  interest, max months presence, motivation text and tax compliance.   *
 * --------------------------------------------------------------------- */

"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormData } from "@/lib/hooks/use-form-data"
import { useState, useEffect, useMemo } from "react"
import { SectionHint } from "@/components/ui/section-hint"
import { getLanguages } from "@/lib/utils/country-utils"
import { Slider } from "@/components/ui/slider"

export function ResidencyIntentions({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { getFormData, updateFormData } = useFormData()

  /* ---------------------- move type ---------------------- */
  const moveType =
    getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const setMoveType = (v: string) =>
    updateFormData("residencyIntentions.destinationCountry.moveType", v)

  /* Temporary duration (years) */
  const tempDuration =
    getFormData(
      "residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay"
    ) ?? ""

  /* Residency & citizenship interest ---------------------- */
  const applyForResidency: boolean =
    getFormData("residencyIntentions.residencyPlans.applyForResidency") ?? false
  const interestedInCitizenship: boolean =
    getFormData(
      "residencyIntentions.citizenshipPlans.interestedInCitizenship"
    ) ?? false

  /* Max months willing to reside (if residency) ----------- */
  const maxMonths =
    getFormData(
      "residencyIntentions.residencyPlans.maxMonthsWillingToReside"
    ) ?? ""

  /* Motivation note & tax compliance --------------------- */
  const motivation =
    getFormData("residencyIntentions.moveMotivation") ?? ""
  const taxOK: boolean =
    getFormData("residencyIntentions.taxCompliantEverywhere") ?? true

  /* ---------------- Language proficiency ---------------- */
  type OtherLang = {
    language: string
    proficiency: string
    teachingCapability: string
  }

  const primaryLang =
    getFormData("residencyIntentions.languageProficiency.primaryLanguage") ?? ""

  const others: OtherLang[] =
    getFormData("residencyIntentions.languageProficiency.otherLanguages") ?? []

  const setOthers = (next: OtherLang[]) =>
    updateFormData(
      "residencyIntentions.languageProficiency.otherLanguages",
      next
    )

  const PROF_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const

  const [draftLang, setDraftLang] = useState<OtherLang>({
    language: "",
    proficiency: "Basic",
    teachingCapability: "No",
  })

  const canAddLang = draftLang.language.trim() !== ""

  /* Destination languages */
  const destCountry = getFormData("destination.country") ?? ""
  const destRegion = getFormData("destination.region") ?? ""
  const destLangs = useMemo(() => (
    destCountry ? getLanguages(destCountry, destRegion) : []
  ), [destCountry, destRegion])

  const indProf: Record<string,string> = getFormData("residencyIntentions.languageProficiency.individual") ?? {}
  const setIndProf = (obj: Record<string,string>) => updateFormData("residencyIntentions.languageProficiency.individual", obj)

  /* willing to learn list */
  const willing: string[] = getFormData("residencyIntentions.languageProficiency.willingToLearn") ?? []
  const setWilling = (arr: string[]) => updateFormData("residencyIntentions.languageProficiency.willingToLearn", arr)

  /* teaching capability */
  const canTeach: Record<string,string> = getFormData("residencyIntentions.languageProficiency.canTeach") ?? {}
  const setCanTeach = (obj: Record<string,string>) => updateFormData("residencyIntentions.languageProficiency.canTeach", obj)

  /* -- derived validation -- */
  const canContinue =
    moveType &&
    (moveType !== "Temporary" || tempDuration) &&
    (!applyForResidency || maxMonths !== "") &&
    primaryLang.trim() !== ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residency Intentions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint>
          <p>
            This section helps us understand your residency intentions. It's important for us to know your plans and motivations for moving.
          </p>
        </SectionHint>

        {/* Move type */}
        <div className="space-y-2">
          <Label>Type of move *</Label>
          <p className="text-xs text-muted-foreground mb-1">
            Permanent = move indefinitely. Temporary = fixed stay. Digital Nomad = short stays under specific visa.
          </p>
          <Select value={moveType} onValueChange={setMoveType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Permanent">Permanent</SelectItem>
              <SelectItem value="Temporary">Temporary</SelectItem>
              <SelectItem value="Digital Nomad">Digital Nomad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration if Temporary */}
        {moveType === "Temporary" && (
          <div className="space-y-1">
            <Label>Intended duration (years) *</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Rough estimate—helps determine visa length & tax residency risk.
            </p>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={tempDuration}
              onChange={(e) =>
                updateFormData(
                  "residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay",
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* Residency & Citizenship interests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="apply_res"
              checked={applyForResidency}
              onCheckedChange={(v) =>
                updateFormData(
                  "residencyIntentions.residencyPlans.applyForResidency",
                  !!v
                )
              }
            />
            <Label htmlFor="apply_res">I plan to apply for residency</Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cit_interest"
              checked={interestedInCitizenship}
              onCheckedChange={(v) =>
                updateFormData(
                  "residencyIntentions.citizenshipPlans.interestedInCitizenship",
                  !!v
                )
              }
            />
            <Label htmlFor="cit_interest">
              I'm interested in future citizenship
            </Label>
          </div>
        </div>

        {/* Max months if residency */}
        {applyForResidency && (
          <div className="space-y-1">
            <Label>
              Max months per year I'm willing to reside (first year) *
            </Label>
            <p className="text-xs text-muted-foreground mb-1">
              Some residency permits require physical presence; set 12 for full-time stay.
            </p>
            <Input
              type="number"
              min={0}
              max={12}
              value={maxMonths}
              onChange={(e) =>
                updateFormData(
                  "residencyIntentions.residencyPlans.maxMonthsWillingToReside",
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* Destination languages list (step 1) */}
        <div className="space-y-2">
          <h3 className="font-semibold">Languages spoken in your destination</h3>
          {destLangs.length > 0 ? (
            <p className="text-sm">{destLangs.join(" • ")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Select a destination country first to see its dominant languages.</p>
          )}
        </div>

        {/* Center of Life ties – show if limited presence */}
        {applyForResidency && Number(maxMonths) <= 6 && (
          <div className="space-y-2 border rounded-md p-4">
            <h4 className="font-medium">Center of Life considerations</h4>
            <p className="text-xs text-muted-foreground">
              Limited physical presence may trigger "center of life" tax issues in other countries. Tell us which ties you will still keep.
            </p>

            {(() => {
              const family = getFormData("residencyIntentions.centerOfLife.familyTies") ?? false
              const business = getFormData("residencyIntentions.centerOfLife.businessTies") ?? false
              const social = getFormData("residencyIntentions.centerOfLife.socialTies") ?? false

              const update = (field: string, val: boolean) =>
                updateFormData(`residencyIntentions.centerOfLife.${field}`, val)

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="fam_ties" checked={family} onCheckedChange={(v)=>update('familyTies',!!v)} />
                    <Label htmlFor="fam_ties">Family ties in another country</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="biz_ties" checked={business} onCheckedChange={(v)=>update('businessTies',!!v)} />
                    <Label htmlFor="biz_ties">Business / employment ties</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="soc_ties" checked={social} onCheckedChange={(v)=>update('socialTies',!!v)} />
                    <Label htmlFor="soc_ties">Social / community ties</Label>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Motivation */}
        <div className="space-y-1">
          <Label>What's your main motivation for this move?</Label>
          <p className="text-xs text-muted-foreground mb-1">Optional but helps us tailor recommendations.</p>
          <Textarea
            value={motivation}
            onChange={(e) =>
              updateFormData("residencyIntentions.moveMotivation", e.target.value)
            }
            placeholder="e.g. lower taxes, better quality of life, adventure…"
          />
        </div>

        {/* Tax compliance */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="tax_ok"
            checked={taxOK}
            onCheckedChange={(v) =>
              updateFormData(
                "residencyIntentions.taxCompliantEverywhere",
                !!v
              )
            }
          />
          <Label htmlFor="tax_ok">
            I have been fully tax-compliant in every country I've lived in
          </Label>
        </div>

        {/* Destination language proficiency removed for reset */}

        {/* Citizenship acquisition methods */}
        {interestedInCitizenship && (
          <div className="space-y-2 border rounded-md p-4 mt-2">
            <h4 className="font-medium">Citizenship pathways you're open to</h4>
            {(() => {
              const invest = getFormData("residencyIntentions.citizenshipPlans.investmentCitizenship") ?? false
              const donate = getFormData("residencyIntentions.citizenshipPlans.donationCitizenship") ?? false
              const military = getFormData("residencyIntentions.citizenshipPlans.militaryService") ?? false

              const family = getFormData("residencyIntentions.citizenshipPlans.familyTies.hasConnections") ?? false
              const relation = getFormData("residencyIntentions.citizenshipPlans.familyTies.closestRelation") ?? ""

              const upd = (field: string, v: boolean) =>
                updateFormData(`residencyIntentions.citizenshipPlans.${field}`, v)

              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Checkbox id="invest_cit" checked={invest} onCheckedChange={(v)=>upd('investmentCitizenship',!!v)} />
                    <Label htmlFor="invest_cit">Investment route (e.g. real estate, bonds)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="donate_cit" checked={donate} onCheckedChange={(v)=>upd('donationCitizenship',!!v)} />
                    <Label htmlFor="donate_cit">Donation route (e.g. national fund)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="mil_cit" checked={military} onCheckedChange={(v)=>upd('militaryService',!!v)} />
                    <Label htmlFor="mil_cit">Willing to perform mandatory military service</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="fam_cit" checked={family} onCheckedChange={(v)=>updateFormData('residencyIntentions.citizenshipPlans.familyTies.hasConnections',!!v)} />
                    <Label htmlFor="fam_cit">I have family ties that might grant citizenship</Label>
                  </div>

                  {family && (
                    <Input
                      placeholder="Describe closest relation (e.g. grandparent)"
                      value={relation}
                      onChange={(e)=>updateFormData('residencyIntentions.citizenshipPlans.familyTies.closestRelation', e.target.value)}
                    />
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!canContinue} onClick={onComplete}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
} 