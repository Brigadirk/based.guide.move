"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useFormStore } from "@/lib/stores"
import { useEffect } from "react"
import { MapPin, Heart, Clock, Target, Shield, AlertTriangle, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { PageHeading } from "@/components/ui/page-heading"
import { SectionFooter } from "@/components/ui/section-footer"

import { ValidationAlert } from "@/components/ui/validation-alert"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { canMoveWithinEU } from "@/lib/utils/eu-utils"
import { computeVisaStatus } from "@/lib/utils/visa-status"
import { useDebug } from "@/lib/contexts/debug-context"
 

export function ResidencyIntentions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  const { debugMode } = useDebug()

  // Destination & move
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const moveType = getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const tempDuration = getFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") ?? 0

  // Ensure a default duration of 12 months is saved when Temporary is selected
  useEffect(() => {
    if (moveType === "Temporary" && (!tempDuration || tempDuration <= 0)) {
      updateFormData(
        "residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay",
        12
      )
    }
  }, [moveType, tempDuration])

  // Physical presence intentions (now merged with center of life)

  // Citizenship interest
  const citizenshipInterest = getFormData("residencyIntentions.citizenshipInterest.interest") ?? "undecided"
  const willingToConsider = getFormData("residencyIntentions.citizenshipInterest.willingToConsider") ?? {}

  // Background disclosures
  const criminalRecord = getFormData("residencyIntentions.backgroundDisclosures.criminalRecord") ?? false
  const criminalDetails = getFormData("residencyIntentions.backgroundDisclosures.criminalDetails") ?? ""
  const taxComplianceIssues = getFormData("residencyIntentions.backgroundDisclosures.taxComplianceIssues") ?? false
  const taxComplianceDetails = getFormData("residencyIntentions.backgroundDisclosures.taxComplianceDetails") ?? ""
  const previousVisaDenials = getFormData("residencyIntentions.backgroundDisclosures.previousVisaDenials") ?? false
  const visaDenialDetails = getFormData("residencyIntentions.backgroundDisclosures.visaDenialDetails") ?? ""
  const otherRelevantFactors = getFormData("residencyIntentions.backgroundDisclosures.otherRelevantFactors") ?? ""
  // Partner disclosures (used when only partner needs a visa or both need visas)
  const p_criminalRecord = getFormData("residencyIntentions.backgroundDisclosuresPartner.criminalRecord") ?? false
  const p_criminalDetails = getFormData("residencyIntentions.backgroundDisclosuresPartner.criminalDetails") ?? ""
  const p_taxComplianceIssues = getFormData("residencyIntentions.backgroundDisclosuresPartner.taxComplianceIssues") ?? false
  const p_taxComplianceDetails = getFormData("residencyIntentions.backgroundDisclosuresPartner.taxComplianceDetails") ?? ""
  const p_previousVisaDenials = getFormData("residencyIntentions.backgroundDisclosuresPartner.previousVisaDenials") ?? false
  const p_visaDenialDetails = getFormData("residencyIntentions.backgroundDisclosuresPartner.visaDenialDetails") ?? ""

  // Motivation
  const motivation = getFormData("residencyIntentions.moveMotivation") ?? ""

  // Family coordination visibility
  const hasPartner = getFormData("personalInformation.relocationPartner") ?? false
  const dependents = getFormData("personalInformation.dependents") ?? []
  const showFamilyCoordination = !!hasPartner || (Array.isArray(dependents) && dependents.length > 0)
  const moreThanOneMover = !!hasPartner || (Array.isArray(dependents) && dependents.length > 0)

  // Visa requirement summary (facts-only)
  const userNationalities = getFormData("personalInformation.nationalities") ?? []
  const partnerNationalities = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") ?? []

  const isUserCitizen = Array.isArray(userNationalities) && destCountry
    ? userNationalities.some((n: any) => n?.country === destCountry)
    : false
  const userCanMoveEU = destCountry ? canMoveWithinEU(userNationalities, destCountry) : false
  const userNeedsVisa = !!destCountry && !(isUserCitizen || userCanMoveEU)

  const partnerNeedsVisa = hasPartner && destCountry
    ? !(
        (Array.isArray(partnerNationalities) && partnerNationalities.some((n: any) => n?.country === destCountry)) ||
        canMoveWithinEU(partnerNationalities, destCountry)
      )
    : false

  const dependentsForVisaCheck = Array.isArray(dependents)
    ? dependents.filter((d: any) => !d?.isDraft)
    : []
  const dependentVisaStatus = Array.isArray(dependentsForVisaCheck)
    ? dependentsForVisaCheck.map((dep: any) => {
        const depNats = dep?.nationalities ?? []
        const depIsCitizen = destCountry && Array.isArray(depNats) ? depNats.some((n: any) => n?.country === destCountry) : false
        const depCanMoveEU = destCountry ? canMoveWithinEU(depNats, destCountry) : false
        return { needsVisa: !!destCountry && !(depIsCitizen || depCanMoveEU) }
      })
    : []

  const anyDependentNeedsVisa = dependentVisaStatus.some(d => d.needsVisa)
  const anyDependentExists = dependentsForVisaCheck.length > 0
  const someDependentNeedsVisa = anyDependentNeedsVisa
  // Scenario flags
  const s1_userNeeds_partnerNot = !!destCountry && userNeedsVisa && !partnerNeedsVisa
  const s2_userNot_partnerNeeds = !!destCountry && !userNeedsVisa && partnerNeedsVisa
  const s3_bothNeed = !!destCountry && userNeedsVisa && partnerNeedsVisa
  const s4_noneNeed = !!destCountry && !userNeedsVisa && !partnerNeedsVisa && !anyDependentNeedsVisa
  // Adults (user+partner) do not need visas
  const adultsNoVisa = !!destCountry && !userNeedsVisa && !partnerNeedsVisa
  const adultsNeedVisa = s1_userNeeds_partnerNot || s2_userNot_partnerNeeds || s3_bothNeed
  // Scenario category string for debugging and store
  const scenarioCategory = s1_userNeeds_partnerNot
    ? "user_needs_partner_not"
    : s2_userNot_partnerNeeds
    ? "partner_needs_user_not"
    : s3_bothNeed
    ? "both_need"
    : adultsNoVisa
    ? "neither_need"
    : "unknown"

  const dependentsCategory = anyDependentNeedsVisa ? "some_dependents_need" : "no_dependents_need"
  const dependentNeedsCount = dependentVisaStatus.filter(d => d.needsVisa).length
  const isDependentsPlansVisible = anyDependentNeedsVisa
  const isDependentsNotesVisible = s1_userNeeds_partnerNot && anyDependentNeedsVisa

  // Debug: compute which sections are expected to render
  const debugVisibleSections: string[] = []
  if (destCountry) debugVisibleSections.push("Visa Requirement Summary")
  if (adultsNoVisa) debugVisibleSections.push("Center of Life")
  if (userNeedsVisa) debugVisibleSections.push("Your Requirements (user visa)")
  if (partnerNeedsVisa) debugVisibleSections.push("Partner Requirements (partner visa + citizenship interest)")
  if (adultsNeedVisa) {
    debugVisibleSections.push(
      "Move Type",
      "Physical Presence Intentions",
      "Citizenship Interest",
      "Background Disclosures",
      showFamilyCoordination ? "Family Coordination" : ""
    )
  }
  if (s1_userNeeds_partnerNot && anyDependentNeedsVisa) debugVisibleSections.push("Dependents Visa Notes (notes + school timing)")
  if (anyDependentNeedsVisa) debugVisibleSections.push("Dependents Residency/Citizenship Plans (checkbox + details)")
  // Clean empty entries
  const debugVisibleSectionsClean = debugVisibleSections.filter(Boolean)

  const handleComplete = () => {
    markSectionComplete("residency")
    onComplete()
  }

  // Validation (facts-only)
  const errors: string[] = []
  if (!destCountry) errors.push("Destination country is required")
  if (!moveType) errors.push("Type of move is required")
  if (moveType === "Temporary" && !tempDuration) errors.push("Duration of temporary stay is required")
  if (criminalRecord && !criminalDetails.trim()) errors.push("Please provide details about your criminal record")
  if (p_criminalRecord && !p_criminalDetails.trim()) errors.push("Please provide details about partner's criminal record")
  if (taxComplianceIssues && !taxComplianceDetails.trim()) errors.push("Please provide tax compliance details")
  if (p_taxComplianceIssues && !p_taxComplianceDetails.trim()) errors.push("Please provide partner's tax compliance details")
  if (previousVisaDenials && !visaDenialDetails.trim()) errors.push("Please provide visa denial details")
  if (p_previousVisaDenials && !p_visaDenialDetails.trim()) errors.push("Please provide partner's visa denial details")

  const canContinue = errors.length === 0

  

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Residency Intentions"
        description="Facts-only collection to support immigration and tax analysis."
        icon={<Globe className="w-7 h-7 text-green-600" />}
      />

      {/* Debug window: scenario + dependents (only in debug mode) */}
      {debugMode && (
        <div className="text-xs p-3 rounded-md border bg-muted/30 space-y-1">
          <div>Scenario: <span className="font-medium">{scenarioCategory}</span></div>
          <div>Dependents: <span className="font-medium">{dependentsCategory}</span></div>
          <div className="pt-1">
            <div className="font-medium">Visible sections now:</div>
            <ul className="list-disc list-inside">
              {debugVisibleSectionsClean.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
          </ul>
        </div>
          <div className="pt-1">
            <div className="font-medium">Field flags:</div>
            <ul className="list-disc list-inside">
              <li>dependents_needing_visa_count: {dependentNeedsCount}</li>
              <li>dependents_plans_visible: {isDependentsPlansVisible ? "true" : "false"}</li>
              <li>dependents_notes_visible: {isDependentsNotesVisible ? "true" : "false"}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Visa Requirement Summary */}
      {destCountry && (
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              Visa Requirement Summary
            </CardTitle>
            <p className="text-sm text-muted-foreground">Based on citizenship and EU freedom of movement</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between max-w-md">
                <span className="font-medium">You</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${userNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {userNeedsVisa ? 'Needs visa' : 'No visa needed'}
                  </span>
                  {!userNeedsVisa && (
                    <span className="text-xs text-muted-foreground">
                      ({isUserCitizen ? 'Citizen' : 'EU rights'})
                    </span>
                  )}
                </div>
              </div>
              {hasPartner && (
                <div className="flex items-center justify-between max-w-md">
                  <span className="font-medium">Partner</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${partnerNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {partnerNeedsVisa ? 'Needs visa' : 'No visa needed'}
                    </span>
                    {!partnerNeedsVisa && (
                      <span className="text-xs text-muted-foreground">
                        ({(() => {
                          const isPartnerCitizen = Array.isArray(partnerNationalities) && partnerNationalities.some((n: any) => n?.country === destCountry)
                          return isPartnerCitizen ? 'Citizen' : 'EU rights'
                        })()})
                      </span>
                    )}
                  </div>
                </div>
              )}
              {dependentVisaStatus.length > 0 && (
                <div className="space-y-2">
                  {dependentVisaStatus.map((d, i) => {
                    const dep = dependentsForVisaCheck[i]
                    const depNats = dep?.nationalities ?? []
                    const depIsCitizen = destCountry && Array.isArray(depNats) ? depNats.some((n: any) => n?.country === destCountry) : false
                    return (
                      <div key={i} className="flex items-center justify-between max-w-md">
                        <span className="font-medium">Dependent {i + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.needsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {d.needsVisa ? 'Needs visa' : 'No visa needed'}
                          </span>
                          {!d.needsVisa && (
                            <span className="text-xs text-muted-foreground">
                              ({depIsCitizen ? 'Citizen' : 'EU rights'})
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destination & Move Type */}
      {destCountry && (
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
              Move Type
          </CardTitle>
              <p className="text-sm text-muted-foreground">Provide details about your intended relocation</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Type of move *</Label>
                  <Select 
                    value={moveType} 
                    onValueChange={(value) => {
                      updateFormData("residencyIntentions.destinationCountry.moveType", value)
                      if (value === "Temporary" && (!tempDuration || tempDuration <= 0)) {
                        updateFormData(
                          "residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay",
                          12
                        )
                      }
                    }}
                  >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="undecided">Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {moveType === "Temporary" && (
              <div className="space-y-2">
                    <Label className="text-base font-medium">Intended duration (months) *</Label>
                <Input
                      type="number"
                      min="1"
                      step="1"
                  value={tempDuration}
                      onChange={(e) => updateFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay", parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      placeholder="12"
                      className="max-w-xs"
                />
              </div>
            )}

              {/* Special situation field */}
              <div className="space-y-3">
                <div>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => updateFormData("residencyIntentions.destinationCountry.showSpecialSituation", !getFormData("residencyIntentions.destinationCountry.showSpecialSituation"))}
                  >
                    I have a special situation (e.g. my partner has a different move interest).
                  </button>
                  {getFormData("residencyIntentions.destinationCountry.showSpecialSituation") && (
                    <div className="space-y-2 mt-2">
                      <Label className="text-sm">Special situation details</Label>
                      <Textarea
                        value={getFormData("residencyIntentions.destinationCountry.specialSituation") || ""}
                        onChange={(e) => updateFormData("residencyIntentions.destinationCountry.specialSituation", e.target.value)}
                        placeholder="e.g., partner will move with me the first year, then return; I have a remote work arrangement; etc."
                        rows={3}
                      />
              </div>
            )}
          </div>
                      </div>
                      </div>
              </CardContent>
            </Card>
          )}

      


      {/* Residency (unified for all who need visas) */}
      {(userNeedsVisa || partnerNeedsVisa || anyDependentNeedsVisa) && (
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/20">
            <CardTitle className="text-xl flex items-center gap-3">Residency</CardTitle>
            <p className="text-sm text-muted-foreground">Residency permit applications for those who need visas</p>
              </CardHeader>
              <CardContent className="pt-6">
            <div className="space-y-4">
              {userNeedsVisa && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="user_apply_residency"
                    checked={getFormData("residencyIntentions.userVisa.applyForResidency") ?? true}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.userVisa.applyForResidency", !!v)}
                  />
                  <Label htmlFor="user_apply_residency" className="text-sm">I will apply for residency permit</Label>
                        </div>
                      )}
              {partnerNeedsVisa && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="partner_apply_residency"
                    checked={getFormData("residencyIntentions.partnerVisa.applyForResidency") ?? true}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.applyForResidency", !!v)}
                  />
                  <Label htmlFor="partner_apply_residency" className="text-sm">Partner will apply for residency permit</Label>
                        </div>
                      )}
              {anyDependentNeedsVisa && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="dependents_apply_residency"
                    checked={anyDependentNeedsVisa ? (getFormData("residencyIntentions.dependentsVisa.applyForResidency") ?? true) : false}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.dependentsVisa.applyForResidency", !!v)}
                  />
                  <Label htmlFor="dependents_apply_residency" className="text-sm">We will apply for residency permits for dependents who need them</Label>
                        </div>
                      )}
                    </div>
              </CardContent>
            </Card>
          )}



      {/* Citizenship Interest (unified for all who need visas) */}
      {(userNeedsVisa || partnerNeedsVisa) && (
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-600" />
              Citizenship Interest
                </CardTitle>
            <p className="text-sm text-muted-foreground">Interest in eventual citizenship and alternate pathways</p>
              </CardHeader>
              <CardContent className="pt-6">
            <div className="space-y-8">
              {userNeedsVisa && (
                <div className="space-y-4">
                  <h4 className="font-medium">Your Citizenship Interest</h4>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Interest in eventual citizenship</Label>
                    <Select
                      value={citizenshipInterest}
                      onValueChange={(value) => updateFormData("residencyIntentions.citizenshipInterest.interest", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="undecided">Undecided</SelectItem>
                      </SelectContent>
                    </Select>
                      </div>
                  {citizenshipInterest === "yes" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Tell me about which citizenship pathways you might be interested in exploring:</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                    <Checkbox
                            id="consider_naturalization"
                            checked={willingToConsider.naturalization ?? true}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.naturalization", !!v)}
                          />
                          <Label htmlFor="consider_naturalization" className="text-sm">Naturalization</Label>
                    </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="consider_family"
                            checked={!!willingToConsider.familyConnections}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnections", !!v)}
                          />
                          <Label htmlFor="consider_family" className="text-sm">Family connections</Label>
                  </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="consider_investment"
                            checked={!!willingToConsider.investmentPrograms}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.investmentPrograms", !!v)}
                          />
                          <Label htmlFor="consider_investment" className="text-sm">Investment programs</Label>
                    </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="consider_military"
                            checked={!!willingToConsider.militaryService}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.militaryService", !!v)}
                          />
                          <Label htmlFor="consider_military" className="text-sm">Military service</Label>
                </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Checkbox
                            id="consider_other"
                            checked={!!willingToConsider.otherPrograms}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.otherPrograms", !!v)}
                          />
                          <Label htmlFor="consider_other" className="text-sm">Other special programs</Label>
            </div>
                              </div>
                      {willingToConsider?.familyConnections && (
                        <div className="space-y-2">
                          <Label className="text-sm">Family connection details</Label>
                          <Input
                            value={getFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnectionDetails") || ""}
                            onChange={(e) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnectionDetails", e.target.value)}
                            placeholder="e.g., spouse is a citizen, grandparent was born there"
                            className="max-w-md"
                          />
                                  </div>
                      )}
                                </div>
                  )}
                  
                  {/* Special situation for different partner interests */}
                  {hasPartner && (
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => updateFormData("residencyIntentions.citizenshipInterest.showPartnerSpecialSituation", !getFormData("residencyIntentions.citizenshipInterest.showPartnerSpecialSituation"))}
                      >
                        My partner has different citizenship interests
                      </button>
                            </div>
                  )}
              </div>
              )}

              {hasPartner && getFormData("residencyIntentions.citizenshipInterest.showPartnerSpecialSituation") && (
                <div className="space-y-4">
                  <h4 className="font-medium">Partner Citizenship Interest</h4>
                  <div className="space-y-2">
                    <Select
                      value={getFormData("residencyIntentions.partnerVisa.citizenshipInterest") ?? ""}
                      onValueChange={(v) => updateFormData("residencyIntentions.partnerVisa.citizenshipInterest", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="undecided">Undecided</SelectItem>
                      </SelectContent>
                    </Select>
                        </div>
                  {getFormData("residencyIntentions.partnerVisa.citizenshipInterest") === "yes" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Tell me about which citizenship pathways your partner might be interested in exploring:</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="partner_consider_naturalization"
                            checked={getFormData("residencyIntentions.partnerVisa.willingToConsider.naturalization") ?? true}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.naturalization", !!v)}
                          />
                          <Label htmlFor="partner_consider_naturalization" className="text-sm">Naturalization</Label>
                      </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="partner_consider_family"
                            checked={!!getFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnections")}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnections", !!v)}
                          />
                          <Label htmlFor="partner_consider_family" className="text-sm">Family connections</Label>
                            </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="partner_consider_investment"
                            checked={!!getFormData("residencyIntentions.partnerVisa.willingToConsider.investmentPrograms")}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.investmentPrograms", !!v)}
                          />
                          <Label htmlFor="partner_consider_investment" className="text-sm">Investment programs</Label>
                          </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="partner_consider_military"
                            checked={!!getFormData("residencyIntentions.partnerVisa.willingToConsider.militaryService")}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.militaryService", !!v)}
                          />
                          <Label htmlFor="partner_consider_military" className="text-sm">Military service</Label>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Checkbox
                            id="partner_consider_other"
                            checked={!!getFormData("residencyIntentions.partnerVisa.willingToConsider.otherPrograms")}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.otherPrograms", !!v)}
                          />
                          <Label htmlFor="partner_consider_other" className="text-sm">Other special programs</Label>
                        </div>
                      </div>
                      {getFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnections") && (
                          <div className="space-y-2">
                          <Label className="text-sm">Partner family connection details</Label>
                            <Textarea
                            value={getFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnectionDetails") || ""}
                            onChange={(e) => updateFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnectionDetails", e.target.value)}
                            placeholder="e.g., spouse is a citizen, grandparent was born there"
                            maxLength={280}
                              rows={3}
                            />
                          <div className="text-xs text-muted-foreground text-right">
                            {(getFormData("residencyIntentions.partnerVisa.willingToConsider.familyConnectionDetails") || "").length}/280
                          </div>
                          </div>
                        )}
                      </div>
                  )}
                </div>
                  )}
          </div>
        </CardContent>
      </Card>
          )}

      {/* Citizenship Interest for EU Rights Holders (when adults don't need visas but have EU rights) */}
      {destCountry && adultsNoVisa && (
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  Citizenship Interest
          </CardTitle>
            <p className="text-sm text-muted-foreground">Limited citizenship pathways for EU citizens/residents</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-medium">Interest in eventual citizenship</Label>
                <Select
                  value={getFormData("residencyIntentions.citizenshipInterest.interest") ?? "undecided"}
                  onValueChange={(value) => updateFormData("residencyIntentions.citizenshipInterest.interest", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="undecided">Undecided</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {getFormData("residencyIntentions.citizenshipInterest.interest") === "yes" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Tell me about which citizenship pathways you might be interested in exploring:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Checkbox
                        id="eu_consider_naturalization"
                        checked={getFormData("residencyIntentions.citizenshipInterest.willingToConsider.naturalization") ?? true}
                        onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.naturalization", !!v)}
                      />
                      <Label htmlFor="eu_consider_naturalization" className="text-sm">Naturalization</Label>
            </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                <Checkbox
                        id="eu_consider_family"
                        checked={!!getFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnections")}
                        onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnections", !!v)}
                      />
                      <Label htmlFor="eu_consider_family" className="text-sm">Family connections</Label>
                              </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                      <Checkbox
                        id="eu_consider_investment"
                        checked={!!getFormData("residencyIntentions.citizenshipInterest.willingToConsider.investmentPrograms")}
                        onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.investmentPrograms", !!v)}
                      />
                      <Label htmlFor="eu_consider_investment" className="text-sm">Investment programs</Label>
                                </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                <Checkbox
                        id="eu_consider_other"
                        checked={!!getFormData("residencyIntentions.citizenshipInterest.willingToConsider.otherPrograms")}
                        onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.otherPrograms", !!v)}
                      />
                      <Label htmlFor="eu_consider_other" className="text-sm">Other special programs</Label>
                              </div>
                  </div>
                  {getFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnections") && (
                    <div className="space-y-2">
                      <Label className="text-sm">Family connection details</Label>
                      <Textarea
                        value={getFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnectionDetails") || ""}
                        onChange={(e) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnectionDetails", e.target.value)}
                        placeholder="e.g., spouse is a citizen, grandparent was born there"
                        maxLength={280}
                        rows={3}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {(getFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnectionDetails") || "").length}/280
                      </div>
                                </div>
                              )}
                </div>
              )}
            </div>
                            </CardContent>
                          </Card>
      )}

      {/* Physical Presence Intentions (always shown after citizenship sections) */}
      {destCountry && (
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
            <CardTitle className="text-xl flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-600" />
              Physical Presence Intentions
                              </CardTitle>
            <p className="text-sm text-muted-foreground">Facts about time in destination vs outside</p>
                            </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Minimum stay requirements interest */}
              {(userNeedsVisa || partnerNeedsVisa || anyDependentNeedsVisa) && (
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="interested_in_minimum_stay"
                    checked={!!getFormData("residencyIntentions.physicalPresenceIntentions.interestedInMinimumStay")}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.physicalPresenceIntentions.interestedInMinimumStay", !!v)}
                  />
                  <Label htmlFor="interested_in_minimum_stay" className="text-base font-medium">
                    I am interested in minimum stay requirements for {(() => {
                      const visaNeededPeople = []
                      if (userNeedsVisa) visaNeededPeople.push("myself")
                      if (partnerNeedsVisa) visaNeededPeople.push("my partner")
                      if (anyDependentNeedsVisa) visaNeededPeople.push("dependents")
                      
                      if (visaNeededPeople.length === 0) return "no one"
                      if (visaNeededPeople.length === 1) return visaNeededPeople[0]
                      if (visaNeededPeople.length === 2) return visaNeededPeople.join(" and ")
                      return visaNeededPeople.slice(0, -1).join(", ") + ", and " + visaNeededPeople.slice(-1)
                    })()}
                  </Label>
                                </div>
                              )}
              
              <div className="space-y-4">
                <h5 className="font-medium">Center of Life considerations</h5>
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="maintain_ties_physical_presence"
                    checked={!!getFormData("residencyIntentions.centerOfLife.maintainOtherCountryTies")}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.centerOfLife.maintainOtherCountryTies", !!v)}
                  />
                  <div>
                    <Label htmlFor="maintain_ties_physical_presence" className="text-base font-medium">
                      I will maintain significant ties with my current country, or another country that is not the destination country, after moving.
                  </Label>
                    <p className="text-xs text-muted-foreground">Check if you'll keep a home, business, or spend substantial time in your current country</p>
                              </div>
                                </div>
                {getFormData("residencyIntentions.centerOfLife.maintainOtherCountryTies") && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Please describe the ties you will maintain</Label>
                    <Textarea
                      value={getFormData("residencyIntentions.centerOfLife.maintainOtherCountryTiesDetails") || ""}
                      onChange={(e) => updateFormData("residencyIntentions.centerOfLife.maintainOtherCountryTiesDetails", e.target.value)}
                      placeholder="e.g., second home, business ownership, frequent travel, family care duties, banking/investments"
                      rows={3}
                    />
                        </div>
            )}
              </div>
          </div>
        </CardContent>
      </Card>
          )}

      {/* Family Coordination (only when adults need visas) */}
      {adultsNeedVisa && showFamilyCoordination && (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
              Family Coordination
              {s1_userNeeds_partnerNot && (<span className="text-sm font-normal text-muted-foreground ml-2">(Your Visa Requirements)</span>)}
              {s2_userNot_partnerNeeds && (<span className="text-sm font-normal text-muted-foreground ml-2">(Partner Visa Requirements)</span>)}
              {s3_bothNeed && (<span className="text-sm font-normal text-muted-foreground ml-2">(Both Need Visas)</span>)}
              {s4_noneNeed && (<span className="text-sm font-normal text-muted-foreground ml-2">(Tax & Timing Planning)</span>)}
                </CardTitle>
            <p className="text-sm text-muted-foreground">Timing and readiness for partner/dependents</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
              {/* Dependents visa notes (only when partner does NOT need a visa) */}
              {s1_userNeeds_partnerNot && anyDependentNeedsVisa && (
                <div className="space-y-3 p-4 border rounded-lg bg-card">
                  <h4 className="font-medium">Dependents Visa Notes</h4>
                  <div className="space-y-2">
                    {dependentVisaStatus.map((d, i) => d.needsVisa && (
                      <div key={i} className="space-y-2 p-3 border rounded-md">
                        <Label className="text-sm">Dependent {i + 1} notes</Label>
                        <Textarea
                          value={getFormData(`residencyIntentions.dependentsVisa.${i}.notes`) ?? ""}
                          onChange={(e) => updateFormData(`residencyIntentions.dependentsVisa.${i}.notes`, e.target.value)}
                          rows={2}
                        />
                        <Label className="text-sm">School timing considerations</Label>
                        <Input
                          value={getFormData(`residencyIntentions.dependentsVisa.${i}.schoolTiming`) ?? ""}
                          onChange={(e) => updateFormData(`residencyIntentions.dependentsVisa.${i}.schoolTiming`, e.target.value)}
                          placeholder="e.g., move during summer break"
                        />
                          </div>
                    ))}
                          </div>
                          </div>
              )}
              {!s4_noneNeed && (
                    <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Application timing preference{s3_bothNeed ? " *" : ""}
                        </Label>
                  <Select
                    value={getFormData("residencyIntentions.familyCoordination.applicationTiming") || ""}
                    onValueChange={(value) => updateFormData("residencyIntentions.familyCoordination.applicationTiming", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="together">Apply together</SelectItem>
                      <SelectItem value="sequential">Apply sequentially</SelectItem>
                      <SelectItem value="undecided">Undecided</SelectItem>
                    </SelectContent>
                  </Select>
                  {s3_bothNeed && (
                    <p className="text-xs text-muted-foreground">
                      Coordination is critical when both partners need visas to ensure successful applications.
                    </p>
                  )}
                      </div>
              )}
              <div className="space-y-2">
                <Label className="text-base font-medium">Special family circumstances</Label>
                    <Textarea
                  value={getFormData("residencyIntentions.familyCoordination.specialFamilyCircumstances") || ""}
                  onChange={(e) => updateFormData("residencyIntentions.familyCoordination.specialFamilyCircumstances", e.target.value)}
                  placeholder="Briefly describe any special circumstances"
                      rows={3}
                    />
                  </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">School timing considerations (if children)</Label>
                <Input
                  value={getFormData("residencyIntentions.familyCoordination.schoolTimingConsiderations") || ""}
                  onChange={(e) => updateFormData("residencyIntentions.familyCoordination.schoolTimingConsiderations", e.target.value)}
                  placeholder="e.g., prefer to move during summer break"
                  className="max-w-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

      {/* Exploratory Visits (only when adults need visas) */}
      {adultsNeedVisa && (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
              Exploratory Visits {(s1_userNeeds_partnerNot || s3_bothNeed) && (<span className="text-red-500">*</span>)}
                </CardTitle>
            <p className="text-sm text-muted-foreground">
              {(s1_userNeeds_partnerNot || s3_bothNeed) 
                ? "Planning visits before relocation - important for visa applications"
                : "Planning visits before your main relocation"}
            </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox
                      id="open_visiting"
                  checked={getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.residencyPlans.openToVisiting", !!v)}
                    />
                    <Label htmlFor="open_visiting" className="text-base font-medium">
                  {moreThanOneMover ? "I or we" : "I"} plan or {moreThanOneMover ? "are" : "I am"} open to making exploratory visits before relocating
                    </Label>
                  </div>

              {(getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false) && (
                    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
                  {(s1_userNeeds_partnerNot || s3_bothNeed) && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>For visa applicants:</strong> Exploratory visits help demonstrate genuine intention to relocate and can strengthen your visa application.
                      </p>
                    </div>
                  )}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tell us about your visit plans</Label>
                        <Textarea
                          className="resize-none text-sm"
                          placeholder="e.g., I want to visit in spring to find housing and check out schools for my kids. Planning 2-3 weeks initially, maybe multiple trips..."
                          maxLength={280}
                          rows={4}
                          value={getFormData("residencyIntentions.residencyPlans.exploratoryVisits.details") || ""}
                          onChange={(e) => updateFormData("residencyIntentions.residencyPlans.exploratoryVisits.details", e.target.value)}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Be specific about timing, purpose, and duration</span>
                          <span>{(getFormData("residencyIntentions.residencyPlans.exploratoryVisits.details") || "").length}/280</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

      {/* Background Disclosures (only when adults need visas) */}
      {adultsNeedVisa && (
          <Card className="shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-600" />
              Background Disclosures
              {s1_userNeeds_partnerNot && (<span className="text-sm font-normal ml-2">(For Your Visa)</span>)}
              {s2_userNot_partnerNeeds && (<span className="text-sm font-normal ml-2">(For Partner's Visa)</span>)}
              {s3_bothNeed && (<span className="text-sm font-normal ml-2">(For Both of You)</span>)}
              </CardTitle>
            <p className="text-sm text-muted-foreground">
              Critical disclosures required for visa applications
            </p>
            </CardHeader>
            <CardContent className="pt-6">
            <div className="space-y-8">
              {(s1_userNeeds_partnerNot || s3_bothNeed) && (
              <div className="space-y-4">
                  <h4 className="font-medium">Your Disclosures</h4>
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="u_criminal" checked={criminalRecord} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.criminalRecord", !!v)} />
                    <Label htmlFor="u_criminal" className="text-base font-medium">I have a criminal record</Label>
                  </div>
                  {criminalRecord && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Please provide brief details *</Label>
                      <Textarea placeholder="Offense type, year, jurisdiction, sentence or disposition (e.g., expunged)" value={criminalDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.criminalDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="u_tax" checked={taxComplianceIssues} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.taxComplianceIssues", !!v)} />
                    <Label htmlFor="u_tax" className="text-base font-medium">I have tax compliance issues</Label>
                  </div>
                  {taxComplianceIssues && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Tax compliance details</Label>
                      <Textarea placeholder="Brief details (missed filings, outstanding obligations, etc.)" value={taxComplianceDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.taxComplianceDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="u_denials" checked={previousVisaDenials} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.previousVisaDenials", !!v)} />
                  <div>
                      <Label htmlFor="u_denials" className="text-base font-medium">I have previous visa denials/immigration issues</Label>
                      <p className="text-xs text-muted-foreground mt-1">Must be disclosed and can significantly impact new applications</p>
                  </div>
                </div>
                  {previousVisaDenials && (
                  <div className="space-y-2">
                      <Label className="text-base font-medium">Details about previous denials/issues</Label>
                      <Textarea value={visaDenialDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.visaDenialDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  </div>
                )}

              {(s2_userNot_partnerNeeds || s3_bothNeed) && (
                <div className="space-y-4">
                  <h4 className="font-medium">Partner Disclosures</h4>
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="p_criminal" checked={p_criminalRecord} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.criminalRecord", !!v)} />
                    <Label htmlFor="p_criminal" className="text-base font-medium">Partner has a criminal record</Label>
                  </div>
                  {p_criminalRecord && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Partner criminal record details *</Label>
                      <Textarea placeholder="Offense type, year, jurisdiction, sentence or disposition (e.g., expunged)" value={p_criminalDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.criminalDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="p_tax" checked={p_taxComplianceIssues} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.taxComplianceIssues", !!v)} />
                    <Label htmlFor="p_tax" className="text-base font-medium">Partner has tax compliance issues</Label>
                  </div>
                  {p_taxComplianceIssues && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Partner tax compliance details</Label>
                      <Textarea placeholder="Brief details (missed filings, outstanding obligations, etc.)" value={p_taxComplianceDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.taxComplianceDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                    <Checkbox id="p_denials" checked={p_previousVisaDenials} onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.previousVisaDenials", !!v)} />
                  <div>
                      <Label htmlFor="p_denials" className="text-base font-medium">Partner has previous visa denials/immigration issues</Label>
                      <p className="text-xs text-muted-foreground mt-1">Must be disclosed and can significantly impact new applications</p>
                  </div>
                </div>
                  {p_previousVisaDenials && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Partner previous denials/issues details</Label>
                      <Textarea value={p_visaDenialDetails} onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosuresPartner.visaDenialDetails", e.target.value)} rows={4} />
                    </div>
                  )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      )}

      {/* Move Motivation */}
      <Card className="shadow-sm border-l-4 border-l-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Heart className="w-6 h-6 text-amber-600" />
            Motivation
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your motivation for moving</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Briefly describe your motivation for moving</Label>
              <Textarea
                value={motivation}
                onChange={(e) => updateFormData("residencyIntentions.moveMotivation", e.target.value)}
                placeholder="Brief statement only"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Move timing and readiness</Label>
              <Textarea
                value={getFormData("residencyIntentions.moveTiming") || ""}
                onChange={(e) => updateFormData("residencyIntentions.moveTiming", e.target.value)}
                placeholder="e.g., planning to move in 6 months, just exploring options for future, have specific job offer starting January, etc."
                rows={3}
              />
            </div>
            
          </div>
        </CardContent>
      </Card>


      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {/* Validation Alert */}
            <ValidationAlert 
              errors={errors} 
              isComplete={canContinue}
            />

            {/* Section Footer */}
            <SectionFooter
              onCheckInfo={() => showSectionInfo("residency")}
              isCheckingInfo={isCheckingInfo}
              sectionId="residency"
              onContinue={handleComplete}
              canContinue={canContinue}
              nextSectionName={"Education"}
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