export interface ApiCountry {
  id: string
  name: string
  code: string
  flag: string
  region: string
  continent: string
}

// Re-export Country from country types for compatibility
export type { Country } from './country'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface AnalysisRequest {
  formData: Record<string, any>
  targetCountry: string
  userId?: string
}

export interface AnalysisResponse {
  analysis: CountryAnalysis
  recommendations: string[]
  score: number
}

export interface CountryAnalysis {
  id: string
  countryId: string
  countryName: string
  score: number
  taxScore: number
  costScore: number
  visaScore: number
  lifestyleScore: number
  overallScore: number
  personalTaxRate?: number
  costOfLivingAdjusted?: number
  recommendedVisaType?: string
  summary: string
  recommendations: string[]
  createdAt: string
  updatedAt: string
}
