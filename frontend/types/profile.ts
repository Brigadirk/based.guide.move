export interface Profile {
  email: string
  income: number | null
  occupation: string
  currentCountry: string
  interestedCountries: string[]
  taxPreferences: {
    maxTaxRate: number | null
    corporateTaxImportant: boolean
    vatImportant: boolean
  }
  lifestyle: {
    remoteWork: boolean
    costOfLiving: 'low' | 'medium' | 'high' | null
    climatePreference: 'warm' | 'cold' | 'moderate' | null
  }
}

export type ProfileSection = 'basic' | 'tax' | 'lifestyle'

export interface ProfileProgress {
  total: number
  completed: number
  sections: Record<ProfileSection, boolean>
} 