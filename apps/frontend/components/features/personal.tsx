"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, UserPlus, Plus, Trash2, Users, Lightbulb, Home, Globe, Heart, Baby, Pencil, Check, User, Calendar, Clock, MapPin, Flag, CheckCircle, GraduationCap, School, BookOpen, Network, Copy, HelpCircle } from "lucide-react"

import { useFormStore } from "@/lib/stores"
import { SectionHint } from "@/components/ui/section-hint"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckInfoButton } from "@/components/ui/check-info-button"
import { SectionInfoModal } from "@/components/ui/section-info-modal"
import { SectionFooter } from "@/components/ui/section-footer"
import { ValidationAlert } from "@/components/ui/validation-alert"
import { useSectionInfo } from "@/lib/hooks/use-section-info"
import { hasEUCitizenship, getUserEUCountries } from "@/lib/utils/eu-utils"
import { getCountries } from "@/lib/utils/country-utils"

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
  const { isLoading: isCheckingInfo, currentStory, modalTitle, isModalOpen, currentSection, isFullView, showSectionInfo, closeModal, expandFullInformation, backToSection, goToSection, navigateToSection } = useSectionInfo()
  
  // Get full country list
  const countries = getCountries()

  // Basic Information
  const dob: string = getFormData("personalInformation.dateOfBirth") ?? ""
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateFormData("personalInformation.dateOfBirth", e.target.value)

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get a reasonable default birth date (30 years ago) for better UX (user & partner)
  const getDefaultBirthDate = () => {
    const today = new Date()
    const defaultYear = today.getFullYear() - 30
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${defaultYear}-${month}-${day}`
  }

  // Default birth date for dependents (10 years ago)
  const getDependentDefaultBirthDate = () => {
    const today = new Date()
    const defaultYear = today.getFullYear() - 10
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${defaultYear}-${month}-${day}`
  }

  // Helper function to calculate age from date of birth (in decimal years)
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    
    // Calculate age in milliseconds and convert to years
    const ageInMs = today.getTime() - birthDate.getTime()
    const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25) // Account for leap years
    
    return Math.max(0, ageInYears)
  }

  // Helper function to format age for display
  const formatAge = (ageInYears: number): string => {
    if (ageInYears < 1) {
      const months = Math.floor(ageInYears * 12)
      return `${months} month${months !== 1 ? 's' : ''}`
    } else if (ageInYears < 2) {
      return `${ageInYears.toFixed(1)} year${ageInYears >= 1.5 ? 's' : ''}`
    } else {
      return `${Math.floor(ageInYears)} year${ageInYears >= 2 ? 's' : ''}`
    }
  }

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

  // Initialize partner saved state based on existing data
  useEffect(() => {
    if (hasPartner) {
      const partnerInfo = getFormData("personalInformation.relocationPartnerInfo")
      const hasBasicPartnerData = partnerInfo && 
        partnerInfo.dateOfBirth && 
        partnerInfo.relationshipType && 
        partnerInfo.fullRelationshipDuration !== undefined &&
        partnerInfo.officialRelationshipDuration !== undefined &&
        partnerInfo.partnerNationalities &&
        partnerInfo.partnerNationalities.length > 0
      
      if (hasBasicPartnerData) {
        setPartnerSaved(true)
      }
    }
  }, [hasPartner]) // Only run when hasPartner changes or on initial load

  // Dependents
  type Dependent = {
    relationship: string
    relationshipDetails: {
      // Primary relationship
      biologicalRelationTo: "user" | "partner" | "both" | "neither"
      legalRelationTo: "user" | "partner" | "both" | "neither"  
      custodialRelationTo: "user" | "partner" | "both" | "neither"
      // Additional context
      isStepRelation?: boolean
      isAdopted?: boolean
      isLegalWard?: boolean
      guardianshipType?: "full" | "partial" | "temporary" | "none"
      additionalNotes?: string
    }
    dateOfBirth: string
    student: boolean
    nationalities: { country: string; willingToRenounce: boolean }[]
    currentResidency?: {
      country?: string
      status?: string
      duration?: string
    }
  }
  const depList: Dependent[] = getFormData("personalInformation.dependents") ?? []
  const updateDepList = (next: Dependent[]) => {
    updateFormData("personalInformation.dependents", next)
    // Debug logging to track dependent changes
    console.log("📝 Dependents updated:", next.length, "dependents")
  }
  
  // Function to clear all dependents
  const clearAllDependents = () => {
    updateDepList([])
    setVisibleDependents([])
    setEditingDependents([])
    setSavedDependents([])
    setAttemptedDependentSaves([])
    console.log("🗑️ All dependents cleared")
  }
  
  // Check for data consistency on component mount
  useEffect(() => {
    const storedDeps = getFormData("personalInformation.dependents") ?? []
    if (storedDeps.length > 0) {
      console.log("📊 Found", storedDeps.length, "dependents in storage:", storedDeps)
      // Initialize visible dependents if there are stored dependents
      if (visibleDependents.length === 0) {
        setVisibleDependents(storedDeps.map((_, idx) => idx))
      }
    }
  }, [])
  const [visibleDependents, setVisibleDependents] = useState<number[]>([])
  const [editingDependents, setEditingDependents] = useState<number[]>([])
  const [savedDependents, setSavedDependents] = useState<number[]>([])
  const [attemptedDependentSaves, setAttemptedDependentSaves] = useState<number[]>([])
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

  // Auto-save default relationship type when partner is enabled or marital status changes
  useEffect(() => {
    if (hasPartner) {
      const maritalStatus = getFormData("personalInformation.maritalStatus") ?? ""
      const currentRelationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? ""
      
      // If no relationship type is saved, auto-save the default
      if (!currentRelationshipType) {
        let defaultType = "Unmarried Partner" // fallback
        if (maritalStatus === "Married") defaultType = "Spouse"
        if (maritalStatus === "Official Partnership") defaultType = "Civil Partner"
        
        console.log("Auto-saving default relationship type:", defaultType)
        updateFormData("personalInformation.relocationPartnerInfo.relationshipType", defaultType)
      }
    }
  }, [hasPartner, getFormData("personalInformation.maritalStatus"), getFormData("personalInformation.relocationPartnerInfo.relationshipType")])

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
    
    console.log("DEBUG Partner Validation:")
    console.log("- partnerDob:", partnerDob)
    console.log("- relationshipType:", relationshipType)
    console.log("- fullDuration:", fullDuration)
    console.log("- officialDuration:", officialDuration)
    console.log("- partnerCountry:", partnerCountry)
    console.log("- partnerStatus:", partnerStatus)
    console.log("- partnerNationalities:", partnerNationalities)
    
    // Check each field individually for better debugging
    const dobValid = !!partnerDob
    const relationshipValid = !!relationshipType
    const fullDurationValid = fullDuration !== undefined && fullDuration !== null && fullDuration !== ""
    const officialDurationValid = officialDuration !== undefined && officialDuration !== null && officialDuration !== ""
    const durationLogicValid = !fullDurationValid || !officialDurationValid || (officialDuration <= fullDuration)
    const countryValid = !!partnerCountry
    const statusValid = !!partnerStatus
    const nationalitiesValid = partnerNationalities.length > 0
    
    console.log("- dobValid:", dobValid)
    console.log("- relationshipValid:", relationshipValid)
    console.log("- fullDurationValid:", fullDurationValid)
    console.log("- officialDurationValid:", officialDurationValid)
    console.log("- durationLogicValid:", durationLogicValid)
    console.log("- countryValid:", countryValid)
    console.log("- statusValid:", statusValid)
    console.log("- nationalitiesValid:", nationalitiesValid)
    
    const isValid = dobValid && relationshipValid && fullDurationValid && officialDurationValid && durationLogicValid && countryValid && statusValid && nationalitiesValid
    
    console.log("- isValid:", isValid)
    return isValid
  }

  const savePartnerInfo = () => {
    console.log("DEBUG: Attempting to save partner info")
    setAttemptedPartnerSave(true)
    const isValid = validatePartnerInfo()
    console.log("DEBUG: Validation result:", isValid)
    if (isValid) {
      console.log("DEBUG: Partner info is valid, saving...")
      setPartnerSaved(true)
      setEditingPartner(false)
      setAttemptedPartnerSave(false) // Reset after successful save
    } else {
      console.log("DEBUG: Partner info is NOT valid, showing errors")
    }
  }

  // Dependent validation function
  const validateDependentInfo = (depIndex: number) => {
    const dep = depList[depIndex]
    if (!dep) return false
    
    const dobValid = !!dep.dateOfBirth
    const relationshipValid = !!dep.relationship
    const countryValid = !!dep.currentResidency?.country
    const statusValid = !!dep.currentResidency?.status
    const durationValid = dep.currentResidency?.status === "Citizen" || 
                         (dep.currentResidency?.duration !== undefined && 
                          dep.currentResidency?.duration !== null && 
                          dep.currentResidency?.duration !== "")
    const nationalitiesValid = dep.nationalities && dep.nationalities.length > 0
    
    // Check if dependent's residence duration doesn't exceed their age
    const dependentAge = calculateAge(dep.dateOfBirth)
    const dependentDuration = parseFloat(dep.currentResidency?.duration || "0") || 0
    const ageValidForDuration = dep.currentResidency?.status === "Citizen" || !dep.dateOfBirth || dependentDuration <= dependentAge
    
    return dobValid && relationshipValid && countryValid && statusValid && durationValid && nationalitiesValid && ageValidForDuration
  }

  const saveDependentInfo = (depIndex: number) => {
    // Track that we attempted to save this dependent
    setAttemptedDependentSaves(prev => [...prev.filter(i => i !== depIndex), depIndex])
    
    if (validateDependentInfo(depIndex)) {
      setSavedDependents(prev => [...prev.filter(i => i !== depIndex), depIndex])
      setEditingDependents(prev => prev.filter(i => i !== depIndex))
      setAttemptedDependentSaves(prev => prev.filter(i => i !== depIndex))
    }
  }

  const editDependentInfo = (depIndex: number) => {
    setEditingDependents(prev => [...prev.filter(i => i !== depIndex), depIndex])
    setSavedDependents(prev => prev.filter(i => i !== depIndex))
  }

  const removeDependentInfo = (depIndex: number) => {
    const newDepList = depList.filter((_, idx) => idx !== depIndex)
    updateDepList(newDepList)
    
    // Clean up state arrays by removing this index and adjusting higher indices
    setVisibleDependents(prev => prev.filter(i => i !== depIndex).map(i => i > depIndex ? i - 1 : i))
    setEditingDependents(prev => prev.filter(i => i !== depIndex).map(i => i > depIndex ? i - 1 : i))
    setSavedDependents(prev => prev.filter(i => i !== depIndex).map(i => i > depIndex ? i - 1 : i))
    setAttemptedDependentSaves(prev => prev.filter(i => i !== depIndex).map(i => i > depIndex ? i - 1 : i))
  }

  // Validation
  // Check if all dependents are saved
  const allDependentsSaved = visibleDependents.every(idx => savedDependents.includes(idx))
  
  // Check if main person's residence duration doesn't exceed their age
  const userAge = calculateAge(dob)
  const currentDuration = parseFloat(tempDuration) || 0
  const mainPersonDurationValid = curStatus === "Citizen" || !dob || currentDuration <= userAge
  
  // Validation
  const errors = []
  if (!dob) errors.push("Date of birth is required")
  if (!curCountry) errors.push("Current residency country is required") 
  if (!curStatus) errors.push("Current residency status is required")
  if (natList.length === 0) errors.push("At least one citizenship is required")
  if (!maritalStatus) errors.push("Marital status is required")
  if (hasPartner && !partnerSaved) errors.push("Partner information must be completed and saved")
  if (!allDependentsSaved) errors.push("All dependents information must be completed and saved")
  if (!mainPersonDurationValid) errors.push("Duration in current status cannot exceed your age")
  
  const canContinue = errors.length === 0

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
                onFocus={(e) => {
                  // If the field is empty, set it to a reasonable default when focused
                  if (!dob) {
                    handleDobChange({ target: { value: getDefaultBirthDate() } } as React.ChangeEvent<HTMLInputElement>)
                  }
                }}
                max={getTodayDate()}
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
                  {countries.map((c) => (
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
              {(() => {
                const userAge = calculateAge(dob)
                const currentDuration = parseFloat(tempDuration) || 0
                const durationExceedsAge = dob && currentDuration > userAge
                
                return (
                  <>
                    <Input
                      type="number"
                      step="0.5"
                      min={0}
                      max={dob ? Math.ceil(userAge * 2) / 2 : 100} // Round up to nearest 0.5
                      placeholder="2.5"
                      className={`placeholder:!text-muted-foreground/60 ${durationExceedsAge ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={curStatus === "Citizen" ? "" : tempDuration}
                      onChange={(e) =>
                        updateFormData("personalInformation.currentResidency.duration", e.target.value)
                      }
                      disabled={curStatus === "Citizen"}
                    />
                    {durationExceedsAge && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Duration cannot exceed your age ({formatAge(userAge)})
                      </p>
                    )}
                    {dob && userAge > 0 && curStatus !== "Citizen" && !durationExceedsAge && (
                      <p className="text-xs text-muted-foreground">
                        Maximum: {Math.ceil(userAge * 2) / 2} years (your age: {formatAge(userAge)})
                      </p>
                    )}
                  </>
                )
              })()}
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
                <SelectValue placeholder="Add citizenship" />
              </SelectTrigger>
              <SelectContent>
                {countries.filter((c) => !nationalityExists(c)).map((c) => (
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

          {/* EU Citizenship Indicator */}
          {natList.length > 0 && hasEUCitizenship(natList) && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Globe className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                🇪🇺 <strong>You're an EU citizen!</strong> You have citizenship in: {getUserEUCountries(natList).join(", ")}
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
                  <Card className="shadow-lg border-2 border-pink-100 dark:border-pink-900/30 bg-gradient-to-br from-pink-50/50 via-white to-rose-50/30 dark:from-pink-950/20 dark:via-background dark:to-rose-950/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-pink-900 dark:text-pink-100">Partner Information</CardTitle>
                            <p className="text-sm text-pink-700 dark:text-pink-300 font-medium">
                              {getFormData("personalInformation.relocationPartnerInfo.relationshipType")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPartner(true)}
                          className="border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/20"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Personal Details */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-pink-100 dark:border-pink-900/50">
                            <h5 className="font-semibold text-pink-900 dark:text-pink-100 mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Personal Details
                            </h5>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                                  <p className="text-sm font-medium">{new Date(getFormData("personalInformation.relocationPartnerInfo.dateOfBirth")).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship Type</Label>
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    {getFormData("personalInformation.relocationPartnerInfo.relationshipType")}
                                    {getFormData("personalInformation.relocationPartnerInfo.sameSex") && (
                                      <Badge variant="outline" className="text-xs bg-rainbow-100 border-rainbow-300">
                                        Same-Sex
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Relationship Timeline */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-pink-100 dark:border-pink-900/50">
                            <h5 className="font-semibold text-pink-900 dark:text-pink-100 mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Relationship Timeline
                            </h5>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Duration</Label>
                                  <p className="text-sm font-medium">{getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration")} years together</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Official Duration</Label>
                                  <p className="text-sm font-medium">{getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration")} years official</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Residency */}
                      <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-pink-100 dark:border-pink-900/50">
                        <h5 className="font-semibold text-pink-900 dark:text-pink-100 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Current Residency
                        </h5>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                            <Globe className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {getFormData("personalInformation.relocationPartnerInfo.currentResidency.country")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getFormData("personalInformation.relocationPartnerInfo.currentResidency.status")}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Citizenships */}
                      <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-pink-100 dark:border-pink-900/50">
                        <h5 className="font-semibold text-pink-900 dark:text-pink-100 mb-3 flex items-center gap-2">
                          <Flag className="w-4 h-4" />
                          Citizenships
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {(getFormData("personalInformation.relocationPartnerInfo.partnerNationalities") || []).map((nat: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-800">
                              <Flag className="w-3 h-3 mr-1" />
                              {nat.country} 
                              {nat.willingToRenounce && (
                                <span className="ml-1 text-xs opacity-75">(willing to renounce)</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Relationship Proof Indicator */}
                      {getFormData("personalInformation.relocationPartnerInfo.canProveRelationship") && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800 dark:text-green-200">Documentation Available</p>
                              <p className="text-sm text-green-700 dark:text-green-300">Can provide relationship proof</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                    onFocus={(e) => {
                      // If the field is empty, set it to a reasonable default when focused
                      const currentValue = getFormData("personalInformation.relocationPartnerInfo.dateOfBirth") ?? ""
                      if (!currentValue) {
                        updateFormData("personalInformation.relocationPartnerInfo.dateOfBirth", getDefaultBirthDate())
                      }
                    }}
                    max={getTodayDate()}
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
                       // If no marital status set, default to non-married options only
                       return ["Unmarried Partner", "Fiancé(e)", "Cohabiting Partner", "Common-law Partner", "Conjugal Partner", "Other"]
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
                      className="placeholder:!text-muted-foreground/60"
                      value={getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration") ?? ""}
                      onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration", e.target.value === "" ? "" : parseFloat(e.target.value))}
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
                    {(() => {
                      const fullDuration = getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration") || 0
                      const officialDuration = getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration") || 0
                      const isInvalid = fullDuration > 0 && officialDuration > fullDuration
                      
                      return (
                        <>
                          <Input
                            type="number"
                            step="0.5"
                            min="0"
                            max={fullDuration || undefined}
                            placeholder="1.5"
                            className={`placeholder:!text-muted-foreground/60 ${isInvalid ? 'border-red-500 focus:ring-red-500' : ''}`}
                            value={getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration") ?? ""}
                            onChange={(e) => updateFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration", e.target.value === "" ? "" : parseFloat(e.target.value))}
                          />
                          {isInvalid && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Official duration cannot exceed total relationship duration ({fullDuration} years)
                            </p>
                          )}
                          {!isInvalid && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {(() => {
                                const relationshipType = getFormData("personalInformation.relocationPartnerInfo.relationshipType") ?? "Unmarried Partner"
                                if (relationshipType === "Spouse") return "How long you have been married"
                                if (relationshipType === "Fiancé(e)") return "How long you have been engaged"
                                if (relationshipType === "Civil Partner") return "How long you have been in a registered civil partnership"
                                if (relationshipType === "Domestic Partner") return "How long you have been in a registered domestic partnership"
                                if (relationshipType === "Unmarried Partner") return "How long you have been living together/cohabiting"
                                return "How long your relationship has been officially recognized"
                              })()}
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>
                                </div>

                {/* Relationship Proof */}
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                  <Checkbox
                    id="relationship_proof"
                    checked={getFormData("personalInformation.relocationPartnerInfo.canProveRelationship") ?? false}
                    onCheckedChange={(v) => updateFormData("personalInformation.relocationPartnerInfo.canProveRelationship", !!v)}
                  />
                  <Label htmlFor="relationship_proof" className="text-sm">
                    I can prove this relationship with documentation (photos, texts, joint accounts, etc.)
                  </Label>
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
                            {countries.map((c) => (
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
                                placeholder="2.5"
                                className="placeholder:!text-muted-foreground/60"
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
                        {countries.filter(c => {
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
                                         const fullDuration = getFormData("personalInformation.relocationPartnerInfo.fullRelationshipDuration")
                     const officialDuration = getFormData("personalInformation.relocationPartnerInfo.officialRelationshipDuration")
                     if (fullDuration === undefined || fullDuration === null || fullDuration === "") {
                       errors.push("Total relationship duration is required")
                     }
                     if (officialDuration === undefined || officialDuration === null || officialDuration === "") {
                       errors.push("Official relationship duration is required")
                     }
                     if (fullDuration > 0 && officialDuration > 0 && officialDuration > fullDuration) {
                       errors.push(`Official duration (${officialDuration} years) cannot exceed total relationship duration (${fullDuration} years)`)
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
            {/* Dependent cards and forms */}
            {depList.map((dep, idx) => {
              if (!visibleDependents.includes(idx)) return null
              
              const isEditing = editingDependents.includes(idx)
              const isSaved = savedDependents.includes(idx)
              const attemptedSave = attemptedDependentSaves.includes(idx)
              
              // Calculate proper dependent number based on position among visible dependents
              const dependentNumber = visibleDependents.filter(i => i <= idx).length
              
              // Show summary card if not editing
              if (!isEditing) {
                const citizenshipCount = dep.nationalities?.length || 0
                const formattedBirthDate = dep.dateOfBirth ? 
                  new Date(dep.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
                  "Not specified"
                
                return (
                  <Card key={idx} className="shadow-lg border-2 border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                            {dep.relationship === 'Child' ? (
                              <Baby className="w-6 h-6 text-white" />
                            ) : dep.relationship === 'Parent' ? (
                              <Users className="w-6 h-6 text-white" />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                              Dependent {dependentNumber}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
                                {dep.relationship}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {(() => {
                                  const details = dep.relationshipDetails
                                  if (!details) return "relationship not specified"
                                  
                                  const bio = details.biologicalRelationTo
                                  const legal = details.legalRelationTo  
                                  const custodial = details.custodialRelationTo
                                  
                                  // Simplified display logic for badges
                                  if (bio === "both" || legal === "both" || custodial === "both") return "to both"
                                  if (bio === "partner" || legal === "partner" || custodial === "partner") return "to partner"
                                  if (bio === "user" || legal === "user" || custodial === "user") return "to me"
                                  return "no direct relation"
                                })()}
                              </Badge>
                              {dep.student && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800">
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  Student
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingDependents([...editingDependents, idx])}
                            className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
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
                            className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/20 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Personal Information */}
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-blue-100 dark:border-blue-900/50">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Personal Info
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                                <p className="text-sm font-medium">{formattedBirthDate}</p>
                                <p className="text-xs text-muted-foreground">
                                  Age: {formatAge(calculateAge(dep.dateOfBirth))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Residency */}
                        {dep.currentResidency?.country && (
                          <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-blue-100 dark:border-blue-900/50">
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Current Residency
                            </h5>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-medium">{dep.currentResidency.country}</p>
                                <p className="text-sm text-muted-foreground">{dep.currentResidency.status}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Citizenships */}
                      <div className="p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-blue-100 dark:border-blue-900/50">
                        <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          <Flag className="w-4 h-4" />
                          Citizenships
                        </h5>
                        {citizenshipCount > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(dep.nationalities || []).map((nat: any, natIdx: number) => (
                              <Badge key={natIdx} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
                                <Flag className="w-3 h-3 mr-1" />
                                {nat.country}
                                {nat.willingToRenounce && (
                                  <span className="ml-1 text-xs opacity-75">(willing to renounce)</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No citizenships specified</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }
              
              // Show full form if editing
              return (
                <div key={idx} className="relative overflow-hidden rounded-2xl border border-blue-200/60 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 dark:from-blue-950/10 dark:via-background dark:to-indigo-950/10 shadow-xl">
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 px-6 py-4 border-b border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                          <Baby className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h5 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Dependent {dependentNumber}</h5>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {(() => {
                              const details = dep.relationshipDetails
                              if (!details) return "relationship not specified"
                              
                              const bio = details.biologicalRelationTo
                              const legal = details.legalRelationTo  
                              const custodial = details.custodialRelationTo
                              
                              // Simplified display logic for badges
                              if (bio === "both" || legal === "both" || custodial === "both") return "to both"
                              if (bio === "partner" || legal === "partner" || custodial === "partner") return "to partner"
                              if (bio === "user" || legal === "user" || custodial === "user") return "to me"
                              return "no direct relation"
                            })()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
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

                  {/* Form Content */}
                  <div className="p-6 space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-2 border-b border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <h6 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Basic Information</h6>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Date of birth */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <Label className="font-medium text-blue-900 dark:text-blue-100">Date of birth *</Label>
                          </div>
                          <Input
                            type="date"
                            value={dep.dateOfBirth}
                            max={getTodayDate()}
                            onChange={(e) => {
                              const updated = [...depList]
                              updated[idx] = { ...updated[idx], dateOfBirth: e.target.value }
                              updateDepList(updated)
                            }}
                            onFocus={(e) => {
                              // If the field is empty, set it to a reasonable default when focused
                              if (!dep.dateOfBirth) {
                                const updated = [...depList]
                                updated[idx] = { ...updated[idx], dateOfBirth: getDependentDefaultBirthDate() }
                                updateDepList(updated)
                              }
                            }}
                            className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
                          />
                        </div>

                        {/* Relationship */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <Label className="font-medium text-blue-900 dark:text-blue-100">Relationship type *</Label>
                          </div>
                          <Select
                            value={dep.relationship}
                            onValueChange={(v) => {
                              const updated = [...depList]
                              updated[idx] = { ...updated[idx], relationship: v }
                              updateDepList(updated)
                            }}
                          >
                            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Child">Child</SelectItem>
                              <SelectItem value="Parent">Parent</SelectItem>
                              <SelectItem value="Sibling">Sibling</SelectItem>
                              <SelectItem value="Legal Ward">Legal Ward</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Student status */}
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-stone-50/80 dark:bg-stone-900/30 border border-blue-100 dark:border-blue-800/50">
                        <Checkbox
                          id={`student_${idx}`}
                          checked={dep.student}
                          onCheckedChange={(v) => {
                            const updated = [...depList]
                            updated[idx] = { ...updated[idx], student: !!v }
                            updateDepList(updated)
                          }}
                        />
                        <Label htmlFor={`student_${idx}`} className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Is currently a student
                        </Label>
                      </div>
                    </div>

                {/* Relationship Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                      <Network className="w-4 h-4 text-white" />
                    </div>
                    <h6 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Relationship Details</h6>
                  </div>

                  {/* Core Relationship Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Biological Relationship */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <Label className="font-medium text-blue-900 dark:text-blue-100">Biological relationship</Label>
                      </div>
                      <Select
                        value={dep.relationshipDetails?.biologicalRelationTo ?? (hasPartner ? "both" : "user")}
                        onValueChange={(v: "user" | "partner" | "both" | "neither") => {
                          const updated = [...depList]
                          if (!updated[idx].relationshipDetails) {
                            updated[idx].relationshipDetails = {
                              biologicalRelationTo: "neither",
                              legalRelationTo: "neither", 
                              custodialRelationTo: "neither"
                            }
                          }
                          updated[idx].relationshipDetails.biologicalRelationTo = v
                          // If there is any biological relationship, "Adopted" cannot apply
                          if (v !== "neither") {
                            updated[idx].relationshipDetails.isAdopted = false
                          }
                          // Step-relationship only makes sense when exactly one party is biological (user or partner)
                          if (v === "both" || v === "neither") {
                            updated[idx].relationshipDetails.isStepRelation = false
                          }
                          updateDepList(updated)
                        }}
                      >
                        <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Me</SelectItem>
                          {hasPartner && <SelectItem value="partner">My partner</SelectItem>}
                          {hasPartner && <SelectItem value="both">Both of us</SelectItem>}
                          <SelectItem value="neither">Neither</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Legal Care Responsibility */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <Label className="font-medium text-blue-900 dark:text-blue-100">Legal care responsibility</Label>
                      </div>
                      <Select
                        value={dep.relationshipDetails?.custodialRelationTo ?? "both"}
                        onValueChange={(v: "user" | "partner" | "both" | "neither") => {
                          const updated = [...depList]
                          if (!updated[idx].relationshipDetails) {
                            updated[idx].relationshipDetails = {
                              biologicalRelationTo: "neither",
                              legalRelationTo: "neither", 
                              custodialRelationTo: "neither"
                            }
                          }
                          updated[idx].relationshipDetails.custodialRelationTo = v
                          updateDepList(updated)
                        }}
                      >
                        <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Me</SelectItem>
                          {hasPartner && <SelectItem value="partner">My partner</SelectItem>}
                          {hasPartner && <SelectItem value="both">Both of us</SelectItem>}
                          <SelectItem value="neither">Neither</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Relationship Type & Guardianship */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Relationship Subtype */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <Label className="font-medium text-blue-900 dark:text-blue-100">Relationship type</Label>
                      </div>
                      <Select
                        value={(() => {
                          const details = dep.relationshipDetails
                          if (details?.isAdopted) return "adopted"
                          if (details?.isLegalWard) return "ward"
                          if (details?.isStepRelation) return "step"
                          return "biological"
                        })()}
                        onValueChange={(v: "biological" | "step" | "adopted" | "ward" | "other") => {
                          const updated = [...depList]
                          if (!updated[idx].relationshipDetails) {
                            updated[idx].relationshipDetails = {
                              biologicalRelationTo: hasPartner ? "both" : "user",
                              legalRelationTo: "both", 
                              custodialRelationTo: "both"
                            }
                          }
                          updated[idx].relationshipDetails.isStepRelation = v === "step"
                          updated[idx].relationshipDetails.isAdopted = v === "adopted"
                          updated[idx].relationshipDetails.isLegalWard = v === "ward"
                          updateDepList(updated)
                        }}
                      >
                        <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biological">Biological</SelectItem>
                          {(() => {
                            const bio = dep.relationshipDetails?.biologicalRelationTo ?? (hasPartner ? "both" : "user")
                            const allowStep = bio === "user" || bio === "partner"
                            const allowAdopted = bio === "neither"
                            const allowWard = bio === "neither"
                            return (
                              <>
                                {allowStep && <SelectItem value="step">Step‑relationship</SelectItem>}
                                {allowAdopted && <SelectItem value="adopted">Adopted</SelectItem>}
                                {allowWard && <SelectItem value="ward">Legal ward</SelectItem>}
                              </>
                            )
                          })()}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        How government forms typically categorize this relationship
                      </p>
                    </div>

                    {/* Guardianship Type */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <Label className="font-medium text-blue-900 dark:text-blue-100">Guardianship type</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-blue-500 hover:text-blue-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">
                                The legal form of guardianship as documented by authorities. 
                                <strong>Full:</strong> Complete legal authority. 
                                <strong>Partial:</strong> Shared or limited authority. 
                                <strong>Temporary:</strong> Time-limited guardianship. 
                                Select what matches your official documentation.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select
                        value={dep.relationshipDetails?.guardianshipType ?? "none"}
                        onValueChange={(v: "full" | "partial" | "temporary" | "none") => {
                          const updated = [...depList]
                          if (!updated[idx].relationshipDetails) {
                            updated[idx].relationshipDetails = {
                              biologicalRelationTo: "neither",
                              legalRelationTo: "neither", 
                              custodialRelationTo: "neither"
                            }
                          }
                          updated[idx].relationshipDetails.guardianshipType = v
                          updateDepList(updated)
                        }}
                      >
                        <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No formal guardianship</SelectItem>
                          <SelectItem value="full">Full legal guardian</SelectItem>
                          <SelectItem value="partial">Partial guardian</SelectItem>
                          <SelectItem value="temporary">Temporary guardian</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Legal form of guardianship as documented by authorities
                      </p>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <Label className="font-medium text-blue-900 dark:text-blue-100">Additional notes (optional)</Label>
                    </div>
                    <Textarea
                      placeholder="Any additional context about this relationship that might be relevant for immigration purposes..."
                      value={dep.relationshipDetails?.additionalNotes ?? ""}
                      onChange={(e) => {
                        const updated = [...depList]
                        if (!updated[idx].relationshipDetails) {
                          updated[idx].relationshipDetails = {
                            biologicalRelationTo: "neither",
                            legalRelationTo: "neither", 
                            custodialRelationTo: "neither"
                          }
                        }
                        updated[idx].relationshipDetails.additionalNotes = e.target.value
                        updateDepList(updated)
                      }}
                      rows={3}
                      className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 resize-none"
                    />
                  </div>
                </div>

                    {/* Current Residency */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-sm">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <h6 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Current Residency</h6>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
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
                          <Copy className="w-4 h-4 mr-2" />
                          Same as mine
                        </Button>
                      </div>
                  
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <Label className="font-medium text-blue-900 dark:text-blue-100">Country *</Label>
                          </div>
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
                            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <Label className="font-medium text-blue-900 dark:text-blue-100">Residency status *</Label>
                          </div>
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
                            <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
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
                          const dependentAge = calculateAge(dep.dateOfBirth)
                          const dependentDuration = parseFloat(dep.currentResidency?.duration || "0") || 0
                          const durationExceedsAge = dep.dateOfBirth && dependentDuration > dependentAge
                          
                          return (
                            <div className={`space-y-3 ${dependentStatus === "Citizen" ? "opacity-50" : ""}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                <Label className="font-medium text-blue-900 dark:text-blue-100">
                                  Duration (years) {dependentStatus !== "Citizen" ? "*" : ""}
                                </Label>
                              </div>
                              <Input
                                type="number"
                                step="0.5"
                                min={0}
                                max={dep.dateOfBirth ? Math.ceil(dependentAge * 2) / 2 : 100} // Round up to nearest 0.5
                                placeholder="2.5"
                                className={`bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 placeholder:!text-muted-foreground/60 ${durationExceedsAge ? 'border-red-500 focus:ring-red-500' : ''}`}
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
                              {durationExceedsAge && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  Duration cannot exceed their age ({formatAge(dependentAge)})
                                </p>
                              )}
                              {dep.dateOfBirth && dependentAge > 0 && dependentStatus !== "Citizen" && !durationExceedsAge && (
                                <p className="text-xs text-muted-foreground">
                                  Maximum: {Math.ceil(dependentAge * 2) / 2} years (their age: {formatAge(dependentAge)})
                                </p>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Citizenships */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                            <Flag className="w-4 h-4 text-white" />
                          </div>
                          <h6 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Citizenships</h6>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
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
                          <Copy className="w-4 h-4 mr-2" />
                          Same as mine
                        </Button>
                      </div>

                      {/* Existing citizenships */}
                      {dep.nationalities && dep.nationalities.length > 0 && (
                        <div className="space-y-3">
                          {dep.nationalities.map((nat: any, natIdx: number) => (
                            <div key={natIdx} className="flex items-center justify-between p-4 rounded-lg bg-stone-50/80 dark:bg-stone-900/30 border border-blue-100 dark:border-blue-800/50">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="font-medium text-blue-900 dark:text-blue-100">{nat.country}</span>
                                </div>
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
                                  <Label htmlFor={`dep_${idx}_renounce_${natIdx}`} className="text-sm text-blue-700 dark:text-blue-300">
                                    Willing to give up?
                                  </Label>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <Label className="font-medium text-blue-900 dark:text-blue-100">Add citizenship</Label>
                        </div>
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
                          <SelectTrigger className="bg-stone-50 dark:bg-stone-900/50 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600">
                            <SelectValue placeholder="Select a country to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.filter(c => {
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
                  </div>
                  
                  {/* Save/Cancel buttons for editing form */}
                  {(() => {
                    const isValid = validateDependentInfo(idx)
                    const errors = []
                    
                    if (!dep.dateOfBirth) {
                      errors.push("Date of birth is required")
                    }
                    if (!dep.relationship) {
                      errors.push("Relationship to you is required")
                    }
                    if (!dep.currentResidency?.country) {
                      errors.push("Current residency country is required")
                    }
                                         if (!dep.currentResidency?.status) {
                       errors.push("Current residency status is required")
                     }
                     if (dep.currentResidency?.status && dep.currentResidency.status !== "Citizen" && 
                         (dep.currentResidency?.duration === undefined || dep.currentResidency?.duration === null || dep.currentResidency?.duration === "")) {
                       errors.push("Duration in current status is required")
                     }
                     const depNats = dep.nationalities || []
                     if (depNats.length === 0) {
                       errors.push("At least one citizenship is required")
                     }
                     
                     // Check age validation for residence duration
                     const dependentAge = calculateAge(dep.dateOfBirth)
                     const dependentDuration = parseFloat(dep.currentResidency?.duration || "0") || 0
                     if (dep.dateOfBirth && dep.currentResidency?.status !== "Citizen" && dependentDuration > dependentAge) {
                       errors.push(`Duration in current status (${dependentDuration} years) cannot exceed their age (${formatAge(dependentAge)})`)
                     }
                    
                    return (
                      <>
                        {errors.length > 0 && attemptedSave && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">Complete the following to save dependent information:</h5>
                            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                              {errors.map((error, errorIdx) => (
                                <li key={errorIdx}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-4 border-t border-blue-200/60 dark:border-blue-800/30">
                          <Button
                            size="sm"
                            onClick={() => saveDependentInfo(idx)}
                            disabled={!isValid}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:border-blue-500 dark:hover:border-blue-600 disabled:bg-blue-300 disabled:border-blue-300 dark:disabled:bg-blue-700 dark:disabled:border-blue-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Save Dependent Information
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30"
                            onClick={() => {
                              // If this dependent was never saved (not in savedDependents), remove it entirely
                              if (!savedDependents.includes(idx)) {
                                // Remove from visible dependents
                                setVisibleDependents(visibleDependents.filter((i: number) => i !== idx))
                                // Remove from data list  
                                const updated = depList.filter((_, i) => i !== idx)
                                updateDepList(updated)
                                // Clean up state arrays by adjusting indices
                                const adjustIndices = (arr: number[]) => 
                                  arr.map(i => i > idx ? i - 1 : i).filter(i => i !== idx)
                                setSavedDependents(adjustIndices(savedDependents))
                                setAttemptedDependentSaves(adjustIndices(attemptedDependentSaves))
                              }
                              // Remove from editing mode
                              setEditingDependents(editingDependents.filter((i: number) => i !== idx))
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )
             })}

            {/* Add Dependent Button - positioned after existing dependent cards */}
            {(() => {
              const hasUnsavedDependents = visibleDependents.some(idx => !savedDependents.includes(idx))
              
              return (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Add new dependent to data
                    const newDependent = {
                      relationship: "Child",
                      relationshipDetails: {
                        biologicalRelationTo: (hasPartner ? "both" : "user") as "user" | "partner" | "both" | "neither",
                        legalRelationTo: "both" as "user" | "partner" | "both" | "neither",
                        custodialRelationTo: "both" as "user" | "partner" | "both" | "neither",
                        isStepRelation: false,
                        isAdopted: false,
                        isLegalWard: false,
                        guardianshipType: "none" as "full" | "partial" | "temporary" | "none",
                        additionalNotes: ""
                      },
                      dateOfBirth: "",
                      student: false,
                      nationalities: [],
                      currentResidency: {
                        country: "",
                        status: "",
                        duration: ""
                      }
                    }
                    updateDepList([...depList, newDependent])
                    // Make this dependent form visible and editable
                    const newIndex = depList.length
                    setVisibleDependents([...visibleDependents, newIndex])
                    setEditingDependents([...editingDependents, newIndex])
                  }}
                  className="w-full"
                  disabled={hasUnsavedDependents}
                  title={hasUnsavedDependents ? "Please save or cancel the current dependent before adding another" : undefined}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dependent
                </Button>
              )
            })()}

            <p className="text-xs text-muted-foreground">
              Include children, elderly parents, or other family members who depend on your financial support and will move with you.
            </p>
            
            {/* Debug section - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Debug: {depList.length} dependents in store
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllDependents}
                  className="text-xs"
                >
                  Clear All Dependents (Debug)
                </Button>
              </div>
            )}
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
                    {!mainPersonDurationValid && <li>Residence duration cannot exceed your age ({formatAge(userAge)})</li>}
                    {hasPartner && !partnerSaved && <li>Complete and save partner information</li>}
                    {!allDependentsSaved && <li>Complete and save all dependent information</li>}
                  </ul>
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
              onCheckInfo={() => showSectionInfo("personal")}
              isCheckingInfo={isCheckingInfo}
              sectionId="personal"
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