/**
 * Country-related type definitions
 */

export interface Country {
  id: string;
  name: string;
  region: string;
  flag_emoji: string;
  flag_png: string;
  capital: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  languages: string[];
  population: number;
  area_sq_km: number;
  timezones: string[];
  calling_codes: string[];
  tld: string[];
  visa_requirements: {
    [key: string]: {
      visa_required: boolean;
      details?: string;
    };
  };
  tax_system: {
    income_tax_rate: number;
    corporate_tax_rate: number;
    vat_rate: number;
    wealth_tax: boolean;
    capital_gains_tax_rate: number;
  };
  cost_of_living_index: number;
  healthcare_system: string;
  education_system: string;
  quality_of_life_index: number;
  safety_index: number;
  internet_speed_mbps: number;
  climate: string;
  major_industries: string[];
  popular_visa_types: {
    type: string;
    description: string;
    requirements: string[];
    processing_time: string;
    cost: string;
  }[];
  digital_nomad_visa: boolean;
  golden_visa: boolean;
  citizenship_by_investment: boolean;
  residency_by_investment: boolean;
  notes?: string;
  scores?: {
    tax: number;
    visa: number;
    overall: number;
  };
}

export interface CountryScore {
  countryId: string;
  overallScore: number;
  taxScore: number;
  visaScore: number;
  costOfLivingScore: number;
  qualityOfLifeScore: number;
}

export interface CountryComparison {
  countries: Country[];
  scores: CountryScore[];
  criteria: string[];
}
