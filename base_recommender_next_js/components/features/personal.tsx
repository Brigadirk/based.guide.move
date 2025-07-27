"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, UserPlus, Plus, Trash2, Users, Lightbulb, Home, Globe, Heart, Baby, Pencil, Check } from "lucide-react"
import countryInfo from "@/data/country_info.json"
import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

// Hooks can't run outside components – compute once as a plain constant.
const COUNTRY_LIST = Object.keys(countryInfo).sort()

const RESIDENCY_OPTIONS = ["Citizen", "Permanent Resident", "Temporary Resident", "Work Visa", "Student Visa", "Refugee", "Other"] as const
const MARITAL_OPTIONS = [
  "Single",
  "Official Partnership",
  "Married",
  "Divorced",
  "Widowed",
] as const

export function PersonalInformation({ onComplete }: { onComplete: () => void }) {
  const { getFormData, updateFormData, markSectionComplete } = useFormStore()

  // Basic Information
  const dob: string = getFormData("personalInformation.dateOfBirth") ?? ""
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFormData("personalInformation.dateOfBirth", e.target.value)

  // Current Residence
  const curCountry: string = getFormData("personalInformation.currentResidency.country") ?? ""
  const curStatus: string = getFormData("personalInformation.currentResidency.status") ?? ""
  const tempDuration: string = getFormData("personalInformation.currentResidency.duration") ?? ""

  // Nationalities
  const natList: { country: string; willingToRenounce: boolean }[] =
    getFormData("personalInformation.nationalities") ?? []
  const updateNatList = (next: typeof natList) =>
    updateFormData("personalInformation.nationalities", next)

  // Marital Status
  const maritalStatus: string =
    getFormData("personalInformation.maritalStatus") || MARITAL_OPTIONS[0]
  const setMarital = (val: string) =>
    updateFormData("personalInformation.maritalStatus", val)

  // Partner
  const hasPartner = getFormData("personalInformation.relocationPartner") || false
  const [partnerSaved, setPartnerSaved] = useState(false)
  const [editingPartner, setEditingPartner] = useState(false)
  const [attemptedPartnerSave, setAttemptedPartnerSave] = useState(false)

  // Dependents
  type Dependent = {
    relationship: string
    dateOfBirth: string
    student: boolean
    nationalities: { country: string; willingToRenounce: boolean }[]
  }
  const depList: Dependent[] = getFormData("personalInformation.dependents") ?? []
  const updateDepList = (next: Dependent[]) =>
    updateFormData("personalInformation.dependents", next)
  const [visibleDependents, setVisibleDependents] = useState<number[]>([])
  const [editingDependents, setEditingDependents] = useState<number[]>([])
  const [addCountry, setAddCountry] = useState("")

  // Local state
  const [partnerSel, setPartnerSel] = useState("")

  // Auto-citizenship management (matches Streamlit logic exactly)
  useEffect(() => {
    let updatedNationalities = [...natList]
    
    // Convert old format (list of strings) to new format (list of dicts) if needed
    if (updatedNationalities.length > 0 && typeof updatedNationalities[0] === 'string') {
      updatedNationalities = updatedNationalities.map((nat: any) => 
        typeof nat === 'string' ? { country: nat, willingToRenounce: false } : nat
      )
    }
    
    // Remove any empty country fields
    updatedNationalities = updatedNationalities.filter(n => n.country)
    
    const nationalityExists = (country: string) =>
      updatedNationalities.some((n) => n.country === country)
    
    if (curCountry && curStatus === "Citizen") {
      // If current country is not in list, add it at the beginning
      if (!nationalityExists(curCountry)) {
        updatedNationalities.unshift({ country: curCountry, willingToRenounce: false })
      } else {
        // If it exists but not first, move it to the beginning
        updatedNationalities = updatedNationalities.filter(n => n.country !== curCountry)
        updatedNationalities.unshift({ country: curCountry, willingToRenounce: false })
      }
    } else if (curCountry && curStatus !== "Citizen") {
      // Remove current country from nationalities if user is not a citizen there
      updatedNationalities = updatedNationalities.filter(n => n.country !== curCountry)
    }
    
    // Only update if there are actual changes
    if (JSON.stringify(updatedNationalities) !== JSON.stringify(natList)) {
      updateNatList(updatedNationalities)
    }
  }, [curCountry, curStatus, natList])

  // Auto-citizenship for partner
  useEffect(() => {
    const partnerCountry = getFormData("personalInformation.relocationPartnerInfo.currentResidency.country") ?? ""
    const partnerStatus = getFormData("personalInformation.relocationPartnerInfo.currentResidency.status") ?? ""
    const partnerNats = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") ?? []
    
    if (!partnerCountry || !partnerStatus) return
    
    let updatedPartnerNats = [...partnerNats]
    
    if (partnerStatus === "Citizen") {
      // Add partner's current country as citizenship if not already present
      if (!updatedPartnerNats.find((n: any) => n.country === partnerCountry)) {
        updatedPartnerNats.unshift({ country: partnerCountry, willingToRenounce: false })
        updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", updatedPartnerNats)
      }
    } else {
      // Remove partner's current country from citizenships if not a citizen
      const filteredNats = updatedPartnerNats.filter((n: any) => n.country !== partnerCountry)
      if (filteredNats.length !== updatedPartnerNats.length) {
        updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", filteredNats)
      }
    }
  }, [getFormData("personalInformation.relocationPartnerInfo.currentResidency.country"), getFormData("personalInformation.relocationPartnerInfo.currentResidency.status"), getFormData("personalInformation.relocationPartnerInfo.partnerNationalities")])

  // Auto-citizenship for dependents
  useEffect(() => {
    let hasChanges = false
    const updatedDepList = [...depList]
    
    depList.forEach((dep: any, idx: number) => {
      const depCountry = dep.currentResidency?.country
      const depStatus = dep.currentResidency?.status
      const depNats = dep.nationalities || []
      
      if (!depCountry || !depStatus) return
      
      if (depStatus === "Citizen") {
        // Add dependent's current country as citizenship if not already present
        if (!depNats.find((n: any) => n.country === depCountry)) {
          updatedDepList[idx] = {
            ...dep,
            nationalities: [{ country: depCountry, willingToRenounce: false }, ...depNats]
          }
          hasChanges = true
        }
      } else {
        // Remove dependent's current country from citizenships if not a citizen
        const filteredNats = depNats.filter((n: any) => n.country !== depCountry)
        if (filteredNats.length !== depNats.length) {
          updatedDepList[idx] = {
            ...dep,
            nationalities: filteredNats
          }
          hasChanges = true
        }
      }
    })
    
    if (hasChanges) {
      updateDepList(updatedDepList)
    }
  }, [depList.map((dep: any) => `${dep.currentResidency?.country}-${dep.currentResidency?.status}-${JSON.stringify(dep.nationalities)}`).join(',')])

  // Clear partner info when partner checkbox is unchecked
  useEffect(() => {
    if (!hasPartner) {
      // Only clear if there's actually partner data to clear (to avoid unnecessary updates)
      const currentPartnerInfo = getFormData("personalInformation.relocationPartnerInfo")
      if (currentPartnerInfo && Object.keys(currentPartnerInfo).length > 0) {
        updateFormData("personalInformation.relocationPartnerInfo", null)
        setPartnerSaved(false)
        setEditingPartner(false)
        setAttemptedPartnerSave(false)
      }
    }
  }, [hasPartner])

  // Clear incompatible relationship type when marital status changes
  useEffect(() => {
    const maritalStatus = getFormData("personalInformation.maritalStatus") ?? ""
    const currentRelationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? ""
    
    if (!maritalStatus || !currentRelationshipType) return
    
    // Check if current relationship type is incompatible with marital status
    const isIncompatible = () => {
      if (maritalStatus === "Married" && currentRelationshipType !== "Spouse") return true
      if (maritalStatus === "Official Partnership" && !["Civil Partner", "Domestic Partner"].includes(currentRelationshipType)) return true
      if (["Single", "Divorced", "Widowed"].includes(maritalStatus) && ["Spouse", "Civil Partner", "Domestic Partner"].includes(currentRelationshipType)) return true
      return false
    }
    
    if (isIncompatible()) {
      // Clear the incompatible relationship type
      updateFormData("personalInformation.relocationPartnerInfo.relationshipType", "")
    }
  }, [getFormData("personalInformation.maritalStatus")])

  // Partner validation function
  const validatePartnerInfo = () => {
    if (!hasPartner) return true
    
    const partnerDob = getFormData("personalInformation.relocationPartnerInfo.dateOfBirth")
    const relationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType")
    const fullDuration = getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration")
    const officialDuration = getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration")
    const partnerCountry = getFormData("personalInformation.relocationPartnerInfo.currentResidency.country")
    const partnerStatus = getFormData("personalInformation.relocationPartnerInfo.currentResidency.status")
    const partnerNationalities = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") || []
    
    return partnerDob && 
           relationshipType && 
           (fullDuration || fullDuration === 0) && 
           (officialDuration || officialDuration === 0) && 
           partnerCountry && 
           partnerStatus && 
           partnerNationalities.length > 0
  }

  const savePartnerInfo = () => {
    setAttemptedPartnerSave(true)
    if (validatePartnerInfo()) {
      setPartnerSaved(true)
      setEditingPartner(false)
      setAttemptedPartnerSave(false) // Reset after successful save
    }
  }

  // Validation
  const canContinue = dob && curCountry && curStatus && natList.length > 0 && maritalStatus && (!hasPartner || partnerSaved)

  const nationalityExists = (country: string) =>
    natList.some((n) => n.country === country)

  const handleComplete = () => {
    markSectionComplete("personal")
    onComplete()
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center pb-4 border-b">
        <div className="flex items-center justify-center gap-3 mb-4">
          <UserPlus className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Personal Information</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us about yourself to determine visa eligibility, tax obligations, and residency requirements
        </p>
      </div>

      <SectionHint title="About this section">
        Accurate personal and family information enables country-specific tax residency analysis, spousal/dependent visa eligibility checks, and tailored planning based on your household composition.
      </SectionHint>

      {/* Basic Information Card */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <CalendarDays className="w-6 h-6 text-primary" />
            Basic Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your personal details for age verification and tax purposes</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Date of birth *</Label>
              <p className="text-sm text-muted-foreground">
                Your date of birth affects tax credits, retirement options, and age-related benefits.
              </p>
              <Input
                type="date"
                value={dob}
                onChange={handleDobChange}
                className="max-w-xs"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Residence Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Home className="w-6 h-6 text-blue-600" />
            Current Residence
          </CardTitle>
          <p className="text-sm text-muted-foreground">Where you currently live and pay taxes</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-base font-medium">Country *</Label>
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
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Residency status *</Label>
              <Select
                value={curStatus}
                onValueChange={(val) =>
                  updateFormData("personalInformation.currentResidency.status", val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENCY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={`space-y-2 ${curStatus === "Citizen" ? "opacity-50" : ""}`}>
              <Label className="text-sm font-medium">
                Duration (years) {curStatus !== "Citizen" ? "*" : ""}
              </Label>
              <Input
                type="number"
                step="0.5"
                min={0}
                max={100}
                placeholder="e.g., 2.5"
                value={curStatus === "Citizen" ? "" : tempDuration}
                onChange={(e) =>
                  updateFormData("personalInformation.currentResidency.duration", e.target.value)
                }
                disabled={curStatus === "Citizen"}
              />
            </div>
          </div>
          
          {curStatus && curStatus !== "Citizen" && (
            <p className="text-sm text-muted-foreground mt-4">
              Length of time in your current residency status affects tax and visa eligibility.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Citizenship Card */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Globe className="w-6 h-6 text-green-600" />
            Citizenship(s)
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your passport(s) and potential renunciation preferences</p>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="mb-6">
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Mark "willing to renounce" if you would consider giving up a citizenship to avoid exit taxes or dual-citizenship restrictions in your future country.
            </AlertDescription>
          </Alert>

          {/* Add citizenship */}
          <div className="flex gap-3 mb-6">
            <Select value={addCountry} onValueChange={setAddCountry}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add additional citizenship" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.filter((c) => !nationalityExists(c)).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              disabled={!addCountry}
              onClick={() => {
                updateNatList([...natList, { country: addCountry, willingToRenounce: false }])
                setAddCountry("")
              }}
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Citizenship list */}
          {natList.length > 0 ? (
            <div className="space-y-3">
              {natList.map((nat) => (
                <div
                  key={nat.country}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{nat.country}</span>
                    {curCountry === nat.country && curStatus === "Citizen" && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`renounce_${nat.country}`}
                        checked={nat.willingToRenounce}
                        onCheckedChange={(val) => {
                          nat.willingToRenounce = !!val
                          updateNatList([...natList])
                        }}
                      />
                                                         <Label htmlFor={`renounce_${nat.country}`} className="text-sm">
                                     Willing to give up?
                                   </Label>
                    </div>
                    {!(curCountry === nat.country && curStatus === "Citizen") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateNatList(natList.filter((n) => n.country !== nat.country))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ You must be a citizen of at least one country!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Family Status Card */}
      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Heart className="w-6 h-6 text-purple-600" />
            Family Status
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your marital status and family composition</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium">Marital status *</Label>
              <p className="text-sm text-muted-foreground">
                Your marital status affects tax filing status and immigration options.
              </p>
              <Select value={maritalStatus} onValueChange={setMarital}>
                <SelectTrigger className="max-w-xs">
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
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
              <Checkbox
                id="has_partner"
                checked={hasPartner}
                onCheckedChange={(v) => {
                  updateFormData("personalInformation.relocationPartner", !!v)
                  // Clear partner info if unchecked
                  if (!v) {
                    updateFormData("personalInformation.relocationPartnerInfo", null)
                    setPartnerSaved(false)
                    setEditingPartner(false)
                    setAttemptedPartnerSave(false)
                  }
                }}
              />
              <Label htmlFor="has_partner" className="text-base font-medium">
                I have a partner who will relocate with me
              </Label>
            </div>

            {/* Partner Information Form */}
            {hasPartner && (
              <>
                {/* Partner Card Display (when saved) */}
                {partnerSaved && !editingPartner && (
                  <div className="p-6 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg">Partner Information</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPartner(true)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                          <p className="text-base">{getFormData("personalInformation.relocationPartnerInfo.dateOfBirth")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Relationship Type</Label>
                          <p className="text-base">{getFormData("personalInformation.relocationPartnerInfo.relationshipType")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Same-Sex Relationship</Label>
                          <p className="text-base">{getFormData("personalInformation.relocationPartnerInfo.sameSex") ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Relationship Duration</Label>
                          <p className="text-base">{getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration")} years</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Official Duration</Label>
                          <p className="text-base">{getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration")} years</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Current Residency</Label>
                          <p className="text-base">
                            {getFormData("personalInformation.relocationPartnerInfo.currentResidency.country")} 
                            ({getFormData("personalInformation.relocationPartnerInfo.currentResidency.status")})
                          </p>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Citizenships</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") || []).map((nat: any, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {nat.country} {nat.willingToRenounce && "(willing to renounce)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Partner Form (when editing or not saved) */}
                {(!partnerSaved || editingPartner) && (
              <div className="space-y-6 p-6 border rounded-lg bg-card">
                <h4 className="font-medium text-lg">Partner Information</h4>
                
                {/* Partner Date of Birth */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Partner's date of birth *</Label>
                  <p className="text-sm text-muted-foreground">
                    Your partner's age affects visa eligibility and age-related benefits.
                  </p>
                  <Input
                    type="date"
                    value={getFormData("personalInformation.relocationPartnerInfo.dateOfBirth") ?? ""}
                    onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.dateOfBirth", e.target.value)}
                    className="max-w-xs"
                    required
                  />
                </div>
                
                {/* Relationship Type */}
                                 <div className="space-y-4">
                   <Label className="text-base font-medium">Relationship type *</Label>
                   
                   {/* Learn more about relationship types */}
                   <Accordion type="single" collapsible>
                     <AccordionItem value="relationship-types" className="border rounded-lg">
                       <AccordionTrigger className="px-4 hover:no-underline">
                         <div className="flex items-center gap-2">
                           <Lightbulb className="w-5 h-5 text-blue-600" />
                           <span className="font-medium text-blue-800 dark:text-blue-200">
                                                             Learn more about relationship types
                           </span>
                         </div>
                       </AccordionTrigger>
                       <AccordionContent className="px-4 pb-4">
                         <div className="text-sm text-muted-foreground space-y-3">
                           <p className="font-medium">This list covers the main categories recognized in various immigration systems:</p>
                           <div className="space-y-2">
                             <p><strong>1. Spouse:</strong> Refers to legally married partners, which is the most widely recognized category.</p>
                             <p><strong>2. Fiancé(e):</strong> Included for those engaged to be married, often eligible for specific visas.</p>
                             <p><strong>3. Civil Partner:</strong> Kept for jurisdictions that recognize this status.</p>
                             <p><strong>4. Unmarried Partner:</strong> A common term in immigration contexts for long-term, committed relationships.</p>
                             <p><strong>5. Common-law Partner:</strong> Recognized in some countries for long-term cohabiting couples.</p>
                             <p><strong>6. Cohabiting Partner:</strong> Retained from your original list, as some systems specifically use this term.</p>
                             <p><strong>7. Domestic Partner:</strong> Added for jurisdictions that recognize this status.</p>
                             <p><strong>8. Conjugal Partner:</strong> Recognized in some immigration systems (e.g., Canada) for committed partners unable to live together.</p>
                             <p><strong>9. Other:</strong> Kept to cover any unique situations or relationships not fitting the above categories.</p>
                           </div>
                           <p className="italic text-xs">This expanded list aims to be more inclusive of various relationship types recognized across different immigration systems while maintaining clarity for users.</p>
                         </div>
                       </AccordionContent>
                     </AccordionItem>
                   </Accordion>
                   
                   {(() => {
                     const maritalStatus = getFormData("personalInformation.maritalStatus") ?? ""
                     const currentRelationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? ""
                     

                     
                     // Auto-select appropriate relationship type based on marital status
                     const getDefaultRelationshipType = () => {
                       if (maritalStatus === "Married") return "Spouse"
                       if (maritalStatus === "Official Partnership") return "Civil Partner"
                       return currentRelationshipType || "Unmarried Partner"
                     }
                     
                     // Get allowed relationship types based on marital status
                     const getAllowedRelationshipTypes = () => {
                       if (maritalStatus === "Married") {
                         return ["Spouse"]
                       }
                       if (maritalStatus === "Official Partnership") {
                         return ["Civil Partner", "Domestic Partner"]
                       }
                       if (["Single", "Divorced", "Widowed"].includes(maritalStatus)) {
                         return ["Unmarried Partner", "Fiancé(e)", "Cohabiting Partner", "Common-law Partner", "Conjugal Partner", "Other"]
                       }
                       // If no marital status set, allow all
                       return ["Unmarried Partner", "Spouse", "Fiancé(e)", "Civil Partner", "Cohabiting Partner", "Common-law Partner", "Conjugal Partner", "Domestic Partner", "Other"]
                     }
                     
                     const allowedTypes = getAllowedRelationshipTypes()
                     
                     return (
                       <Select
                         value={currentRelationshipType || getDefaultRelationshipType()}
                         onValueChange={(v) => updateFormData("personalInformation.relocationPartnerInfo.relationshipType", v)}
                       >
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {allowedTypes.map((type) => (
                             <SelectItem key={type} value={type}>
                               {type}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     )
                   })()}
                   
                   {/* Other relationship type input */}
                   {getFormData("personalInformation.relocationPartnerInfo.relationshipType") === "Other" && (
                     <div className="space-y-2">
                       <Label className="text-base font-medium">Please explain your relationship type *</Label>
                       <Input
                         placeholder="Enter your specific relationship type"
                         value={getFormData("personalInformation.relocationPartnerInfo.otherRelationshipType") ?? ""}
                         onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.otherRelationshipType", e.target.value)}
                       />
                     </div>
                   )}
                 </div>

                {/* Same-sex relationship */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="same_sex"
                      checked={getFormData("personalInformation.relocationPartnerInfo.sameSex") ?? false}
                      onCheckedChange={(v) => updateFormData("personalInformation.relocationPartnerInfo.sameSex", !!v)}
                    />
                    <Label htmlFor="same_sex" className="text-base">
                      This is a same-sex relationship
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    This may affect how some countries see your union.
                  </p>
                </div>



                {/* Relationship duration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Total relationship duration (years) *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="2.5"
                      value={getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration") ?? ""}
                      onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {(() => {
                        const relationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? "Unmarried Partner"
                        if (relationshipType === "Spouse") return "Marriage duration (years) *"
                        if (relationshipType === "Fiancé(e)") return "Engagement duration (years) *"
                        if (relationshipType.includes("Partner")) return "Living together duration (years) *"
                        return "Official relationship duration (years) *"
                      })()}
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="1.5"
                      value={getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration") ?? ""}
                      onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration", parseFloat(e.target.value) || 0)}
                    />
                                       </div>
                   </div>
 
                   {/* Relationship Status Messages and Conflict Detection */}
                   {(() => {
                     const relationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? "Unmarried Partner"
                     const maritalStatus = getFormData("personalInformation.maritalStatus") ?? ""
                     
                     // Case 1: Simple matching cases - success messages
                     if (relationshipType === "Spouse" && maritalStatus === "Married") {
                       return (
                         <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                           <p className="text-sm text-green-800 dark:text-green-200">
                             ✅ You are married to your relocation partner
                           </p>
                         </div>
                       )
                     }
                     
                     if (["Civil Partner", "Domestic Partner"].includes(relationshipType) && maritalStatus === "Official Partnership") {
                       return (
                         <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                           <p className="text-sm text-green-800 dark:text-green-200">
                             ✅ You are in an official partnership with your relocation partner as {relationshipType}
                           </p>
                         </div>
                       )
                     }
                     
                     
                     
                     // Case 2: Inconsistent states requiring explanation - error messages
                     if (relationshipType === "Spouse" && maritalStatus !== "Married") {
                       return (
                         <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                           <p className="text-sm text-red-800 dark:text-red-200">
                             ⚠️ Your relationship type is 'Spouse' but your marital status is not 'Married'. Please update your marital status.
                           </p>
                         </div>
                       )
                     }
                     
                     if (["Civil Partner", "Domestic Partner"].includes(relationshipType) && maritalStatus !== "Official Partnership") {
                       return (
                         <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                           <p className="text-sm text-red-800 dark:text-red-200">
                             ⚠️ Your relationship type is '{relationshipType}' but your marital status is not 'Official Partnership'. Please update your marital status.
                           </p>
                         </div>
                       )
                     }
                     
                     // Case 3: Complex cases requiring explanation
                     if (maritalStatus === "Married" && relationshipType !== "Spouse") {
                       return (
                         <div className="space-y-4">
                           <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                             <CardContent className="pt-4">
                               <div className="flex items-start gap-2">
                                 <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                 <div>
                                   <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                     Being married while bringing an unmarried partner requires explanation
                                   </h4>
                                   <p className="text-sm text-amber-700 dark:text-amber-300">
                                     Many countries require proof that any prior marriages have been dissolved 
                                     (e.g., divorce certificates) when applying for visas based on relationships. 
                                     This ensures compliance with requirements like "any previous relationship has broken down permanently"
                                   </p>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                           <div className="space-y-2">
                             <Label className="text-base font-medium">Please explain your situation *</Label>
                             <Input
                               placeholder="E.g. separated and divorce in progress?"
                               value={getFormData("personalInformation.enduringMaritalStatusInfo") ?? ""}
                               onChange={(e) => updateFormData("personalInformation.enduringMaritalStatusInfo", e.target.value)}
                             />
                           </div>
                         </div>
                       )
                     }
                     
                     if (maritalStatus === "Official Partnership" && !["Civil Partner", "Domestic Partner"].includes(relationshipType)) {
                       return (
                         <div className="space-y-4">
                           <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                             <CardContent className="pt-4">
                               <div className="flex items-start gap-2">
                                 <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                 <div>
                                   <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                     Being in an official partnership while bringing a different partner requires explanation
                                   </h4>
                                   <p className="text-sm text-amber-700 dark:text-amber-300">
                                     You'll need to explain your current partnership status and how it relates to your 
                                     relocation partner relationship. Some countries may require the official partnership 
                                     to be dissolved before recognizing a new relationship.
                                   </p>
                                 </div>
                               </div>
                             </CardContent>
                           </Card>
                           <div className="space-y-2">
                             <Label className="text-base font-medium">Please explain your situation *</Label>
                             <Input
                               placeholder="E.g. partnership dissolution in progress?"
                               value={getFormData("personalInformation.enduringMaritalStatusInfo") ?? ""}
                               onChange={(e) => updateFormData("personalInformation.enduringMaritalStatusInfo", e.target.value)}
                             />
                           </div>
                         </div>
                       )
                     }
                     
                     return null
                   })()}
 
                   {/* Partner Current Residency */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Partner Current Residency *</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Copy main user's residency info to partner
                          updateFormData("personalInformation.relocationPartnerInfo.currentResidency.country", curCountry)
                          updateFormData("personalInformation.relocationPartnerInfo.currentResidency.status", curStatus)
                          updateFormData("personalInformation.relocationPartnerInfo.currentResidency.duration", tempDuration)
                        }}
                      >
                        Same as mine
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Country *</Label>
                        <Select
                          value={getFormData("personalInformation.relocationPartnerInfo.currentResidency.country") ?? ""}
                          onValueChange={(val) =>
                            updateFormData("personalInformation.relocationPartnerInfo.currentResidency.country", val)
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
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base font-medium">Residency status *</Label>
                        <Select
                          value={getFormData("personalInformation.relocationPartnerInfo.currentResidency.status") ?? ""}
                          onValueChange={(val) =>
                            updateFormData("personalInformation.relocationPartnerInfo.currentResidency.status", val)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Citizen">Citizen</SelectItem>
                            <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                            <SelectItem value="Temporary Resident">Temporary Resident</SelectItem>
                            <SelectItem value="Work Visa">Work Visa</SelectItem>
                            <SelectItem value="Student Visa">Student Visa</SelectItem>

                            <SelectItem value="Refugee">Refugee</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                       {(() => {
                        const partnerStatus = getFormData("personalInformation.relocationPartnerInfo.currentResidency.status") ?? ""
                        return (
                          <div className={`space-y-2 ${partnerStatus === "Citizen" ? "opacity-50" : ""}`}>
                            <Label className="text-sm font-medium">
                              Duration (years) {partnerStatus !== "Citizen" ? "*" : ""}
                            </Label>
                            <Input
                              type="number"
                              step="0.5"
                              min={0}
                              max={100}
                              placeholder="e.g., 2.5"
                              value={partnerStatus === "Citizen" ? "" : getFormData("personalInformation.relocationPartnerInfo.currentResidency.duration") ?? ""}
                              onChange={(e) =>
                                updateFormData("personalInformation.relocationPartnerInfo.currentResidency.duration", e.target.value)
                              }
                              disabled={partnerStatus === "Citizen"}
                            />
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Partner citizenships */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Partner Citizenships *</h5>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Copy main user's citizenships to partner
                        updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", [...natList])
                      }}
                    >
                      Same as mine
                    </Button>
                  </div>

                  
                  {/* Existing partner citizenships */}
                  {(() => {
                    const partnerNats = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") ?? []
                    return partnerNats.length > 0 && (
                      <div className="space-y-2">
                        {partnerNats.map((nat: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{nat.country}</span>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`partner_renounce_${idx}`}
                                  checked={nat.willingToRenounce ?? false}
                                  onCheckedChange={(v) => {
                                    const updated = [...partnerNats]
                                    updated[idx] = { ...updated[idx], willingToRenounce: !!v }
                                    updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", updated)
                                  }}
                                />
                                <Label htmlFor={`partner_renounce_${idx}`} className="text-sm">
                                  Willing to renounce
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = partnerNats.filter((_: any, i: number) => i !== idx)
                                updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", updated)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Add partner citizenship */}
                  <div className="flex gap-2">
                    <Select
                      value={partnerSel}
                      onValueChange={setPartnerSel}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add partner citizenship" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_LIST.filter(c => {
                          const partnerNats = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") ?? []
                          return !partnerNats.some((n: any) => n.country === c)
                        }).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      disabled={!partnerSel}
                      onClick={() => {
                        if (partnerSel) {
                          const current = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") ?? []
                          updateFormData("personalInformation.relocationPartnerInfo.partnerNationalities", [
                            ...current,
                            { country: partnerSel, willingToRenounce: false }
                          ])
                          setPartnerSel("")
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Save Partner Information Button */}
                <div className="space-y-4">
                  {(() => {
                    const isValid = validatePartnerInfo()
                    const errors = []
                    
                    if (!getFormData("personalInformation.relocationPartnerInfo.dateOfBirth")) {
                      errors.push("Partner's date of birth is required")
                    }
                    if (!getFormData("personalInformation.relocationPartnerInfo.relationshipType")) {
                      errors.push("Relationship type is required")
                    }
                    if (!getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration") && getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration") !== 0) {
                      errors.push("Total relationship duration is required")
                    }
                    if (!getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration") && getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration") !== 0) {
                      errors.push("Official relationship duration is required")
                    }
                    if (!getFormData("personalInformation.relocationPartnerInfo.currentResidency.country")) {
                      errors.push("Partner's current residency country is required")
                    }
                    if (!getFormData("personalInformation.relocationPartnerInfo.currentResidency.status")) {
                      errors.push("Partner's residency status is required")
                    }
                    const partnerNats = getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") || []
                    if (partnerNats.length === 0) {
                      errors.push("At least one citizenship is required for partner")
                    }
                    
                                         return (
                       <>
                         {errors.length > 0 && attemptedPartnerSave && (
                           <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                             <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Complete the following to save partner information:</h5>
                             <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                               {errors.map((error, idx) => (
                                 <li key={idx}>• {error}</li>
                               ))}
                             </ul>
                           </div>
                         )}
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={savePartnerInfo}
                            disabled={!isValid}
                            className="flex-1"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Save Partner Information
                          </Button>
                          {editingPartner && (
                                                         <Button
                               variant="outline"
                               onClick={() => {
                                 setEditingPartner(false)
                                 setPartnerSaved(true)
                                 setAttemptedPartnerSave(false)
                               }}
                             >
                               Cancel
                             </Button>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dependents Card */}
      <Card className="shadow-sm border-l-4 border-l-orange-500">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20">
          <CardTitle className="text-xl flex items-center gap-3">
            <Baby className="w-6 h-6 text-orange-600" />
            Dependents
          </CardTitle>
          <p className="text-sm text-muted-foreground">Family members who will relocate with you and depend on your support</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Add Dependent Button - only show if we can add more */}
            <Button
              variant="outline"
              onClick={() => {
                // Add new dependent to data
                const newDependent = {
                  relationship: "Child",
                  dateOfBirth: "",
                  student: false,
                  nationalities: []
                }
                updateDepList([...depList, newDependent])
                // Make this dependent form visible and editable
                const newIndex = depList.length
                setVisibleDependents([...visibleDependents, newIndex])
                setEditingDependents([...editingDependents, newIndex])
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Dependent{depList.length > 0 ? ` ${depList.length + 1}` : ''}
            </Button>

                        {/* Dependent cards and forms */}
            {depList.map((dep, idx) => {
              if (!visibleDependents.includes(idx)) return null
              
              const isEditing = editingDependents.includes(idx)
              
              // Show summary card if not editing
              if (!isEditing) {
                return (
                  <div key={idx} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary">Dependent {idx + 1}</Badge>
                          <Badge variant="outline">{dep.relationship}</Badge>
                          {dep.student && <Badge variant="outline">Student</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Born: {dep.dateOfBirth || "Not specified"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Citizenships: {dep.nationalities?.length || 0} countries
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDependents([...editingDependents, idx])}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Remove from all state
                            setVisibleDependents(visibleDependents.filter((i: number) => i !== idx))
                            setEditingDependents(editingDependents.filter((i: number) => i !== idx))
                            // Remove from data list  
                            const updated = depList.filter((_, i) => i !== idx)
                            updateDepList(updated)
                            // Adjust indices for remaining dependents
                            setVisibleDependents((prev: number[]) => prev.map((i: number) => i > idx ? i - 1 : i).filter((i: number) => i !== idx))
                            setEditingDependents((prev: number[]) => prev.map((i: number) => i > idx ? i - 1 : i).filter((i: number) => i !== idx))
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              }
              
              // Show full form if editing
              return (
                <div key={idx} className="p-6 border rounded-lg bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-lg">Dependent {idx + 1}</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Remove from all state
                        setVisibleDependents(visibleDependents.filter((i: number) => i !== idx))
                        setEditingDependents(editingDependents.filter((i: number) => i !== idx))
                        // Remove from data list  
                        const updated = depList.filter((_, i) => i !== idx)
                        updateDepList(updated)
                        // Adjust indices for remaining dependents
                        setVisibleDependents((prev: number[]) => prev.map((i: number) => i > idx ? i - 1 : i).filter((i: number) => i !== idx))
                        setEditingDependents((prev: number[]) => prev.map((i: number) => i > idx ? i - 1 : i).filter((i: number) => i !== idx))
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Date of birth */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Date of birth *</Label>
                    <Input
                      type="date"
                      value={dep.dateOfBirth}
                      onChange={(e) => {
                        const updated = [...depList]
                        updated[idx] = { ...updated[idx], dateOfBirth: e.target.value }
                        updateDepList(updated)
                      }}
                    />
                  </div>

                  {/* Relationship */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Relationship to you *</Label>
                    <Select
                      value={dep.relationship}
                      onValueChange={(v) => {
                        const updated = [...depList]
                        updated[idx] = { ...updated[idx], relationship: v }
                        updateDepList(updated)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Legal Ward (I am)">Legal Ward (I am guardian)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Student status */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`student_${idx}`}
                    checked={dep.student}
                    onCheckedChange={(v) => {
                      const updated = [...depList]
                      updated[idx] = { ...updated[idx], student: !!v }
                      updateDepList(updated)
                    }}
                  />
                  <Label htmlFor={`student_${idx}`} className="text-base">
                    Is a student
                  </Label>
                </div>

                {/* Current Residency */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h6 className="font-medium">Current Residency *</h6>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Copy main user's residency info to dependent
                        const updated = [...depList]
                        updated[idx] = { 
                          ...updated[idx], 
                          currentResidency: {
                            country: curCountry,
                            status: curStatus,
                            duration: tempDuration
                          }
                        }
                        updateDepList(updated)
                      }}
                    >
                      Same as mine
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Country *</Label>
                      <Select
                        value={dep.currentResidency?.country ?? ""}
                        onValueChange={(val) => {
                          const updated = [...depList]
                          updated[idx] = { 
                            ...updated[idx], 
                            currentResidency: { ...updated[idx].currentResidency, country: val }
                          }
                          updateDepList(updated)
                        }}
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
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Residency status *</Label>
                      <Select
                        value={dep.currentResidency?.status ?? ""}
                        onValueChange={(val) => {
                          const updated = [...depList]
                          updated[idx] = { 
                            ...updated[idx], 
                            currentResidency: { ...updated[idx].currentResidency, status: val }
                          }
                          updateDepList(updated)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Citizen">Citizen</SelectItem>
                          <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                          <SelectItem value="Temporary Resident">Temporary Resident</SelectItem>
                          <SelectItem value="Work Visa">Work Visa</SelectItem>
                          <SelectItem value="Student Visa">Student Visa</SelectItem>

                          <SelectItem value="Refugee">Refugee</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(() => {
                      const dependentStatus = dep.currentResidency?.status ?? ""
                      return (
                        <div className={`space-y-2 ${dependentStatus === "Citizen" ? "opacity-50" : ""}`}>
                          <Label className="text-sm font-medium">
                            Duration (years) {dependentStatus !== "Citizen" ? "*" : ""}
                          </Label>
                          <Input
                            type="number"
                            step="0.5"
                            min={0}
                            max={100}
                            placeholder="e.g., 2.5"
                            value={dependentStatus === "Citizen" ? "" : dep.currentResidency?.duration ?? ""}
                            onChange={(e) => {
                              const updated = [...depList]
                              updated[idx] = { 
                                ...updated[idx], 
                                currentResidency: { ...updated[idx].currentResidency, duration: e.target.value }
                              }
                              updateDepList(updated)
                            }}
                            disabled={dependentStatus === "Citizen"}
                          />
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Citizenships */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Citizenships *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Copy main user's citizenships to dependent
                        const updated = [...depList]
                        updated[idx] = { 
                          ...updated[idx], 
                          nationalities: [...natList]
                        }
                        updateDepList(updated)
                      }}
                    >
                      Same as mine
                    </Button>
                  </div>

                  
                  {/* Existing citizenships */}
                  {dep.nationalities && dep.nationalities.length > 0 && (
                    <div className="space-y-2">
                      {dep.nationalities.map((nat: any, natIdx: number) => (
                        <div key={natIdx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{nat.country}</span>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`dep_${idx}_renounce_${natIdx}`}
                                checked={nat.willingToRenounce ?? false}
                                onCheckedChange={(v) => {
                                  const updated = [...depList]
                                  const updatedNats = [...(updated[idx].nationalities || [])]
                                  updatedNats[natIdx] = { ...updatedNats[natIdx], willingToRenounce: !!v }
                                  updated[idx] = { ...updated[idx], nationalities: updatedNats }
                                  updateDepList(updated)
                                }}
                              />
                              <Label htmlFor={`dep_${idx}_renounce_${natIdx}`} className="text-sm">
                                Willing to give up?
                              </Label>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                              onClick={() => {
                                const updated = [...depList]
                                const updatedNats = (updated[idx].nationalities || []).filter((_: any, i: number) => i !== natIdx)
                                updated[idx] = { ...updated[idx], nationalities: updatedNats }
                                updateDepList(updated)
                              }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add citizenship */}
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(country) => {
                        if (country) {
                          const updated = [...depList]
                          const currentNats = updated[idx].nationalities || []
                          if (!currentNats.some((n: any) => n.country === country)) {
                            updated[idx] = {
                              ...updated[idx],
                              nationalities: [...currentNats, { country, willingToRenounce: false }]
                            }
                            updateDepList(updated)
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Add citizenship" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_LIST.filter(c => {
                          const currentNats = dep.nationalities || []
                          return !currentNats.some((n: any) => n.country === c)
                        }).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                                  </div>
                  
                  {/* Save/Cancel buttons for editing form */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => setEditingDependents(editingDependents.filter((i: number) => i !== idx))}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDependents(editingDependents.filter((i: number) => i !== idx))}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
               )
             })}

            <p className="text-xs text-muted-foreground">
              Include children, elderly parents, or other family members who depend on your financial support and will move with you.
            </p>
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
                    {!dob && <li>Date of birth</li>}
                    {!curCountry && <li>Country of current residence</li>}
                    {!curStatus && <li>Current residency status</li>}
                    {natList.length === 0 && <li>At least one citizenship</li>}
                    {!maritalStatus && <li>Marital status</li>}
                    {curStatus === "Temporary Resident" && !tempDuration && <li>Years at current residence</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button
              disabled={!canContinue}
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Continue to Education
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 