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
import { useFormStore } from "@/lib/stores"
import { useState, useEffect, useMemo } from "react"
import { SectionHint } from "@/components/ui/section-hint"
import { getLanguages } from "@/lib/utils/country-utils"
import { Slider } from "@/components/ui/slider"

export function ResidencyIntentions({
  onComplete,
}: {
  onComplete: () => void
}) {
  const { getFormData, updateFormData } = useFormStore()

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
    (!applyForResidency || maxMonths !== "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residency Intentions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <SectionHint title="📋 About this section">
          This section helps us understand your residency intentions, language skills, and citizenship pathways to provide tailored advice for your move.
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
          <div className="space-y-3">
            <Label>
              Max months per year I'm willing to reside (first year) *
            </Label>
            <p className="text-xs text-muted-foreground mb-1">
              Some residency permits require physical presence; set 12 for full-time stay.
            </p>
            
            {/* Slider for months */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Months per year: <strong>{maxMonths || 6}</strong></span>
                <span className="text-xs text-muted-foreground">
                  {Number(maxMonths || 6) === 0 ? "No presence" :
                   Number(maxMonths || 6) <= 3 ? "Minimal presence" :
                   Number(maxMonths || 6) <= 6 ? "Limited presence" :
                   Number(maxMonths || 6) <= 9 ? "Substantial presence" : "Full-time residence"}
                </span>
              </div>
              <Slider
                value={[Number(maxMonths || 6)]}
                onValueChange={(value) =>
                  updateFormData(
                    "residencyIntentions.residencyPlans.maxMonthsWillingToReside",
                    value[0].toString()
                  )
                }
                max={12}
                min={0}
                step={1}
                className="w-full"
              />
              
              {/* Warning for zero presence */}
              {Number(maxMonths || 6) === 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="open_visiting"
                    checked={getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false}
                    onCheckedChange={(v) =>
                      updateFormData("residencyIntentions.residencyPlans.openToVisiting", !!v)
                    }
                  />
                  <Label htmlFor="open_visiting" className="text-sm">I'm open to occasional visits if required</Label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Language Proficiency Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">🗣️ Language Skills</h3>
          
          {destLangs.length > 0 ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🌐 The dominant language{destLangs.length > 1 ? 's' : ''} in {destCountry} {destLangs.length > 1 ? 'are' : 'is'}: <strong>{destLangs.join(', ')}</strong>
                </p>
              </div>

              {/* Your Language Proficiency */}
              <div className="space-y-3">
                <h4 className="font-medium">📊 Your Language Skills</h4>
                {destLangs.map((lang) => {
                  const currentLevel = Number(indProf[lang] || 0)
                  const proficiencyLabels = ['None', 'A1 (Beginner)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper-Intermediate)', 'C1 (Advanced)', 'C2 (Native-like)']
                  
                  return (
                    <div key={lang} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">{lang} proficiency</Label>
                        <span className="text-sm text-muted-foreground">{proficiencyLabels[currentLevel]}</span>
                      </div>
                                             <Slider
                         value={[currentLevel]}
                         onValueChange={(value) => {
                           const newProf = { ...indProf, [lang]: value[0].toString() }
                           setIndProf(newProf)
                         }}
                        max={6}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      
                      {/* Willingness to learn */}
                      {currentLevel < 3 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Checkbox
                            id={`learn_${lang}`}
                            checked={willing.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setWilling([...willing, lang])
                              } else {
                                setWilling(willing.filter(l => l !== lang))
                              }
                            }}
                          />
                          <Label htmlFor={`learn_${lang}`} className="text-sm">Willing to learn {lang}</Label>
                        </div>
                      )}
                      
                      {/* Teaching capability */}
                      {currentLevel >= 4 && (
                        <div className="space-y-2 mt-2">
                          <Label className="text-sm">Can you teach {lang}?</Label>
                          <Select
                            value={canTeach[lang] || 'No'}
                            onValueChange={(value) => {
                              const newTeach = { ...canTeach }
                              if (value === 'No') {
                                delete newTeach[lang]
                              } else {
                                newTeach[lang] = value
                              }
                              setCanTeach(newTeach)
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Informally">Informally</SelectItem>
                              <SelectItem value="Formally with credentials">Formally with credentials</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Partner's Language Skills */}
              {(() => {
                const hasPartner = getFormData("personalInformation.partner.hasPartner") ?? false
                const partnerProf = getFormData("residencyIntentions.languageProficiency.partner") ?? {}
                
                if (!hasPartner) return null
                
                return (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium">👥 Partner's Language Skills</h4>
                    {destLangs.map((lang) => {
                      const currentLevel = Number(partnerProf[lang] || 0)
                      const proficiencyLabels = ['None', 'A1 (Beginner)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper-Intermediate)', 'C1 (Advanced)', 'C2 (Native-like)']
                      
                      return (
                        <div key={`partner_${lang}`} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Partner's {lang} proficiency</Label>
                            <span className="text-sm text-muted-foreground">{proficiencyLabels[currentLevel]}</span>
                          </div>
                          <Slider
                            value={[currentLevel]}
                            onValueChange={(value) => {
                              const newPartnerProf = { ...partnerProf, [lang]: value[0] }
                              updateFormData("residencyIntentions.languageProficiency.partner", newPartnerProf)
                            }}
                            max={6}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Other Languages */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">🔤 Other Languages You Can Teach</h4>
                <p className="text-xs text-muted-foreground">Add any other languages you can teach that aren't listed above</p>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Language name"
                    value={draftLang.language}
                    onChange={(e) => setDraftLang({...draftLang, language: e.target.value})}
                    className="flex-1"
                  />
                  <Select
                    value={draftLang.teachingCapability}
                    onValueChange={(v) => setDraftLang({...draftLang, teachingCapability: v})}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">Not interested</SelectItem>
                      <SelectItem value="Informally">Informally</SelectItem>
                      <SelectItem value="Formally with credentials">Formally with credentials</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canAddLang}
                    onClick={() => {
                      if (canAddLang && !others.some(o => o.language === draftLang.language)) {
                        setOthers([...others, draftLang])
                        setDraftLang({language: '', proficiency: 'Basic', teachingCapability: 'No'})
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                {others.length > 0 && (
                  <div className="space-y-2">
                    {others.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{lang.language}</span>
                          <span className="text-sm text-muted-foreground ml-2">({lang.teachingCapability})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOthers(others.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a destination country first to see its dominant languages and configure your language skills.</p>
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

        {/* Enhanced Citizenship acquisition methods */}
        {interestedInCitizenship && (
          <div className="space-y-4 border rounded-md p-4 mt-2">
            <h4 className="font-medium">🪪 Citizenship Options</h4>
            
            {/* Investment Route */}
            <div className="space-y-2 border rounded p-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="invest_cit" 
                  checked={getFormData("residencyIntentions.citizenshipPlans.investment.willing") ?? false}
                  onCheckedChange={(v) => updateFormData('residencyIntentions.citizenshipPlans.investment.willing', !!v)} 
                />
                <Label htmlFor="invest_cit" className="font-medium">💼 Investment route</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Investment in real estate, bonds, or business for citizenship</p>
              
              {getFormData("residencyIntentions.citizenshipPlans.investment.willing") && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-sm">Investment Amount</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={getFormData("residencyIntentions.citizenshipPlans.investment.amount") ?? ""}
                        onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.investment.amount", Number(e.target.value))}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-sm">Currency</Label>
                      <Select
                        value={getFormData("residencyIntentions.citizenshipPlans.investment.currency") ?? "USD"}
                        onValueChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.investment.currency", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Donation Route */}
            <div className="space-y-2 border rounded p-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="donate_cit" 
                  checked={getFormData("residencyIntentions.citizenshipPlans.donation.willing") ?? false}
                  onCheckedChange={(v) => updateFormData('residencyIntentions.citizenshipPlans.donation.willing', !!v)} 
                />
                <Label htmlFor="donate_cit" className="font-medium">🎁 Donation route</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Donation to national fund or development projects</p>
              
              {getFormData("residencyIntentions.citizenshipPlans.donation.willing") && (
                <div className="ml-6 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-sm">Donation Amount</Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={getFormData("residencyIntentions.citizenshipPlans.donation.amount") ?? ""}
                        onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.donation.amount", Number(e.target.value))}
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-sm">Currency</Label>
                      <Select
                        value={getFormData("residencyIntentions.citizenshipPlans.donation.currency") ?? "USD"}
                        onValueChange={(v) => updateFormData("residencyIntentions.citizenshipPlans.donation.currency", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Military Service */}
            <div className="space-y-2 border rounded p-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="mil_cit" 
                  checked={getFormData("residencyIntentions.citizenshipPlans.militaryService.willing") ?? false}
                  onCheckedChange={(v) => updateFormData('residencyIntentions.citizenshipPlans.militaryService.willing', !!v)} 
                />
                <Label htmlFor="mil_cit" className="font-medium">🪖 Military service</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Willing to perform mandatory military service for citizenship</p>
              
              {getFormData("residencyIntentions.citizenshipPlans.militaryService.willing") && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm">Maximum years of service</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={getFormData("residencyIntentions.citizenshipPlans.militaryService.maxServiceYears") ?? 2}
                    onChange={(e) => updateFormData("residencyIntentions.citizenshipPlans.militaryService.maxServiceYears", Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* Family Ties */}
            <div className="space-y-2 border rounded p-3">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="fam_cit" 
                  checked={getFormData("residencyIntentions.citizenshipPlans.familyTies.hasConnections") ?? false}
                  onCheckedChange={(v) => updateFormData('residencyIntentions.citizenshipPlans.familyTies.hasConnections', !!v)} 
                />
                <Label htmlFor="fam_cit" className="font-medium">👪 Family connections</Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Family ties that might grant citizenship eligibility</p>
              
              {getFormData("residencyIntentions.citizenshipPlans.familyTies.hasConnections") && (
                <div className="ml-6 space-y-2">
                  <Label className="text-sm">Describe your closest family relation in the country</Label>
                  <Input
                    placeholder="e.g., parent, grandparent, spouse, child"
                    value={getFormData("residencyIntentions.citizenshipPlans.familyTies.closestRelation") ?? ""}
                    onChange={(e) => updateFormData('residencyIntentions.citizenshipPlans.familyTies.closestRelation', e.target.value)}
                  />
                </div>
              )}
            </div>
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