"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultFormData } from '@/lib/default-form-data'

export interface FormData {
  disclaimer?: {
    accepted: boolean
    dateAccepted: string
  }
  destination?: {
    country: string
    region: string
  }
  personalInformation?: {
    dateOfBirth: string
    nationalities: Array<{
      country: string
      willingToRenounce: boolean
    }>
    maritalStatus: string
    enduringMaritalStatusInfo: string
    currentResidency: {
      country: string
      status: string
      duration: string
    }
    partner?: {
      hasPartner: boolean
      sameSex: boolean
      partnerNationalities: Array<{
        country: string
        willingToRenounce: boolean
      }>
      officialRelationshipDuration: string
      unofficialRelationshipDuration: string
    }
    dependents: Array<{
      relationship: string
      age: number
      nationalities: Array<{
        country: string
        willingToRenounce: boolean
      }>
    }>
  }
  education?: {
    previousDegrees: Array<{
      degreeName: string
      institution: string
      startYear: number
      endYear: number
      inProgress: boolean
    }>
    visaSkills: Array<{
      skill: string
      credentialName: string
      credentialInstitute: string
    }>
    learningInterests: Array<{
      type: string
      hoursPerWeek: number
      months: number
      status: string
      institution: string
      funding: string
    }>
  }
  residencyIntentions?: {
    destinationCountry: {
      moveType: string
      intendedTemporaryDurationOfStay: string
      citizenshipStatus: string
    }
    residencyPlans: {
      applyForResidency: boolean
      maxMonthsWillingToReside: number
      openToVisiting: boolean
    }
    citizenshipPlans: {
      interestedInCitizenship: boolean
      willingToRenounceCurrent: boolean
      investmentCitizenship: boolean
      donationCitizenship: boolean
      militaryService: boolean
    }
    languageProficiency: {
      primaryLanguage: string
      otherLanguages: Array<{
        language: string
        proficiency: string
        teachingCapability: string
      }>
    }
    centerOfLife: {
      familyTies: boolean
      businessTies: boolean
      socialTies: boolean
    }
    moveMotivation: string
    taxCompliantEverywhere: boolean
  }
  finance?: {
    skipTaxSections: boolean
    totalWealth?: {
      total: number
      currency: string
      primary_residence: number
    }
    incomeStatus?: string
    capitalGains: {
      hasGains: boolean
      futureSales: Array<{
        asset: string
        expectedGain: number
        holdingPeriod: string
      }>
    }
    incomeSources: Array<{
      category: string
      fields: string[]
      country: string
      amount: number
      currency: string
      continueInDestination: boolean
    }>
    liabilities: Array<{
      category: string
      fields: string[]
      country: string
      amount: number
      currency: string
      interestRate: number
      paybackTimeline: string
    }>
  }
  socialSecurityAndPensions?: {
    currentCountryContributions: {
      isContributing?: boolean
      country: string
      yearsOfContribution: number
    }
    futurePensionContributions: {
      isPlanning: boolean
      details: Array<{
        pensionType: string
        country: string
        expectedAmount: number
        startDate: string
      }>
    }
  }
  taxDeductionsAndCredits?: {
    potentialDeductions: Array<{
      type: string
      category: string
      country: string
      amount: number
      description: string
    }>
  }
  futureFinancialPlans?: {
    plannedInvestments: Array<{
      type: string
      country: string
      estimatedValue: number
    }>
    businessPlans: Array<{
      type: string
      country: string
      estimatedInvestment: number
    }>
    retirementPlans: Array<{
      country: string
      estimatedAmount: number
      timeline: string
    }>
  }
  additionalInformation?: {
    notes: string
    specialCircumstances: string
    specialSections: Array<{
      theme: string
      content: string
      dateAdded: string
      dateUpdated?: string
    }>
  }
  completedSections?: Record<string, boolean>
}

interface FormStoreState {
  formData: FormData
  currentSection: number
  updateFormData: (path: string, value: any) => void
  getFormData: (path: string) => any
  markSectionComplete: (sectionId: string) => void
  isSectionComplete: (sectionId: string) => boolean
  hasRequiredData: (sectionId: string) => boolean
  isSectionMarkedComplete: (sectionId: string) => boolean
  completedSections: Record<string, boolean>
  setCurrentSection: (section: number) => void
  resetFormData: () => void
}

// Helper function to set nested values
const setNestedValue = (obj: any, path: string, value: any): any => {
  const keys = path.split('.')
  const result = { ...obj }
  let current = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current) || typeof current[keys[i]] !== 'object' || current[keys[i]] === null) {
      current[keys[i]] = {}
    } else {
      current[keys[i]] = { ...current[keys[i]] }
    }
    current = current[keys[i]]
  }
  
  current[keys[keys.length - 1]] = value
  return result
}

// Helper function to get nested values
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return current
}

// Helper function to check if section has required data
const hasRequiredDataForSection = (sectionId: string, formData: FormData): boolean => {
  switch (sectionId) {
    case "disclaimer":
      return formData.disclaimer?.accepted === true
    case "destination":
      const hasCountry = formData.destination?.country && formData.destination.country.trim() !== ""
      const hasRegion = formData.destination?.region && formData.destination.region.trim() !== ""
      return !!(hasCountry && hasRegion)
    case "personal":
      return !!(formData.personalInformation?.dateOfBirth && 
               formData.personalInformation.dateOfBirth.trim() !== "" &&
               formData.personalInformation?.nationalities?.length > 0)
    case "education":
      return !!formData.completedSections?.education // Must be explicitly completed
    case "residency":
      return !!(formData.residencyIntentions?.destinationCountry?.moveType &&
               formData.residencyIntentions.destinationCountry.moveType.trim() !== "")
    case "finance":
      return !!(formData.finance?.totalWealth?.total !== undefined && formData.finance.totalWealth.total > 0)
    case "social-security":
      return !!formData.completedSections?.["social-security"] // Must be explicitly completed
    case "tax-deductions":
      return !!formData.completedSections?.["tax-deductions"] // Must be explicitly completed
    case "future-plans":
      return !!formData.completedSections?.["future-plans"] // Must be explicitly completed
    case "additional":
      return !!formData.completedSections?.additional // Must be explicitly completed
    case "summary":
      return true // Always accessible
    default:
      return false
  }
}

export const useFormStore = create<FormStoreState>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      currentSection: 0,
      
      updateFormData: (path: string, value: any) => {
        set((state) => {
          const newFormData = setNestedValue(state.formData, path, value)
          
          // Notify listeners that form data changed (maintaining compatibility)
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("formDataChange", { 
              detail: { path, value, newData: newFormData } 
            }))
          }
          
          return { formData: newFormData }
        })
      },
      
      getFormData: (path: string) => {
        return getNestedValue(get().formData, path)
      },
      
      markSectionComplete: (sectionId: string) => {
        set((state) => ({
          formData: setNestedValue(state.formData, `completedSections.${sectionId}`, true)
        }))
      },
      
      isSectionComplete: (sectionId: string) => {
        return !!get().formData.completedSections?.[sectionId]
      },
      
      hasRequiredData: (sectionId: string) => {
        return hasRequiredDataForSection(sectionId, get().formData)
      },
      
      isSectionMarkedComplete: (sectionId: string) => {
        return !!get().formData.completedSections?.[sectionId]
      },
      
      get completedSections() {
        return get().formData.completedSections ?? {}
      },
      
      setCurrentSection: (section: number) => {
        set({ currentSection: section })
      },
      
      resetFormData: () => {
        set({ formData: defaultFormData, currentSection: 0 })
      }
    }),
    {
      name: 'base-recommender-form-data',
      version: 1,
      skipHydration: true, // Skip automatic hydration to avoid SSR conflicts
      partialize: (state) => ({
        // Only persist the data we need, not functions
        formData: state.formData,
        currentSection: state.currentSection
      }),
      onRehydrateStorage: (state) => {
        console.log('🔄 Hydration starting...')
        return (state, error) => {
          if (error) {
            console.error('❌ Hydration failed:', error)
            // Clear corrupted data and reset to defaults
            if (typeof window !== 'undefined') {
              localStorage.removeItem('base-recommender-form-data')
            }
          } else {
            console.log('✅ Hydration successful')
          }
        }
      },
    }
  )
)

 