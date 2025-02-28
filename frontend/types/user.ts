import { Profile } from './profile'

export interface CountryAnalysis {
  country_id: string;
  personal_tax_rate: number | null;
  corporate_tax_rate: number | null;
  visa_eligibility: boolean | null;
  recommended_visa_type: string | null;
  cost_of_living_adjusted: number | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  isMember?: boolean;
  analysisTokens?: number;
  analyzedCountries?: CountryAnalysis[];
  profile?: Profile;
} 