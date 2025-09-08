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
 

export function ResidencyIntentions({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()

  // Destination & move
  const destCountry = getFormData("residencyIntentions.destinationCountry.country") ?? ""
  const moveType = getFormData("residencyIntentions.destinationCountry.moveType") ?? ""
  const tempDuration = getFormData("residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay") ?? 0
  const currentlyInDestination = getFormData("residencyIntentions.destinationCountry.currentlyInDestination") ?? false
  const currentStatus = getFormData("residencyIntentions.destinationCountry.currentStatus") ?? ""

  // Ensure a default duration of 12 months is saved when Temporary is selected
  useEffect(() => {
    if (moveType === "Temporary" && (!tempDuration || tempDuration <= 0)) {
      updateFormData(
        "residencyIntentions.destinationCountry.intendedTemporaryDurationOfStay",
        12
      )
    }
  }, [moveType, tempDuration])

  // Physical presence intentions
  const minDays = getFormData("residencyIntentions.physicalPresenceIntentions.minDaysInDestinationPerYear") ?? undefined
  const maxDaysOutside = getFormData("residencyIntentions.physicalPresenceIntentions.maxDaysOutsidePerYear") ?? undefined
  const flexibleOnMinimumStay = getFormData("residencyIntentions.physicalPresenceIntentions.flexibleOnMinimumStay") ?? false
  const plansForMaintainingOtherTies = getFormData("residencyIntentions.physicalPresenceIntentions.plansForMaintainingOtherCountryTies") ?? ""

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

  // Motivation
  const motivation = getFormData("residencyIntentions.moveMotivation") ?? ""
  const motivationDetails = getFormData("residencyIntentions.moveMotivationDetails") ?? ""

  // Family coordination visibility
  const hasPartner = getFormData("personalInformation.relocationPartner") ?? false
  const dependents = getFormData("personalInformation.dependents") ?? []
  const showFamilyCoordination = !!hasPartner || (Array.isArray(dependents) && dependents.length > 0)

  // Visa requirement summary (facts-only)
  const userNationalities = getFormData("personalInformation.nationalities") ?? []
  const partnerNationalities = getFormData("personalInformation.partner.partnerNationalities") ?? []

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

  const dependentVisaStatus = Array.isArray(dependents)
    ? dependents.map((dep: any) => {
        const depNats = dep?.nationalities ?? []
        const depIsCitizen = destCountry && Array.isArray(depNats) ? depNats.some((n: any) => n?.country === destCountry) : false
        const depCanMoveEU = destCountry ? canMoveWithinEU(depNats, destCountry) : false
        return { needsVisa: !!destCountry && !(depIsCitizen || depCanMoveEU) }
      })
    : []

  const anyDependentNeedsVisa = dependentVisaStatus.some(d => d.needsVisa)
  // Scenario flags
  const s1_userNeeds_partnerNot = !!destCountry && userNeedsVisa && !partnerNeedsVisa
  const s2_userNot_partnerNeeds = !!destCountry && !userNeedsVisa && partnerNeedsVisa
  const s3_bothNeed = !!destCountry && userNeedsVisa && partnerNeedsVisa
  const s4_noneNeed = !!destCountry && !userNeedsVisa && !partnerNeedsVisa && !anyDependentNeedsVisa

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

  const canContinue = errors.length === 0

  

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading 
        title="Residency Intentions"
        description="Facts-only collection to support immigration and tax analysis."
        icon={<Globe className="w-7 h-7 text-green-600" />}
      />

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
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${userNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {userNeedsVisa ? 'Needs visa' : 'No visa needed'}
                </span>
        </div>
              {hasPartner && (
                <div className="flex items-center justify-between max-w-md">
                  <span className="font-medium">Partner</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${partnerNeedsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {partnerNeedsVisa ? 'Needs visa' : 'No visa needed'}
                  </span>
                </div>
              )}
              {dependentVisaStatus.length > 0 && (
                <div className="space-y-2">
                  {dependentVisaStatus.map((d, i) => (
                    <div key={i} className="flex items-center justify-between max-w-md">
                      <span className="font-medium">Dependent {i + 1}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${d.needsVisa ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {d.needsVisa ? 'Needs visa' : 'No visa needed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      

      {destCountry && (
        <>
          {/* Destination & Move Type */}
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
                Destination & Move Type
          </CardTitle>
              <p className="text-sm text-muted-foreground">Provide details about your intended relocation</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Currently in destination?</Label>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                <Checkbox
                  id="currently_in_destination"
                  checked={!!currentlyInDestination}
                  onCheckedChange={(v) => updateFormData("residencyIntentions.destinationCountry.currentlyInDestination", !!v)}
                />
                <Label htmlFor="currently_in_destination" className="text-sm">I am currently in the destination country</Label>
              </div>
            </div>
            {currentlyInDestination && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Current status in destination</Label>
                <Input
                  value={currentStatus}
                  onChange={(e) => updateFormData("residencyIntentions.destinationCountry.currentStatus", e.target.value)}
                  placeholder="e.g., visitor, student, worker"
                  className="max-w-md"
                />
              </div>
            )}
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
                      <SelectItem value="Digital Nomad">Digital Nomad</SelectItem>
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

            {moveType === "Digital Nomad" && (
              <div className="p-4 rounded-lg border bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Some countries offer special visas for remote workers with minimum income requirements.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



          {/* Physical Presence Intentions (always shown; simplified in Scenario 1) */}
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
                      <div className="space-y-2">
                  <Label className="text-base font-medium">Minimum days per year willing to spend in destination</Label>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={minDays ?? ""}
                    onChange={(e) => updateFormData("residencyIntentions.physicalPresenceIntentions.minDaysInDestinationPerYear", e.target.value === "" ? undefined : Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                    className="max-w-xs"
                    placeholder="e.g., 183"
                  />
                      </div>
                      <div className="space-y-2">
                  <Label className="text-base font-medium">Maximum days per year willing to spend outside destination</Label>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={maxDaysOutside ?? ""}
                    onChange={(e) => updateFormData("residencyIntentions.physicalPresenceIntentions.maxDaysOutsidePerYear", e.target.value === "" ? undefined : Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                    className="max-w-xs"
                    placeholder="e.g., 182"
                  />
                      </div>
                {!s4_noneNeed && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                    <Checkbox
                      id="flexible_on_minimum"
                      checked={!!flexibleOnMinimumStay}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.physicalPresenceIntentions.flexibleOnMinimumStay", !!v)}
                    />
                    <Label htmlFor="flexible_on_minimum" className="text-sm">Flexible on minimum stay requirements</Label>
                    </div>
                )}
                    <div className="space-y-2">
                  <Label className="text-base font-medium">Plans for maintaining other country ties</Label>
                      <Textarea
                    value={plansForMaintainingOtherTies}
                    onChange={(e) => updateFormData("residencyIntentions.physicalPresenceIntentions.plansForMaintainingOtherCountryTies", e.target.value)}
                    placeholder="Briefly describe any ties you plan to maintain outside the destination (property, work, family, etc.)"
                        rows={3}
                      />
                    </div>
                </div>
              </CardContent>
            </Card>


          

          

          

          

          {/* Citizenship Interest (limited in Scenario 1) */}
            <Card className="shadow-sm border-l-4 border-l-orange-500">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                  Citizenship Interest
          </CardTitle>
              <p className="text-sm text-muted-foreground">Interest in eventual citizenship and alternate pathways</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
              <Checkbox
                      id="consider_family"
                      checked={!!willingToConsider.familyConnections}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.familyConnections", !!v)}
                    />
                    <Label htmlFor="consider_family" className="text-sm">Family connections</Label>
            </div>
                  {!s4_noneNeed && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                <Checkbox
                      id="consider_investment"
                      checked={!!willingToConsider.investmentPrograms}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.investmentPrograms", !!v)}
                    />
                    <Label htmlFor="consider_investment" className="text-sm">Investment programs</Label>
                                </div>
                              )}
                  {!s4_noneNeed && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                                <Checkbox
                      id="consider_military"
                      checked={!!willingToConsider.militaryService}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.militaryService", !!v)}
                    />
                    <Label htmlFor="consider_military" className="text-sm">Military service</Label>
                                </div>
                              )}
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                  <Checkbox
                      id="consider_other"
                      checked={!!willingToConsider.otherPrograms}
                      onCheckedChange={(v) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.otherPrograms", !!v)}
                    />
                    <Label htmlFor="consider_other" className="text-sm">Other special programs</Label>
                </div>
                                </div>
                {willingToConsider?.otherPrograms && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Other program details</Label>
                    <Textarea
                      value={willingToConsider?.otherDetails || ""}
                      onChange={(e) => updateFormData("residencyIntentions.citizenshipInterest.willingToConsider.otherDetails", e.target.value)}
                      placeholder="Briefly describe"
                      rows={3}
                    />
                                </div>
            )}
          </div>
        </CardContent>
      </Card>

        </>
                )}

          {/* Family Coordination */}
          {showFamilyCoordination && (
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  Family Coordination
                </CardTitle>
                <p className="text-sm text-muted-foreground">Timing and readiness for partner/dependents</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Scenario-specific hint title */}
                  {s2_userNot_partnerNeeds && (
                    <div className="text-sm text-muted-foreground -mt-2">Your Tax Residency Planning (You are a citizen)</div>
                  )}
                  {s1_userNeeds_partnerNot && (
                    <div className="text-sm text-muted-foreground -mt-2">Your Visa Presence (You need a visa)</div>
                  )}
                  {/* Scenario 2: You are citizen; partner needs visa */}
                  {s2_userNot_partnerNeeds && (
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium">Partner Visa Requirements</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <Checkbox
                            id="partner_apply_residency"
                            checked={getFormData("residencyIntentions.partnerVisa.applyForResidency") ?? false}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.partnerVisa.applyForResidency", !!v)}
                          />
                          <Label htmlFor="partner_apply_residency" className="text-sm">Partner will apply for residency permit</Label>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Partner physical presence target (days/year)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="365"
                            value={getFormData("residencyIntentions.partnerVisa.physicalPresenceDays") ?? ""}
                            onChange={(e) => updateFormData("residencyIntentions.partnerVisa.physicalPresenceDays", e.target.value === "" ? undefined : Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                            className="max-w-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Partner exploratory visits (optional)</Label>
                          <Textarea
                            value={getFormData("residencyIntentions.partnerVisa.exploratoryVisits.details") ?? ""}
                            onChange={(e) => updateFormData("residencyIntentions.partnerVisa.exploratoryVisits.details", e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Partner citizenship pathway interest</Label>
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
                      </div>
                    </div>
                  )}

                  {/* Scenario 1: You need visa; partner is citizen */}
                  {s1_userNeeds_partnerNot && (
                    <div className="space-y-4 p-4 border rounded-lg bg-card">
                      <h4 className="font-medium">Your Visa Requirements</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <Checkbox
                            id="user_apply_residency"
                            checked={getFormData("residencyIntentions.userVisa.applyForResidency") ?? false}
                            onCheckedChange={(v) => updateFormData("residencyIntentions.userVisa.applyForResidency", !!v)}
                          />
                          <Label htmlFor="user_apply_residency" className="text-sm">I will apply for residency permit</Label>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">My physical presence target (days/year)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="365"
                            value={getFormData("residencyIntentions.userVisa.physicalPresenceDays") ?? ""}
                            onChange={(e) => updateFormData("residencyIntentions.userVisa.physicalPresenceDays", e.target.value === "" ? undefined : Math.max(0, Math.min(365, parseInt(e.target.value) || 0)))}
                            className="max-w-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Exploratory visits (optional)</Label>
                          <Textarea
                            value={getFormData("residencyIntentions.userVisa.exploratoryVisits.details") ?? ""}
                            onChange={(e) => updateFormData("residencyIntentions.userVisa.exploratoryVisits.details", e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Citizenship pathway interest</Label>
                          <Select
                            value={getFormData("residencyIntentions.userVisa.citizenshipInterest") ?? ""}
                            onValueChange={(v) => updateFormData("residencyIntentions.userVisa.citizenshipInterest", v)}
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
                      </div>
                    </div>
                  )}

                  {/* Dependents visa notes */}
                  {(s1_userNeeds_partnerNot || s2_userNot_partnerNeeds || s3_bothNeed) && anyDependentNeedsVisa && (
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
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Application timing preference</Label>
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
                          </div>
                    {/* Removed: Document preparation readiness */}
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

          {/* Exploratory Visits (optional facts) */}
          {
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
                <CardTitle className="text-xl flex items-center gap-3">
                  Exploratory Visits
                </CardTitle>
                <p className="text-sm text-muted-foreground">Planning visits before your main relocation</p>
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
                      I plan or I am open to making exploratory visits before relocating
                    </Label>
                  </div>

                  {(getFormData("residencyIntentions.residencyPlans.openToVisiting") ?? false) && (
                    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
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
          }

          {/* Background Disclosures */}
          <Card className="shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950/20">
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-600" />
                Background Disclosures
              </CardTitle>
              <p className="text-sm text-muted-foreground">Common visa and immigration background disclosures</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="has_criminal_record"
                    checked={criminalRecord}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.criminalRecord", !!v)}
                  />
                  <div>
                    <Label htmlFor="has_criminal_record" className="text-base font-medium">
                      I have a criminal record
                    </Label>
                  </div>
                </div>

                {criminalRecord && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Please provide brief details *</Label>
                    <Textarea
                      placeholder="Offense type, year, jurisdiction, sentence or disposition (e.g., expunged)"
                      value={criminalDetails}
                      onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.criminalDetails", e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="tax_compliance_issues"
                    checked={taxComplianceIssues}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.taxComplianceIssues", !!v)}
                  />
                  <div>
                    <Label htmlFor="tax_compliance_issues" className="text-base font-medium">
                      I have tax compliance issues
                    </Label>
                  </div>
                </div>

                {taxComplianceIssues && (
                  <div className="space-y-3">
                    <Label htmlFor="tax_compliance_explanation_in_criminal" className="text-base font-medium">
                      Tax compliance details
                    </Label>
                    <Textarea
                      id="tax_compliance_explanation_in_criminal"
                      placeholder="Brief details (missed filings, outstanding obligations, etc.)"
                      value={taxComplianceDetails}
                      onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.taxComplianceDetails", e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <Checkbox
                    id="previous_visa_denials"
                    checked={previousVisaDenials}
                    onCheckedChange={(v) => updateFormData("residencyIntentions.backgroundDisclosures.previousVisaDenials", !!v)}
                  />
                  <div>
                    <Label htmlFor="previous_visa_denials" className="text-base font-medium">
                      I have previous visa denials/immigration issues
                    </Label>
                  </div>
                </div>

                {previousVisaDenials && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Details about previous denials/issues</Label>
                    <Textarea
                      value={visaDenialDetails}
                      onChange={(e) => updateFormData("residencyIntentions.backgroundDisclosures.visaDenialDetails", e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>



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
              <Label className="text-base font-medium">Additional context/circumstances</Label>
              <Textarea
                value={motivationDetails}
                onChange={(e) => updateFormData("residencyIntentions.moveMotivationDetails", e.target.value)}
                placeholder="Optional"
                rows={4}
              />
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card className="shadow-md">
        <CardFooter className="pt-6">
          <div className="w-full space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <strong>⚠️ Please fix the following errors:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                  </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            

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