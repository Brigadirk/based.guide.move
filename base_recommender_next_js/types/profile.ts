export interface ResidencyIntentions {
  moveType: string
  intendedCountry: string
  durationOfStay: string
  preferredMaximumStayRequirement: string
  notes: string
  // Additional fields that might be used
  duration?: string
  workType?: string
  income?: string
  familyRelocation?: boolean
  retirementPlanning?: boolean
  businessOpportunities?: boolean
  educationPurposes?: boolean
  lifestyle?: boolean
  taxation?: boolean
}

export interface PersonalInformation {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationalities: { country: string; willingToRenounce: boolean }[]
  currentResidency: {
    country: string
    status: string
    duration: string
  }
  maritalStatus: string
  hasPartner: boolean
  partnerInfo?: {
    firstName: string
    lastName: string
    dateOfBirth: string
    nationalities: { country: string; willingToRenounce: boolean }[]
    currentResidency: {
      country: string
      status: string
      duration: string
    }
  }
  dependents: Dependent[]
}

export interface Dependent {
  relationship: string
  relationshipDetails: {
    biologicalRelationTo: "user" | "partner" | "both" | "neither"
    legalRelationTo: "user" | "partner" | "both" | "neither"  
    custodialRelationTo: "user" | "partner" | "both" | "neither"
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

export interface EducationInformation {
  highestDegree: string
  fieldOfStudy: string
  institution: string
  country: string
  graduationYear: string
  additionalQualifications: string[]
  languageSkills: LanguageSkill[]
}

export interface LanguageSkill {
  language: string
  proficiency: string
  certification?: string
}

export interface FinancialInformation {
  incomeSituation: string
  incomeSources: IncomeSource[]
  expectedEmployment: ExpectedEmployment[]
  totalWealth: {
    currency: string
    total: number
    primaryResidence: number
  }
  capitalGains: {
    futureSales: CapitalGain[]
  }
  liabilities: Liability[]
  skipDetails?: boolean
}

export interface IncomeSource {
  category: string
  fields: Record<string, string>
  country: string
  amount: number
  currency: string
  continueInDestination: boolean
}

export interface ExpectedEmployment {
  category: string
  fields: Record<string, string>
  country: string
  expectedSalary: number
  currency: string
  timeline: string
  confidence: string
  notes: string
}

export interface CapitalGain {
  asset: string
  type: string
  holdingTime: string
  surplusValue: number
  currency: string
  reason: string
}

export interface Liability {
  category: string
  fields: Record<string, string>
  country: string
  amount: number
  currency: string
  paybackYears: number
  interestRate: number
}
