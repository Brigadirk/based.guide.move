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
  id: string;
  name: string;
  taxDescription: string;
  taxHighlights: {
    personalIncomeTax: string;
    corporateTax: string;
    vatRate?: string;
  };
  visaOptions: string[];
  costOfLiving: 'Low' | 'Medium' | 'High' | 'Very High';
  climate: string;
} 