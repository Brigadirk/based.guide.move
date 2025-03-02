import { Profile } from './profile'

export interface CountryAnalysis {
  countryId: string;
  personalTaxRate: number | null;
  corporateTaxRate: number | null;
  visaEligibility: boolean | null;
  recommendedVisaType: string | null;
  costOfLivingAdjusted: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  isMember?: boolean;
  analysisTokens?: number;
  analyzedCountries?: CountryAnalysis[];
  profile?: Profile;
}

// Type for raw API response
export interface UserApiResponse {
  id: string;
  email: string;
  is_member?: boolean;
  analysis_tokens?: number;
  analyzed_countries?: Array<{
    country_id: string;
    personal_tax_rate: number | null;
    corporate_tax_rate: number | null;
    visa_eligibility: boolean | null;
    recommended_visa_type: string | null;
    cost_of_living_adjusted: number | null;
    created_at: string;
    updated_at: string;
  }>;
  profile?: Profile;
} 