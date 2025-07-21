"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, UserPlus } from "lucide-react"
import countryInfo from "@/data/country_info.json"
import { useFormData } from "@/lib/hooks/use-form-data"
import { SectionHint } from "@/components/ui/section-hint"

// Hooks can't run outside components – compute once as a plain constant.
const COUNTRY_LIST = Object.keys(countryInfo).sort()

const RESIDENCY_OPTIONS = ["Citizen", "Permanent Resident", "Temporary Resident"] as const
const MARITAL_OPTIONS = [
  "Single",
  "Official Partnership",
  "Married",
  "Divorced",
  "Widowed",
] as const

export function PersonalInformation({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData } = useFormData()

  /* ------------------------------------------------------------------ */
  /* helpers                                                            */
  /* ------------------------------------------------------------------ */
  const natList: { country: string; willingToRenounce: boolean }[] =
    getFormData("personalInformation.nationalities") ?? []

  const updateNatList = (next: typeof natList) =>
    updateFormData("personalInformation.nationalities", next)

  const nationalityExists = (c: string) =>
    natList.some((n) => n.country === c)

  // partner selector temporary state (unconditional to respect hook rules)
  const [partnerSel, setPartnerSel] = useState("")

  /* ------------------------------------------------------------------ */
  /* date of birth                                                      */
  /* ------------------------------------------------------------------ */
  const dob = getFormData("personalInformation.dateOfBirth") || ""
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFormData("personalInformation.dateOfBirth", e.target.value)

  /* ------------------------------------------------------------------ */
  /* current residence                                                  */
  /* ------------------------------------------------------------------ */
  const curCountry = getFormData(
    "personalInformation.currentResidency.country"
  ) as string
  const curStatus =
    (getFormData(
      "personalInformation.currentResidency.status"
    ) as string) || RESIDENCY_OPTIONS[0]

  const tempDuration =
    getFormData("personalInformation.currentResidency.duration") || ""

  /* ------------------------------------------------------------------ */
  /* marital status                                                     */
  /* ------------------------------------------------------------------ */
  const maritalStatus: string =
    getFormData("personalInformation.maritalStatus") || MARITAL_OPTIONS[0]

  const setMarital = (val: string) =>
    updateFormData("personalInformation.maritalStatus", val)

  // explanation when status + partner type conflict
  const relType =
    getFormData(
      "personalInformation.relocationPartnerInfo.relationshipType"
    ) || ""

  const needsExplain =
    (relType === "Spouse" && maritalStatus !== "Married") ||
    (["Civil Partner", "Domestic Partner"].includes(relType) &&
      maritalStatus !== "Official Partnership")

  const explainVal =
    getFormData("personalInformation.enduringMaritalStatusInfo") || ""

  /* ------------------------------------------------------------------ */
  /* local UI state                                                     */
  /* ------------------------------------------------------------------ */
  const [addCountry, setAddCountry] = useState("")

  /* ------------------------------------------------------------------ */
  /* derived                                                             */
  /* ------------------------------------------------------------------ */
  const canContinue =
    dob &&
    curCountry &&
    curStatus &&
    natList.length > 0 &&
    maritalStatus

  /* ---------------- Dependents helpers ---------------- */
  type DepNat = { country: string; willingToRenounce: boolean }
  type Dependent = {
    relationship: string
    dateOfBirth: string
    student: boolean
    nationalities: DepNat[]
  }
  const depList: Dependent[] =
    getFormData("personalInformation.dependents") ?? []
  const updateDepList = (next: Dependent[]) =>
    updateFormData("personalInformation.dependents", next)

  const REL_OPTIONS = [
    "Child",
    "Step-child",
    "Legal ward",
    "Parent",
    "Sibling",
    "Other",
  ] as const

  /* ---------------- Dependent card component ---------------- */
  const DependentItem = ({ dep, idx }: { dep: Dependent; idx: number }) => {
    const exists = (c: string) =>
      dep.nationalities.some((n) => n.country === c)

    const updateOne = (next: Partial<Dependent>) => {
      const copy = [...depList]
      copy[idx] = { ...copy[idx], ...next }
      updateDepList(copy)
    }

    const updateNat = (next: DepNat[]) =>
      updateOne({ nationalities: next })

    return (
      <div className="space-y-4 border rounded-md p-4">
        {/* Relationship */}
        <div className="space-y-1">
          <Label>Relationship *</Label>
          <Select
            value={
              REL_OPTIONS.includes(dep.relationship as any)
                ? dep.relationship
                : "Other"
            }
            onValueChange={(v) => updateOne({ relationship: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {REL_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dep.relationship === "Other" && (
            <Input
              className="mt-2"
              placeholder="Describe relationship"
              value={
                REL_OPTIONS.includes(dep.relationship as any)
                  ? ""
                  : dep.relationship
              }
              onChange={(e) =>
                updateOne({ relationship: e.target.value })
              }
            />
          )}
        </div>

        {/* Date of birth */}
        <div className="space-y-1">
          <Label>Date of birth *</Label>
          <Input
            type="date"
            value={dep.dateOfBirth}
            onChange={(e) =>
              updateOne({ dateOfBirth: e.target.value })
            }
          />
        </div>

        {/* Student flag */}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`student_${idx}`}
            checked={dep.student}
            onCheckedChange={(v) => updateOne({ student: !!v })}
          />
          <Label htmlFor={`student_${idx}`}>Full-time student</Label>
        </div>

        {/* Citizenship list */}
        <div className="space-y-2">
          <Label>Citizenship(s) *</Label>
          <p className="text-xs text-muted-foreground mb-2">Mark "willing to renounce" if you would consider giving up a citizenship in order to avoid exit taxes or dual-citizenship restrictions in your future country.</p>

          <div className="flex gap-2">
            <Select value={partnerSel} onValueChange={setPartnerSel}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.filter((c) => !exists(c)).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!partnerSel}
              onClick={() => {
                updateNat([
                  ...dep.nationalities,
                  { country: partnerSel, willingToRenounce: false },
                ])
                setPartnerSel("")
              }}
            >
              Add
            </Button>
          </div>

          {dep.nationalities.length > 0 && (
            <div className="space-y-2">
              {dep.nationalities.map((n) => (
                <div
                  key={n.country}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{n.country}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`d_renounce_${idx}_${n.country}`}
                        checked={n.willingToRenounce}
                        onCheckedChange={(v) => {
                          n.willingToRenounce = !!v
                          updateNat([...dep.nationalities])
                        }}
                      />
                      <Label htmlFor={`d_renounce_${idx}_${n.country}`}>
                        Willing to renounce
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateNat(
                          dep.nationalities.filter(
                            (m) => m.country !== n.country
                          )
                        )
                      }
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remove button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            updateDepList(depList.filter((_, i) => i !== idx))
          }
        >
          Remove dependent
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <SectionHint>
          Accurate personal and family information enables country-specific tax residency analysis, spousal/dependent visa eligibility checks, and tailored planning based on your household composition.
        </SectionHint>

        {/* ---------------- DOB ---------------- */}
        <div className="space-y-2">
          <Label>Date of birth *</Label>
          <div className="relative flex items-center">
            <Input
              type="date"
              value={dob}
              onChange={handleDobChange}
              className="pr-10"
            />
            <CalendarDays className="absolute right-2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* ---------------- Current residence ---------------- */}
        <div className="space-y-4">
          <Label className="block">Current residence *</Label>

          {/* Country */}
          <Select
            value={curCountry}
            onValueChange={(val) =>
              updateFormData("personalInformation.currentResidency.country", val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={curStatus}
            onValueChange={(val) =>
              updateFormData("personalInformation.currentResidency.status", val)
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESIDENCY_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Duration – only for temporary residents */}
          {curStatus === "Temporary Resident" && (
            <Input
              type="number"
              step="0.5"
              min={0}
              className="mt-2"
              placeholder="Years at current residence"
              value={tempDuration}
              onChange={(e) =>
                updateFormData(
                  "personalInformation.currentResidency.duration",
                  e.target.value
                )
              }
            />
          )}
        </div>

        {/* ---------------- Citizenship(s) ---------------- */}
        <div className="space-y-4">
          <Label className="block">Citizenship(s) *</Label>
          <p className="text-xs text-muted-foreground mb-2">Mark "willing to renounce" if you would consider giving up a citizenship in order to avoid exit taxes or dual-citizenship restrictions in your future country.</p>

          {/* add form */}
          <div className="flex gap-2">
            <Select
              value={addCountry}
              onValueChange={(v) => setAddCountry(v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.filter((c) => !nationalityExists(c)).map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Button
              disabled={!addCountry}
              onClick={() => {
                updateNatList([
                  ...natList,
                  { country: addCountry, willingToRenounce: false },
                ])
                setAddCountry("")
              }}
            >
              Add
            </Button>
          </div>

          {/* list */}
          {natList.length > 0 && (
            <div className="space-y-2">
              {natList.map((nat) => (
                <div
                  key={nat.country}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{nat.country}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        id={`renounce_${nat.country}`}
                        checked={nat.willingToRenounce}
                        onCheckedChange={(val) => {
                          nat.willingToRenounce = !!val
                          updateNatList([...natList])
                        }}
                      />
                      <Label htmlFor={`renounce_${nat.country}`}>
                        Willing to renounce
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateNatList(
                          natList.filter((n) => n.country !== nat.country)
                        )
                      }
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------- Marital status ---------------- */}
        <div className="space-y-4">
          <Label className="block">Marital status *</Label>
          <Select value={maritalStatus} onValueChange={setMarital}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {needsExplain && (
            <div className="space-y-2">
              <Label>Please explain your situation *</Label>
              <Textarea
                value={explainVal}
                onChange={(e) =>
                  updateFormData(
                    "personalInformation.enduringMaritalStatusInfo",
                    e.target.value
                  )
                }
              />
            </div>
          )}
        </div>

        {/* ---------------- Partner ---------------- */}
        <div className="space-y-4">
          <Label className="block">Relocation partner</Label>

          {/* Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_partner"
              checked={getFormData("personalInformation.relocationPartner") || false}
              onCheckedChange={(v) =>
                updateFormData("personalInformation.relocationPartner", !!v)
              }
            />
            <Label htmlFor="has_partner">I have a partner who will relocate with me</Label>
          </div>

          {getFormData("personalInformation.relocationPartner") && (
            <div className="space-y-4 border rounded-md p-4">
              {/* relationship type */}
              <div className="space-y-2">
                <Label>Relationship type *</Label>
                {/*
                  Original list: Unmarried Partner, Spouse, Fiancé(e), Civil Partner,
                  Cohabiting Partner, Common-law Partner, Conjugal Partner,
                  Domestic Partner, Other
                */}
                {(() => {
                  const rel = getFormData("personalInformation.relocationPartnerInfo.relationshipType") || ""
                  const setRel = (val: string) =>
                    updateFormData("personalInformation.relocationPartnerInfo.relationshipType", val)
                  const REL_TYPES = [
                    "Unmarried Partner",
                    "Spouse",
                    "Fiancé(e)",
                    "Civil Partner",
                    "Cohabiting Partner",
                    "Common-law Partner",
                    "Conjugal Partner",
                    "Domestic Partner",
                    "Other",
                  ] as const
                  return (
                    <>
                      <Select value={REL_TYPES.includes(rel as any) ? rel : "Other"} onValueChange={setRel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {REL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rel === "Other" && (
                        <Input
                          className="mt-2"
                          placeholder="Describe relationship"
                          value={
                            REL_TYPES.includes(rel as any) ? "" : rel
                          }
                          onChange={(e) => setRel(e.target.value)}
                        />
                      )}
                    </>
                  )
                })()}
              </div>

              {/* same-sex */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="same_sex"
                  checked={getFormData("personalInformation.relocationPartnerInfo.sameSex") || false}
                  onCheckedChange={(v) =>
                    updateFormData("personalInformation.relocationPartnerInfo.sameSex", !!v)
                  }
                />
                <Label htmlFor="same_sex">This is a same-sex relationship</Label>
              </div>

              {/* durations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full relationship duration (years) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={
                      getFormData(
                        "personalInformation.relocationPartnerInfo.fullRelationshipDuration"
                      ) || ""
                    }
                    onChange={(e) =>
                      updateFormData(
                        "personalInformation.relocationPartnerInfo.fullRelationshipDuration",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Official relationship duration (years) *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={
                      getFormData(
                        "personalInformation.relocationPartnerInfo.officialRelationshipDuration"
                      ) || ""
                    }
                    onChange={(e) =>
                      updateFormData(
                        "personalInformation.relocationPartnerInfo.officialRelationshipDuration",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* partner citizenship(s) */}
              <div className="space-y-4">
                <Label className="block">Partner citizenship(s) *</Label>
                <p className="text-xs text-muted-foreground mb-2">Renouncing a citizenship can sometimes simplify your partner's visa path and mitigate tax obligations. Tick the box if this is an option.</p>

                {(() => {
                  // ---------- helper state ----------
                  const partnerList: { country: string; willingToRenounce: boolean }[] =
                    getFormData(
                      "personalInformation.relocationPartnerInfo.partnerNationalities"
                    ) || []

                  const updatePartnerList = (next: typeof partnerList) =>
                    updateFormData(
                      "personalInformation.relocationPartnerInfo.partnerNationalities",
                      next
                    )

                  const exists = (c: string) =>
                    partnerList.some((n) => n.country === c)

                  return (
                    <>
                      {/* add form */}
                      <div className="flex gap-2">
                        <Select value={partnerSel} onValueChange={setPartnerSel}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRY_LIST.filter((c) => !exists(c)).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          disabled={!partnerSel}
                          onClick={() => {
                            updatePartnerList([
                              ...partnerList,
                              { country: partnerSel, willingToRenounce: false },
                            ])
                            setPartnerSel("")
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {/* display list */}
                      {partnerList.length > 0 ? (
                        <div className="space-y-2">
                          {partnerList.map((nat) => (
                            <div
                              key={nat.country}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <span>{nat.country}</span>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`p_renounce_${nat.country}`}
                                    checked={nat.willingToRenounce}
                                    onCheckedChange={(v) => {
                                      nat.willingToRenounce = !!v
                                      updatePartnerList([...partnerList])
                                    }}
                                  />
                                  <Label htmlFor={`p_renounce_${nat.country}`}>
                                    Willing to renounce
                                  </Label>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    updatePartnerList(
                                      partnerList.filter(
                                        (n) => n.country !== nat.country
                                      )
                                    )
                                  }
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-destructive">
                          ⚠️ Partner must have at least one citizenship
                        </p>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Dependents ---------------- */}
        <div className="space-y-4">
          <Label className="block">Dependents</Label>

          <Button
            variant="outline"
            onClick={() =>
              updateDepList([
                ...depList,
                {
                  relationship: "",
                  dateOfBirth: "",
                  student: false,
                  nationalities: [],
                },
              ])
            }
          >
            Add dependent
          </Button>

          {depList.length > 0 && (
            <div className="space-y-4">
              {depList.map((dep, idx) => (
                <DependentItem key={idx} dep={dep} idx={idx} />
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  updateDepList([
                    ...depList,
                    {
                      relationship: "",
                      dateOfBirth: "",
                      student: false,
                      nationalities: [],
                    },
                  ])
                }
              >
                Add another dependent
              </Button>
            </div>
          )}
        </div>

        {/* ---------------- Continue ---------------- */}
        <Button
          disabled={!canContinue}
          onClick={onComplete}
          className="mt-4 w-full"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  )
} 