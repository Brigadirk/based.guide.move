import { CountryAnalysis } from '@/types/user';

export const mockAnalysis: CountryAnalysis & {
  id: string;
  score: number;
  originCountry: {
    id: string;
    name: string;
  };
  intentions: {
    duration: string;
    workType: string;
    income: string;
  };
} = {
  id: 'mock-analysis-id',
  countryId: 'portugal',
  personalTaxRate: 15,
  corporateTaxRate: 20,
  costOfLivingAdjusted: 1500,
  recommendedVisaType: 'Tourist',
  createdAt: new Date().toISOString(),
  visaEligibility: true,
  updatedAt: new Date().toISOString(),
  score: 85,
  originCountry: {
    id: 'united',
    name: 'United States'
  },
  intentions: {
    duration: '1-2 years',
    workType: 'Remote work for foreign company',
    income: '$100,000 - $150,000'
  }
}; 