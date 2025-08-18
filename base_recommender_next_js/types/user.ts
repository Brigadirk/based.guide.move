export interface CountryAnalysis {
  id: string
  countryId: string
  countryName: string
  createdAt: string
  score: number
  personalTaxRate?: number | null
  costOfLivingAdjusted?: number | null
  recommendedVisaType?: string | null
  originCountry?: {
    id: string
    name: string
  }
  intentions?: {
    duration: string
    workType: string
    income: string
  }
  // Additional analysis fields
  overallScore?: number
  taxScore?: number
  costScore?: number
  visaScore?: number
  lifestyleScore?: number
  summary?: string
  recommendations?: string[]
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
  hasMembership: boolean
  bananaBalance: number
}

export interface UserProfile {
  userId: string
  formData: Record<string, any>
  completedSections: string[]
  createdAt: string
  updatedAt: string
}
