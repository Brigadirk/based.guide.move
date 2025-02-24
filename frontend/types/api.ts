export interface UserPreferences {
  country: string;
  income: number;
  // Add other relevant user preference fields
}

export interface ApiResponse {
  recommendations: string[];
  // Add other response fields as needed
}

export interface Country {
  id: string
  name: string
  taxScore: number
  livingCost: number
  taxDescription: string
  livingCostDescription: string
  qualityOfLifeDescription: string
  taxHighlights: {
    personalIncomeTax: string
    corporateTax: string
    vatRate?: string
    [key: string]: string | undefined  // Fixed index signature
  }
} 