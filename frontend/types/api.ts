export interface UserPreferences {
  country: string;
  income: number;
  // Add other relevant user preference fields
}

export interface ApiResponse {
  recommendations: string[];
  // Add other response fields as needed
}

export interface TaxHighlights {
  personalIncomeTax: string;
  corporateTax: string;
  vatRate: string;
}

export interface Country {
  id: string;
  name: string;
  basedScore?: number;
  taxScore: number;
  visaAccessibility: number;
  population: number;
  gdpPerCapita: number;
  majorCities: Array<{
    name: string;
    population: number;
    based_score: number;
  }>;
  livingCost: number;
  taxDescription: string;
  livingCostDescription: string;
  qualityOfLifeDescription: string;
  taxHighlights: TaxHighlights;
}

export interface CountryDetails extends Country {
  overview: {
    tax_residency_rules: string;
    tax_year: string;
    currency: string;
    tax_authority: string;
    tax_filing_frequency: string;
    currency_exchange_rules: string;
  };
  tax_rates: {
    personal_income_tax: {
      rate: Array<{
        bracket: string;
        rate: string;
      }>;
      foreign_income_taxed: boolean;
      exemptions: string;
      social_security: string;
    };
    corporate_tax: {
      rate: string;
      small_business_rate: string;
      foreign_income_taxed: boolean;
      withholding_taxes: {
        dividends: string;
        interest: string;
        royalties: string;
      };
      deductions: string;
    };
    vat_gst: {
      rate: string;
      reduced_rate: string;
      exemptions: string;
    };
  };
  digital_nomad_visa?: {
    available: boolean;
    requirements: string;
    tax_benefits: string;
    duration: string;
  };
} 